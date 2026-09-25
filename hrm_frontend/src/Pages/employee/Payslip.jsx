import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Download, Eye, Calendar, TrendingUp, FileText, CreditCard, X, Filter, Search, Wallet } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";
import { employeeApi } from "../../services/api";
import {
  SearchBar, FilterSelect, ShowingCount, TableCard, TableHeaderRow, TableHeader, TableRows, TableRow, LoadingState, EmptyState,
} from "../../components/EmployeeUI";
import { EMP_GRADIENT, useSort } from "../../components/employeeTheme";

const PAYSLIP_COLS = "grid-cols-[1.4fr_1.1fr_1fr_1fr_1.1fr_0.8fr_150px]";

const money = (n) => (Number(n) || 0).toLocaleString();

const PERIOD_LABELS = { MONTHLY: "Monthly", WEEKLY: "Weekly", ANNUAL: "Annual" };

const Payslip = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [viewingPayslip, setViewingPayslip] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paySheet, setPaySheet] = useState(null);
  const [paySheetLoading, setPaySheetLoading] = useState(false);
  const [paySheetError, setPaySheetError] = useState("");

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

      // Current salary from HR: job role basic payment + individual allowances / deductions
      const getMyPaySheet = async () => {
        setPaySheetLoading(true);
        setPaySheetError("");
        try {
          const response = await employeeApi.getPaySheet();
          setPaySheet(response.data || null);
        } catch (e) {
          setPaySheetError((e.message || "Failed to load your salary").replace(/^\d{3}:\s*/, ""));
        } finally {
          setPaySheetLoading(false);
        }
      };
      getMyPaySheet();
    }
  }, [user]);

  const handleDownload = (p) => alert(`Downloading payslip for ${p.month}`);

  const getMonthName = (m) => ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m] || "";

  const [searchTerm, setSearchTerm] = useState("");

  const years = useMemo(
    () => [...new Set(payslips.map((p) => String(p.year)))].sort().reverse(),
    [payslips]
  );

  const filteredPayslips = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return payslips.filter((p) => {
      if (selectedYear !== "ALL" && String(p.year) !== selectedYear) return false;
      if (!q) return true;
      return `${getMonthName(p.month)} ${p.year} ${p.status || "PAID"}`.toLowerCase().includes(q);
    });
  }, [payslips, searchTerm, selectedYear]);

  const { sorted: sortedPayslips, headerProps } = useSort(filteredPayslips, (p, key) => {
    if (key === "period") return `${p.year}-${String(p.month).padStart(2, "0")}`;
    if (key === "status") return p.status || "PAID";
    return String(Math.round(p[key] || 0)).padStart(12, "0");
  });

  if (!user) return null;

  const lastNet = payslips.length > 0 ? payslips[0].netSalary : 0;
  const totalNet = payslips.reduce((acc, p) => acc + p.netSalary, 0);
  const avgNet = payslips.length > 0 ? Math.round(totalNet / payslips.length) : 0;

  const isFiltering = searchTerm || selectedYear !== "ALL";

  const statusPill = (status) => (
    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
      {status || "PAID"}
    </span>
  );

  const rowActions = (p) => (
    <div className="flex items-center justify-end gap-2">
      <button onClick={() => setViewingPayslip(p)} title="View"
        className="h-8 w-8 rounded-lg bg-sky-50 text-blue-600 hover:bg-sky-100 flex items-center justify-center transition-colors">
        <Eye size={15} />
      </button>
      <button onClick={() => handleDownload(p)} title="Download PDF"
        className={`h-8 px-3 rounded-lg ${EMP_GRADIENT} text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity`}>
        <Download size={13} /> PDF
      </button>
    </div>
  );

  return (
    <PageLayout
      role="employee"
      activePage="Payslip"
      title="Payslip"
      subtitle="View and download your salary payslips"
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

        {/* =====================================================
            CURRENT SALARY (pay sheet set by HR)
        ====================================================== */}
        <div className="bg-gradient-to-br from-white to-employee-50 rounded-xl border border-employee-100 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
              <span className="bg-emerald-50 p-2 rounded-lg"><Wallet size={20} className="text-emerald-600" /></span> My Current Salary
            </h2>
            {paySheet?.configured && paySheet.period && (
              <span className="text-xs font-semibold text-employee-700 bg-employee-50 border border-employee-100 px-2.5 py-1 rounded-lg">
                {PERIOD_LABELS[paySheet.period] || paySheet.period}
              </span>
            )}
          </div>
          {paySheetLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-employee-500"></div>
            </div>
          ) : paySheetError ? (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{paySheetError}</p>
          ) : paySheet && (
            <div className="space-y-5">
              {!paySheet.configured && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  HR has not set a salary for your job role{paySheet.designation ? ` (${paySheet.designation})` : ""} yet.
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                {[["Department", paySheet.departmentName], ["Designation", paySheet.designation], ["Employment Type", paySheet.employmentType]].map(([l, v]) => (
                  <div key={l} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-slate-400 text-xs">{l}</p>
                    <p className="mt-1 font-semibold text-slate-800 truncate">{v || "—"}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Earnings</h3>
                  <div className="space-y-2">
                    {[["Basic Salary", paySheet.basicSalary], ["Job Role Allowance", paySheet.roleAllowance],
                      ...(paySheet.additionalItems || []).filter(i => i.type === "ALLOWANCE").map(i => [i.name, i.amount])].map(([l, v], idx) => (
                      <div key={`${l}-${idx}`} className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">{l}</span><span className="font-semibold">Rs. {money(v)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2.5 px-3 bg-emerald-50 border border-emerald-100 rounded-xl font-semibold text-emerald-700">
                      <span>Total Earnings</span><span>Rs. {money(Number(paySheet.basicSalary || 0) + Number(paySheet.totalAllowance || 0))}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Deductions</h3>
                  <div className="space-y-2">
                    {[["Job Role Deduction", paySheet.roleDeduction],
                      ...(paySheet.additionalItems || []).filter(i => i.type === "DEDUCTION").map(i => [i.name, i.amount])].map(([l, v], idx) => (
                      <div key={`${l}-${idx}`} className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">{l}</span><span className="font-semibold">Rs. {money(v)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2.5 px-3 bg-red-50 border border-red-100 rounded-xl font-semibold text-red-600">
                      <span>Total Deductions</span><span>Rs. {money(paySheet.totalDeduction)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-employee-700 text-white p-5 rounded-lg flex justify-between items-center">
                <span className="text-lg font-bold">Net Salary</span>
                <span className="text-2xl font-bold">Rs. {money(paySheet.netTotal)}</span>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            SEARCH & FILTER CONTROLS
        ====================================================== */}
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search by month (e.g. March) or year...">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <FilterSelect value={selectedYear} onChange={setSelectedYear}>
              <option value="ALL">All Years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </FilterSelect>
          </div>
          <ShowingCount shown={sortedPayslips.length} total={payslips.length} />
        </SearchBar>

        {/* =====================================================
            PAYSLIP TABLE
        ====================================================== */}
        <TableCard>
          <TableHeaderRow cols={PAYSLIP_COLS}>
            <TableHeader {...headerProps("period")}>Period</TableHeader>
            <TableHeader {...headerProps("basicSalary")}>Basic</TableHeader>
            <TableHeader {...headerProps("totalAllowances")}>Allowances</TableHeader>
            <TableHeader {...headerProps("totalDeductions")}>Deductions</TableHeader>
            <TableHeader {...headerProps("netSalary")}>Net Salary</TableHeader>
            <TableHeader {...headerProps("status")}>Status</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableHeaderRow>

          {isLoading ? (
            <LoadingState title="Loading payslips..." subtitle="Fetching latest records from database" />
          ) : sortedPayslips.length === 0 ? (
            <EmptyState
              icon={isFiltering ? <Search size={28} /> : <FileText size={28} />}
              title={isFiltering ? "No payslips found" : "No payslips yet"}
              subtitle={isFiltering
                ? "Try clearing your search or choosing another year."
                : "Your payslips will appear here once payroll is processed."}
            />
          ) : (
            <TableRows>
              {sortedPayslips.map((p) => (
                <TableRow
                  key={p.id}
                  cols={PAYSLIP_COLS}
                  mobile={
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800">{getMonthName(p.month)} {p.year}</p>
                        {statusPill(p.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <span className="text-slate-500">Basic: <b className="text-slate-800">Rs. {money(p.basicSalary)}</b></span>
                        <span className="text-slate-500">Net: <b className="text-blue-700">Rs. {money(p.netSalary)}</b></span>
                        <span className="text-emerald-700">+{money(p.totalAllowances)}</span>
                        <span className="text-red-600">-{money(p.totalDeductions)}</span>
                      </div>
                      {rowActions(p)}
                    </div>
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-10 w-10 flex-shrink-0 rounded-xl ${EMP_GRADIENT} text-white flex items-center justify-center shadow-sm`}>
                      <Calendar size={18} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{getMonthName(p.month)} {p.year}</p>
                  </div>
                  <span className="text-sm text-slate-700 font-medium">Rs. {money(p.basicSalary)}</span>
                  <span className="text-sm font-semibold text-emerald-700">+{money(p.totalAllowances)}</span>
                  <span className="text-sm font-semibold text-red-600">-{money(p.totalDeductions)}</span>
                  <span className="text-sm font-bold text-blue-700">Rs. {money(p.netSalary)}</span>
                  <div>{statusPill(p.status)}</div>
                  {rowActions(p)}
                </TableRow>
              ))}
            </TableRows>
          )}
        </TableCard>
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
