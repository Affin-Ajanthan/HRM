import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Eye, Send, Calendar, X, DollarSign, Plus, SlidersHorizontal } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";
import { hrApi, userHrApi } from "../../services/api";
import AdditionalPaymentsModal from "./AdditionalPaymentsModal";

const num = (v) => (v === "" || v == null || isNaN(Number(v)) ? 0 : Number(v));
const money = (v) => `Rs.${num(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const periodLabel = (p) => ({ MONTHLY: "Monthly", WEEKLY: "Weekly", ANNUAL: "Annual" }[p] || "");

const headerBtn = "inline-flex items-center gap-2 bg-gradient-to-br from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-teal-500/20 transition-all duration-200";

const HRPayslip = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("2026-07");
  const [viewingPayslip, setViewingPayslip] = useState(null);

  // Employee details from the user database; salaries from hrm_db_hr (basic_payments + additional_payments)
  const [employees, setEmployees] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  // null = closed; "" = opened from the header (pick an employee); email = opened for that employee
  const [adjustEmail, setAdjustEmail] = useState(null);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) {
      const u = JSON.parse(s);
      if (u.role !== "HR_MANAGER" && u.role !== "ADMIN") {
        navigate("/unauthorized");
        return;
      }
      setUser(u);
    } else navigate("/login");
  }, [navigate]);

  const loadData = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const empRes = await userHrApi.getEmployees();
      const emps = (empRes.data || []).filter(e => e.email);
      setEmployees(emps);
      const sheetRes = await hrApi.getPaySheets(emps.map(e => ({
        email: e.email,
        employeeCode: e.employeeId,
        fullName: e.fullName,
        departmentName: e.departmentName,
        designation: e.designation,
        employmentType: e.employmentType,
      })));
      setSheets(sheetRes.data || []);
    } catch (e) {
      console.error("Failed to load payroll data", e);
      setLoadError((e.message || "Failed to load payroll data").replace(/^\d{3}:\s*/, ""));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleGenerateAll = async () => {
    try {
      const parts = filterMonth.split("-");
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      await hrApi.generatePayroll(month, year);
      alert(`Payroll processed and payslips generated for ${filterMonth} successfully!`);
      loadData();
    } catch (e) {
      alert("Failed to generate payroll: " + e.message);
    }
  };

  const payrollData = useMemo(() => {
    const byEmail = new Map(sheets.map(s => [(s.employeeEmail || "").toLowerCase(), s]));
    return employees.map(emp => {
      const sheet = byEmail.get(emp.email.toLowerCase());
      const hasAdjustments = (sheet?.additionalItems || []).length > 0;
      return {
        id: emp.id,
        email: emp.email,
        empId: emp.employeeId || `EMP${emp.id}`,
        name: emp.fullName,
        department: emp.departmentName || "—",
        designation: emp.designation || "—",
        employmentType: emp.employmentType || "",
        month: filterMonth,
        basicSalary: num(sheet?.basicSalary),
        allowances: num(sheet?.totalAllowance),
        deductions: num(sheet?.totalDeduction),
        netSalary: num(sheet?.netTotal),
        status: !sheet?.configured ? "Not Configured" : hasAdjustments ? "Adjusted" : "Configured",
        // Why no job role salary matched, shown under the Basic column
        missingReason: sheet?.configured ? ""
          : !emp.designation ? "No job role set for this employee"
          : !emp.employmentType ? "No employment type set for this employee"
          : `No salary added for ${emp.designation} (${emp.employmentType})`,
        sheet,
      };
    });
  }, [employees, sheets, filterMonth]);

  const stats = {
    total:      payrollData.length,
    payroll:    payrollData.reduce((s, p) => s + p.netSalary, 0),
    configured: payrollData.filter(p => p.status !== "Not Configured").length,
    pending:    payrollData.filter(p => p.status === "Not Configured").length,
  };

  const q = searchTerm.toLowerCase();
  const filtered = payrollData.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.empId.toLowerCase().includes(q) ||
    p.department.toLowerCase().includes(q) ||
    p.designation.toLowerCase().includes(q)
  );

  const statusBadge = (s) => ({
    Configured: "bg-emerald-100 text-emerald-700",
    Adjusted: "bg-violet-100 text-violet-700",
  }[s] || "bg-amber-100 text-amber-700");

  const onAdjustSaved = (msg) => {
    setAdjustEmail(null);
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
    loadData();
  };

  if (!user) return null;

  return (
    <PageLayout role="hr" activePage="Payroll" title="Payroll Management" subtitle="Manage employee salaries and payslips"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => navigate("/hr/payroll/salaries")} className={headerBtn}>
            <Plus size={17} strokeWidth={2.5} /> Add Salaries for Job Roles
          </button>
          <button onClick={() => setAdjustEmail("")} className={headerBtn}>
            <SlidersHorizontal size={16} /> Individual Allowance & Deduction
          </button>
          <button onClick={handleGenerateAll} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <Send size={15} /> Generate All
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {message && <div className="p-4 rounded-lg text-white bg-green-500">{message}</div>}
        {loadError && <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{loadError}</div>}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            { label:"Employees",       value:stats.total,   gradient:"from-teal-400 to-emerald-500",  icon:"👥" },
            { label:"Total Net Pay",   value:`Rs.${(stats.payroll/1000).toFixed(0)}K`, gradient:"from-emerald-400 to-green-500", icon:"💰" },
            { label:"Configured",      value:stats.configured, gradient:"from-violet-400 to-purple-500", icon:"✅" },
            { label:"Pending Setup",   value:stats.pending,   gradient:"from-amber-400 to-orange-500",  icon:"⏳" },
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
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name, ID, department or designation…"
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
                  {["Emp ID","Employee","Dept","Designation","Basic","Allowances","Deductions","Net Salary","Status","Actions"].map(h => <th key={h} className="px-5 py-4 text-left font-semibold whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p, i) => (
                  <tr key={p.email} className={`hover:bg-teal-50/40 transition-colors ${i%2===1?"bg-gray-50/40":""}`}>
                    <td className="px-5 py-3.5 font-mono font-semibold text-gray-700">{p.empId}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{p.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{p.department}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{p.designation}</td>
                    <td className="px-5 py-3.5 font-semibold whitespace-nowrap">
                      {p.missingReason ? (
                        <>
                          <span className="text-gray-400">Not set</span>
                          <p className="text-[11px] font-normal text-amber-600 whitespace-normal max-w-[180px] mt-0.5">{p.missingReason}</p>
                        </>
                      ) : money(p.basicSalary)}
                    </td>
                    <td className="px-5 py-3.5 text-emerald-600 font-semibold whitespace-nowrap">+{money(p.allowances)}</td>
                    <td className="px-5 py-3.5 text-red-600 font-semibold whitespace-nowrap">-{money(p.deductions)}</td>
                    <td className="px-5 py-3.5 font-bold text-teal-600 whitespace-nowrap">{money(p.netSalary)}</td>
                    <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusBadge(p.status)}`}>{p.status}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => setViewingPayslip(p)} title="View Payslip" className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><Eye size={14} /></button>
                        <button onClick={() => setAdjustEmail(p.email)} title="Individual Allowance & Deduction" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><DollarSign size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-10 text-gray-400">{searchTerm ? "No employees match your search" : "No employees found"}</td></tr>
                )}
                {isLoading && (
                  <tr><td colSpan={10} className="text-center py-10 text-gray-400">Loading payroll data…</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewingPayslip && (() => {
        const s = viewingPayslip.sheet || {};
        const items = s.additionalItems || [];
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between p-6 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-t-2xl">
                <div><h3 className="text-xl font-bold">Payslip – {viewingPayslip.month}</h3><p className="text-teal-100 text-sm">{viewingPayslip.name} · {viewingPayslip.empId}</p></div>
                <button onClick={() => setViewingPayslip(null)} className="p-1.5 hover:bg-white/20 rounded-xl"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[["Department",viewingPayslip.department],["Designation",viewingPayslip.designation],
                    ["Employment Type",viewingPayslip.employmentType || "—"],["Pay Period",periodLabel(s.period) || "—"]].map(([l,v]) => (
                    <div key={l} className="bg-gray-50 p-3 rounded-xl"><p className="text-xs text-gray-400 mb-0.5">{l}</p><p className="font-semibold text-gray-800">{v}</p></div>
                  ))}
                </div>
                {!s.configured && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    No job role salary is set for this employee's job role and employment type yet.
                  </p>
                )}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm">Earnings</h4>
                  <div className="space-y-2 text-sm">
                    {[["Basic Salary", s.basicSalary], ["Job Role Allowance", s.roleAllowance],
                      ...items.filter(i => i.type === "ALLOWANCE").map(i => [i.name, i.amount])].map(([l,v], idx) => (
                      <div key={`${l}-${idx}`} className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-600">{l}</span><span className="font-medium">{money(v)}</span></div>
                    ))}
                    <div className="flex justify-between py-2 bg-emerald-50 px-2 rounded-lg font-bold text-emerald-700"><span>Total Earnings</span><span>{money(viewingPayslip.basicSalary + viewingPayslip.allowances)}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm">Deductions</h4>
                  <div className="space-y-2 text-sm">
                    {[["Job Role Deduction", s.roleDeduction],
                      ...items.filter(i => i.type === "DEDUCTION").map(i => [i.name, i.amount])].map(([l,v], idx) => (
                      <div key={`${l}-${idx}`} className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-600">{l}</span><span className="font-medium">{money(v)}</span></div>
                    ))}
                    <div className="flex justify-between py-2 bg-red-50 px-2 rounded-lg font-bold text-red-600"><span>Total Deductions</span><span>{money(viewingPayslip.deductions)}</span></div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-5 rounded-2xl flex items-center justify-between">
                  <div><p className="text-teal-100 text-xs mb-0.5">Net Salary</p><p className="text-3xl font-bold">{money(viewingPayslip.netSalary)}</p></div>
                  <DollarSign size={40} className="opacity-40" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => alert(`Payslip sent to ${viewingPayslip.name}`)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"><Send size={15} /> Send</button>
                  <button onClick={() => setViewingPayslip(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors">Close</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {adjustEmail !== null && (
        <AdditionalPaymentsModal
          employees={payrollData}
          initialEmail={adjustEmail || undefined}
          onClose={() => setAdjustEmail(null)}
          onSaved={onAdjustSaved}
        />
      )}
    </PageLayout>
  );
};
export default HRPayslip;
