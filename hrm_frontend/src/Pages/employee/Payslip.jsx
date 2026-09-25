import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Download, Eye, Calendar, TrendingUp, FileText, CreditCard, X } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";
import { employeeApi } from "../../services/api";

const Payslip = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [viewingPayslip, setViewingPayslip] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
    else navigate("/login");
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const getMyPayslips = async () => {
        setIsLoading(true);
        try {
          const response = await employeeApi.getPayslips();
          setPayslips(response.data || []);
        } catch (e) {
          console.error("Failed to load payslips:", e);
        } finally {
          setIsLoading(false);
        }
      };
      getMyPayslips();
    }
  }, [user]);

  const handleDownload = (p) => alert(`Downloading payslip for ${p.month}`);

  const getMonthName = (m) => ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m] || "";

  if (!user) return null;

  const lastNet = payslips.length > 0 ? payslips[0].netSalary : 0;
  const totalNet = payslips.reduce((acc, p) => acc + p.netSalary, 0);
  const avgNet = payslips.length > 0 ? Math.round(totalNet / payslips.length) : 0;

  return (
    <PageLayout
      role="employee"
      activePage="Payslip"
      title="Payslip"
      subtitle="View and download your salary payslips"
      actions={
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-employee-500 bg-white">
          <option>2026</option><option>2025</option><option>2024</option>
        </select>
      }
    >
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            { label: "Last Salary",   value: `Rs. ${lastNet.toLocaleString()}`, icon: <CreditCard size={20} />, edge: "border-t-emerald-600", chip: "bg-emerald-50 text-emerald-700", sub: payslips.length > 0 ? `${getMonthName(payslips[0].month)} ${payslips[0].year}` : "N/A" },
            { label: "Avg. Monthly",  value: `Rs. ${avgNet.toLocaleString()}`, icon: <TrendingUp size={20} />, edge: "border-t-teal-500", chip: "bg-teal-50 text-teal-700", sub: "All time" },
            { label: "Total Earnings",  value: `Rs. ${totalNet.toLocaleString()}`, icon: <DollarSign size={20} />, edge: "border-t-amber-500", chip: "bg-amber-50 text-amber-700", sub: "Year to date" },
            { label: "Total Payslips",value: payslips.length, icon: <FileText size={20} />, edge: "border-t-slate-700", chip: "bg-slate-100 text-slate-700", sub: "Available" },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br from-white to-employee-50 border border-employee-100 border-t-4 ${s.edge} p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300`}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-slate-500 text-sm font-medium">{s.label}</p>
                <div className={`${s.chip} p-2.5 rounded-lg`}>{s.icon}</div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-slate-400 text-xs mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Payslip list */}
        <div className="bg-gradient-to-br from-white to-employee-50 rounded-xl border border-employee-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-3 mb-5">
            <span className="bg-emerald-50 p-2 rounded-lg"><FileText size={20} className="text-emerald-600" /></span> Payslip History
          </h2>
          <div className="space-y-4">
            {payslips.map(p => (
              <div key={p.id} className="bg-white/70 border border-employee-100 rounded-lg p-5 hover:border-employee-200 hover:bg-white transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                      <Calendar size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{getMonthName(p.month)} {p.year}</h3>
                      <p className="text-sm text-slate-500">Status: {p.status || "PAID"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm flex-1 md:ml-6 bg-employee-50/60 border border-employee-100 rounded-lg p-4">
                    <div><p className="text-slate-400 text-xs mb-0.5">Basic</p><p className="font-semibold text-slate-800">Rs. {p.basicSalary.toLocaleString()}</p></div>
                    <div><p className="text-slate-400 text-xs mb-0.5">Allowances</p><p className="font-semibold text-emerald-700">+{p.totalAllowances.toLocaleString()}</p></div>
                    <div><p className="text-slate-400 text-xs mb-0.5">Deductions</p><p className="font-semibold text-red-600">-{p.totalDeductions.toLocaleString()}</p></div>
                    <div><p className="text-slate-400 text-xs mb-0.5">Net</p><p className="font-bold text-employee-700 text-base">Rs. {p.netSalary.toLocaleString()}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewingPayslip(p)} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors">
                      <Eye size={14} /> View
                    </button>
                    <button onClick={() => handleDownload(p)} className="flex items-center gap-1.5 px-4 py-2 bg-employee-600 hover:bg-employee-700 text-white rounded-lg text-sm font-semibold transition-colors">
                      <Download size={14} /> PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {payslips.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                No payslips found for this period.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {viewingPayslip && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 border-t-4 border-t-employee-600 rounded-t-xl">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Payslip Details</h2>
                <p className="text-slate-500 text-sm">{getMonthName(viewingPayslip.month)} {viewingPayslip.year}</p>
              </div>
              <button onClick={() => setViewingPayslip(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Employee Name", user.fullName],
                  ["Email", user.email],
                  ["Role", user.role]
                ].map(([l,v]) => (
                  <div key={l}><p className="text-slate-400 text-xs">{l}</p><p className="font-semibold text-slate-800">{v || "N/A"}</p></div>
                ))}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Earnings & Allowances</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Basic Salary</span><span className="font-semibold">Rs. {viewingPayslip.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Other Allowances</span><span className="font-semibold">Rs. {viewingPayslip.totalAllowances.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2.5 px-3 bg-slate-50 border border-slate-100 rounded-lg font-semibold text-emerald-700">
                    <span>Total Earnings</span><span>Rs. {(viewingPayslip.basicSalary + viewingPayslip.totalAllowances).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Deductions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Total Deductions</span><span className="font-semibold">Rs. {viewingPayslip.totalDeductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2.5 px-3 bg-slate-50 border border-slate-100 rounded-lg font-semibold text-red-600">
                    <span>Total Deductions</span><span>Rs. {viewingPayslip.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="bg-employee-700 text-white p-5 rounded-lg flex justify-between items-center">
                <span className="text-lg font-bold">Net Salary</span>
                <span className="text-2xl font-bold">Rs. {viewingPayslip.netSalary.toLocaleString()}</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleDownload(viewingPayslip)} className="flex-1 bg-employee-600 hover:bg-employee-700 text-white py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <Download size={16} /> Download PDF
                </button>
                <button onClick={() => setViewingPayslip(null)} className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-lg font-semibold text-sm transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
export default Payslip;
