import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Download, Eye, Calendar, TrendingUp, FileText, CreditCard, X } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";

const Payslip = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [viewingPayslip, setViewingPayslip] = useState(null);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
    else navigate("/login");
  }, [navigate]);

  const payslips = [
    { id: 1, month: "January 2026",   basicSalary: 50000, allowances: 10000, deductions: 5000, netSalary: 55000, paidDate: "2026-01-31", status: "Paid" },
    { id: 2, month: "December 2025",  basicSalary: 50000, allowances: 12000, deductions: 5200, netSalary: 56800, paidDate: "2025-12-31", status: "Paid" },
    { id: 3, month: "November 2025",  basicSalary: 50000, allowances: 9000,  deductions: 4800, netSalary: 54200, paidDate: "2025-11-30", status: "Paid" },
  ];

  const handleDownload = (p) => console.log("Downloading:", p.month);

  if (!user) return null;

  return (
    <PageLayout
      role="employee"
      activePage="Payslip"
      title="Payslip"
      subtitle="View and download your salary payslips"
      actions={
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50">
          <option>2026</option><option>2025</option><option>2024</option>
        </select>
      }
    >
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            { label: "Last Salary",   value: "Rs. 55,000", icon: "💳", gradient: "from-sky-400 to-blue-500",    sub: "January 2026" },
            { label: "Avg. Monthly",  value: "Rs. 55,333", icon: "📈", gradient: "from-emerald-400 to-teal-500", sub: "Last 3 months" },
            { label: "YTD Earnings",  value: "Rs. 55,000", icon: "💰", gradient: "from-violet-400 to-purple-500", sub: "Year to date" },
            { label: "Total Payslips",value: payslips.length, icon: "📄", gradient: "from-amber-400 to-orange-500", sub: "Available" },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.gradient} p-6 rounded-2xl text-white relative overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-md`}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="flex items-center justify-between mb-2 relative z-10">
                <p className="text-white/80 text-sm">{s.label}</p>
                <span className="text-2xl">{s.icon}</span>
              </div>
              <p className="text-2xl font-bold relative z-10">{s.value}</p>
              <p className="text-white/70 text-xs mt-1 relative z-10">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Payslip list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-5">
            <FileText size={18} className="text-sky-500" /> Payslip History
          </h2>
          <div className="space-y-4">
            {payslips.map(p => (
              <div key={p.id} className="border border-gray-100 rounded-xl p-5 hover:border-sky-200 hover:shadow-sm transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600">
                      <Calendar size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{p.month}</h3>
                      <p className="text-sm text-gray-500">Paid on {p.paidDate}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm flex-1 md:ml-6 bg-gray-50 rounded-xl p-4">
                    <div><p className="text-gray-400 text-xs mb-0.5">Basic</p><p className="font-bold text-gray-800">Rs. {p.basicSalary.toLocaleString()}</p></div>
                    <div><p className="text-gray-400 text-xs mb-0.5">Allowances</p><p className="font-bold text-emerald-600">+{p.allowances.toLocaleString()}</p></div>
                    <div><p className="text-gray-400 text-xs mb-0.5">Deductions</p><p className="font-bold text-red-500">-{p.deductions.toLocaleString()}</p></div>
                    <div><p className="text-gray-400 text-xs mb-0.5">Net</p><p className="font-bold text-sky-600 text-base">Rs. {p.netSalary.toLocaleString()}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewingPayslip(p)} className="flex items-center gap-1.5 px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-sm font-semibold transition-colors">
                      <Eye size={14} /> View
                    </button>
                    <button onClick={() => handleDownload(p)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold transition-colors">
                      <Download size={14} /> PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {viewingPayslip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-2xl">
              <div><h2 className="text-xl font-bold">Payslip Details</h2><p className="text-sky-100 text-sm">{viewingPayslip.month}</p></div>
              <button onClick={() => setViewingPayslip(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                {[["Employee Name","John Doe"],["Employee ID","EMP-12345"],["Department","Engineering"],["Designation","Senior Developer"]].map(([l,v]) => (
                  <div key={l}><p className="text-gray-400 text-xs">{l}</p><p className="font-semibold text-gray-800">{v}</p></div>
                ))}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Earnings</h3>
                <div className="space-y-2 text-sm">
                  {[["Basic Salary", viewingPayslip.basicSalary],["HRA","5000"],["Transport","3000"],["Other","2000"]].map(([l,v]) => (
                    <div key={l} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{l}</span><span className="font-semibold">Rs. {Number(v).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2.5 px-3 bg-emerald-50 rounded-lg font-bold text-emerald-700">
                    <span>Total Earnings</span><span>Rs. {(viewingPayslip.basicSalary + viewingPayslip.allowances).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Deductions</h3>
                <div className="space-y-2 text-sm">
                  {[["Provident Fund","2500"],["Professional Tax","2000"],["Income Tax","500"]].map(([l,v]) => (
                    <div key={l} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{l}</span><span className="font-semibold">Rs. {Number(v).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2.5 px-3 bg-red-50 rounded-lg font-bold text-red-600">
                    <span>Total Deductions</span><span>Rs. {viewingPayslip.deductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-5 rounded-xl flex justify-between items-center">
                <span className="text-lg font-bold">Net Salary</span>
                <span className="text-2xl font-bold">Rs. {viewingPayslip.netSalary.toLocaleString()}</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleDownload(viewingPayslip)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <Download size={16} /> Download PDF
                </button>
                <button onClick={() => setViewingPayslip(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
export default Payslip;
