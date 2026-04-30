import React, { useState } from "react";
import { BarChart3, TrendingUp, Users, Clock, DollarSign, FileText, Download } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";

const Report = () => {
  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState("month");

  const reportCards = [
    { label:"Total Employees",  value:"245",    change:"+5.2%",  gradient:"from-teal-400 to-emerald-500",  icon:Users },
    { label:"Attendance Rate",  value:"94.2%",  change:"+2.1%",  gradient:"from-sky-400 to-blue-500",      icon:Clock },
    { label:"Monthly Payroll",  value:"$1.2M",  change:"+0.5%",  gradient:"from-violet-400 to-purple-500", icon:DollarSign },
    { label:"Reports Generated",value:"28",     change:"+8.3%",  gradient:"from-amber-400 to-orange-500",  icon:FileText },
  ];

  const departmentStats = [
    { name:"HR",         employees:12,  avgSalary:65000, attendance:95.2 },
    { name:"IT",         employees:85,  avgSalary:82000, attendance:94.8 },
    { name:"Finance",    employees:28,  avgSalary:72000, attendance:96.1 },
    { name:"Marketing",  employees:45,  avgSalary:60000, attendance:93.4 },
    { name:"Operations", employees:75,  avgSalary:55000, attendance:92.9 },
  ];

  const reports = {
    employee: [
      { id:1, name:"Employee Headcount Report",       date:"2026-02-25", status:"Ready",      downloads:342 },
      { id:2, name:"Department Wise Distribution",    date:"2026-02-24", status:"Ready",      downloads:215 },
      { id:3, name:"Salary Analysis Report",          date:"2026-02-23", status:"Processing", downloads:0   },
      { id:4, name:"Employee Performance Summary",    date:"2026-02-22", status:"Ready",      downloads:189 },
    ],
    attendance: [
      { id:1, name:"Monthly Attendance Summary",     date:"2026-02-25", status:"Ready",      downloads:278 },
      { id:2, name:"Late Coming Report",             date:"2026-02-24", status:"Ready",      downloads:145 },
      { id:3, name:"Absenteeism Analysis",           date:"2026-02-23", status:"Ready",      downloads:167 },
      { id:4, name:"Shift Wise Attendance",          date:"2026-02-21", status:"Processing", downloads:0   },
    ],
    payroll: [
      { id:1, name:"Monthly Payroll Register",       date:"2026-02-25", status:"Ready", downloads:567 },
      { id:2, name:"Tax Deduction Summary",          date:"2026-02-24", status:"Ready", downloads:234 },
      { id:3, name:"Salary Increment Analysis",      date:"2026-02-23", status:"Ready", downloads:189 },
    ],
    leave: [
      { id:1, name:"Leave Balance Summary",         date:"2026-02-25", status:"Ready", downloads:312 },
      { id:2, name:"Leave Utilization Report",      date:"2026-02-24", status:"Ready", downloads:187 },
      { id:3, name:"Pending Approvals",             date:"2026-02-23", status:"Ready", downloads:98  },
    ],
  };

  const statusBadge = (s) => ({ Ready:"bg-emerald-100 text-emerald-700", Processing:"bg-amber-100 text-amber-700" }[s] || "bg-gray-100 text-gray-600");
  const tabs = [["overview","Dept Stats"],["employee","Employee"],["attendance","Attendance"],["payroll","Payroll"],["leave","Leave"]];

  const ReportRow = ({ r }) => (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-teal-50/40 hover:border-teal-200 transition-all">
      <div>
        <h4 className="font-semibold text-gray-800 text-sm">{r.name}</h4>
        <p className="text-xs text-gray-400 mt-0.5">{r.date}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(r.status)}`}>{r.status}</span>
        {r.downloads > 0 && <span className="text-xs text-gray-400">{r.downloads} downloads</span>}
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold transition-colors">
          <Download size={12} /> Download
        </button>
      </div>
    </div>
  );

  return (
    <PageLayout role="hr" activePage="Reports" title="HR Reports" subtitle="Comprehensive HR analytics and reports"
      actions={
        <select value={dateRange} onChange={e => setDateRange(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50">
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      }
    >
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {reportCards.map(c => (
            <div key={c.label} className={`bg-gradient-to-br ${c.gradient} p-6 rounded-2xl text-white hover:-translate-y-1 transition-all duration-300`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/80 text-sm">{c.label}</p>
                <c.icon size={20} />
              </div>
              <p className="text-3xl font-bold">{c.value}</p>
              <p className="text-white/70 text-xs mt-1">{c.change} vs last period</p>
            </div>
          ))}
        </div>

        {/* Tabbed report area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map(([key,label]) => (
              <button key={key} onClick={() => setSelectedReport(key)}
                className={`flex-1 min-w-fit py-4 px-5 text-sm font-semibold transition-colors whitespace-nowrap ${selectedReport === key ? "text-teal-600 border-b-2 border-teal-500" : "text-gray-500 hover:text-gray-800"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="p-6">
            {selectedReport === "overview" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs rounded-xl overflow-hidden">
                      {["Department","Employees","Avg Salary","Attendance Rate","Status"].map(h => <th key={h} className="px-5 py-3.5 text-left font-semibold">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {departmentStats.map((d, i) => (
                      <tr key={d.name} className={`hover:bg-teal-50/40 transition-colors ${i%2===1?"bg-gray-50/40":""}`}>
                        <td className="px-5 py-3.5 font-semibold text-gray-800">{d.name}</td>
                        <td className="px-5 py-3.5 text-gray-600">{d.employees}</td>
                        <td className="px-5 py-3.5 text-gray-600">${d.avgSalary.toLocaleString()}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                              <div className="h-full bg-teal-500 rounded-full" style={{ width:`${d.attendance}%` }} />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{d.attendance}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {selectedReport !== "overview" && (
              <div className="space-y-3">
                {(reports[selectedReport] || []).map(r => <ReportRow key={r.id} r={r} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
export default Report;
