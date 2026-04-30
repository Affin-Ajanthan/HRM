import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Eye, Send, Calendar, Users, TrendingUp, CreditCard, X, DollarSign } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";

const HRPayslip = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("2026-01");
  const [viewingPayslip, setViewingPayslip] = useState(null);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) { const u = JSON.parse(s); if (u.role !== "HR_MANAGER" && u.role !== "ADMIN") { navigate("/unauthorized"); return; } setUser(u); }
    else navigate("/login");
  }, [navigate]);

  const payrollData = [
    { id:1, empId:"EMP001", name:"John Doe",       department:"IT",       designation:"Senior Developer",    month:"January 2026", basicSalary:50000, allowances:10000, deductions:5000,  netSalary:55000, status:"Processed" },
    { id:2, empId:"EMP002", name:"Jane Smith",     department:"HR",       designation:"HR Executive",         month:"January 2026", basicSalary:45000, allowances:8000,  deductions:4000,  netSalary:49000, status:"Processed" },
    { id:3, empId:"EMP003", name:"Mike Johnson",   department:"Finance",  designation:"Accountant",           month:"January 2026", basicSalary:48000, allowances:9000,  deductions:4500,  netSalary:52500, status:"Pending"   },
    { id:4, empId:"EMP004", name:"Sarah Williams", department:"IT",       designation:"Developer",            month:"January 2026", basicSalary:42000, allowances:7000,  deductions:3800,  netSalary:45200, status:"Processed" },
    { id:5, empId:"EMP005", name:"David Brown",    department:"Marketing",designation:"Marketing Manager",    month:"January 2026", basicSalary:55000, allowances:12000, deductions:6000,  netSalary:61000, status:"Pending"   },
  ];
  const stats = {
    total:    payrollData.length,
    payroll:  payrollData.reduce((s,p) => s+p.netSalary, 0),
    processed:payrollData.filter(p => p.status==="Processed").length,
    pending:  payrollData.filter(p => p.status==="Pending").length,
  };
  const filtered = payrollData.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.empId.toLowerCase().includes(searchTerm.toLowerCase()) || p.department.toLowerCase().includes(searchTerm.toLowerCase()));
  const statusBadge = (s) => ({ Processed:"bg-emerald-100 text-emerald-700", Pending:"bg-amber-100 text-amber-700" }[s] || "bg-gray-100 text-gray-600");

  if (!user) return null;
  return (
    <PageLayout role="hr" activePage="Payroll" title="Payroll Management" subtitle="Manage employee salaries and payslips"
      actions={<button onClick={() => alert("Generating all payslips…")} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"><Send size={15} /> Generate All</button>}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            { label:"Employees",  value:stats.total,   gradient:"from-teal-400 to-emerald-500",  icon:"👥" },
            { label:"Total Pay",  value:`Rs.${(stats.payroll/1000).toFixed(0)}K`, gradient:"from-emerald-400 to-green-500", icon:"💰" },
            { label:"Processed",  value:stats.processed, gradient:"from-violet-400 to-purple-500", icon:"✅" },
            { label:"Pending",    value:stats.pending,   gradient:"from-amber-400 to-orange-500",  icon:"⏳" },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.gradient} p-6 rounded-2xl text-white hover:-translate-y-1 transition-all duration-300`}>
              <div className="flex items-center justify-between mb-1"><p className="text-white/80 text-sm">{s.label}</p><span className="text-xl">{s.icon}</span></div>
              <p className="text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name, ID, or department…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50" />
            </div>
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50" />
            </div>
            <button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <Download size={15} /> Export
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs">
                  {["Emp ID","Employee","Dept","Designation","Basic","Allowances","Deductions","Net Salary","Status","Actions"].map(h => <th key={h} className="px-5 py-4 text-left font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p, i) => (
                  <tr key={p.id} className={`hover:bg-teal-50/40 transition-colors ${i%2===1?"bg-gray-50/40":""}`}>
                    <td className="px-5 py-3.5 font-mono font-semibold text-gray-700">{p.empId}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{p.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{p.department}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{p.designation}</td>
                    <td className="px-5 py-3.5 font-semibold">Rs.{p.basicSalary.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-emerald-600 font-semibold">+Rs.{p.allowances.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-red-600 font-semibold">-Rs.{p.deductions.toLocaleString()}</td>
                    <td className="px-5 py-3.5 font-bold text-teal-600">Rs.{p.netSalary.toLocaleString()}</td>
                    <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(p.status)}`}>{p.status}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => setViewingPayslip(p)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><Eye size={14} /></button>
                        <button onClick={() => alert(`Payslip sent to ${p.name}`)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Send size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewingPayslip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between p-6 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-t-2xl">
              <div><h3 className="text-xl font-bold">Payslip – {viewingPayslip.month}</h3><p className="text-teal-100 text-sm">{viewingPayslip.name} · {viewingPayslip.empId}</p></div>
              <button onClick={() => setViewingPayslip(null)} className="p-1.5 hover:bg-white/20 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[["Department",viewingPayslip.department],["Designation",viewingPayslip.designation]].map(([l,v]) => (
                  <div key={l} className="bg-gray-50 p-3 rounded-xl"><p className="text-xs text-gray-400 mb-0.5">{l}</p><p className="font-semibold text-gray-800">{v}</p></div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">Earnings</h4>
                <div className="space-y-2 text-sm">
                  {[["Basic Salary",viewingPayslip.basicSalary],["HRA","5,000"],["Transport","3,000"],["Other Allowances",viewingPayslip.allowances-8000]].map(([l,v]) => (
                    <div key={l} className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-600">{l}</span><span className="font-medium">Rs.{Number(v).toLocaleString()}</span></div>
                  ))}
                  <div className="flex justify-between py-2 bg-emerald-50 px-2 rounded-lg font-bold text-emerald-700"><span>Total Earnings</span><span>Rs.{(viewingPayslip.basicSalary+viewingPayslip.allowances).toLocaleString()}</span></div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">Deductions</h4>
                <div className="space-y-2 text-sm">
                  {[["Provident Fund","2,000"],["Professional Tax","1,000"],["Income Tax",viewingPayslip.deductions-3000]].map(([l,v]) => (
                    <div key={l} className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-600">{l}</span><span className="font-medium">Rs.{Number(v).toLocaleString()}</span></div>
                  ))}
                  <div className="flex justify-between py-2 bg-red-50 px-2 rounded-lg font-bold text-red-600"><span>Total Deductions</span><span>Rs.{viewingPayslip.deductions.toLocaleString()}</span></div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-5 rounded-2xl flex items-center justify-between">
                <div><p className="text-teal-100 text-xs mb-0.5">Net Salary</p><p className="text-3xl font-bold">Rs.{viewingPayslip.netSalary.toLocaleString()}</p></div>
                <DollarSign size={40} className="opacity-40" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => alert(`Payslip sent to ${viewingPayslip.name}`)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"><Send size={15} /> Send</button>
                <button onClick={() => setViewingPayslip(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
export default HRPayslip;
