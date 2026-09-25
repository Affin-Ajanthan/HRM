import React, { useState, useEffect } from "react";
import { Plus, X, Save, User } from "lucide-react";
import { hrApi } from "../../services/api";

// Server errors come back as "400: <reason>"; show just the reason
const errorText = (error, fallback) => (error?.message || fallback).replace(/^\d{3}:\s*/, "");

const num = (v) => (v === "" || v == null || isNaN(Number(v)) ? 0 : Number(v));
const money = (v) => `Rs.${num(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const newRow = () => ({ key: `${Date.now()}-${Math.random()}`, name: "", type: "ALLOWANCE", amount: "" });

const fieldCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50";

/**
 * Popup to set an employee's individual allowances / deductions (hrm_db_hr.additional_payments).
 * The saved list replaces the employee's previous one; removing every row clears them, and the
 * employee is then paid exactly their job role's basic payment.
 *
 * props:
 *   employees       rows of the payroll table ({ email, empId, name, department, designation, sheet })
 *   initialEmail    employee to open with (row action); omitted when opened from the page header
 *   onClose, onSaved
 */
const AdditionalPaymentsModal = ({ employees, initialEmail, onClose, onSaved }) => {
  const [email, setEmail] = useState(initialEmail || "");
  const [rows, setRows] = useState([newRow()]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const employee = employees.find(e => e.email === email);
  const sheet = employee?.sheet;

  // Start from what the employee already has
  useEffect(() => {
    const items = sheet?.additionalItems || [];
    setRows(items.length
      ? items.map(i => ({ key: `existing-${i.id}`, name: i.name, type: i.type, amount: String(i.amount ?? "") }))
      : [newRow()]);
    setFormError("");
  }, [email, sheet]);

  const updateRow = (key, field, value) => setRows(prev => prev.map(r => (r.key === key ? { ...r, [field]: value } : r)));
  const removeRow = (key) => setRows(prev => {
    const next = prev.filter(r => r.key !== key);
    return next.length ? next : [newRow()];
  });

  // A single untouched blank row means "no individual allowances / deductions"
  const filledRows = rows.filter(r => r.name.trim() !== "" || r.amount !== "");

  const roleTotal = sheet ? num(sheet.basicSalary) + num(sheet.roleAllowance) - num(sheet.roleDeduction) : 0;
  const extraAllowance = filledRows.filter(r => r.type === "ALLOWANCE").reduce((s, r) => s + num(r.amount), 0);
  const extraDeduction = filledRows.filter(r => r.type === "DEDUCTION").reduce((s, r) => s + num(r.amount), 0);
  const netTotal = roleTotal + extraAllowance - extraDeduction;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!employee) { setFormError("Select an employee"); return; }
    try {
      setSaving(true);
      setFormError("");
      const res = await hrApi.saveAdditionalPayments({
        employeeEmail: employee.email,
        employeeCode: employee.empId,
        employeeName: employee.name,
        items: filledRows.map(r => ({ name: r.name, type: r.type, amount: r.amount === "" ? null : Number(r.amount) })),
      });
      onSaved(`✓ ${res.message || "Saved"} for ${employee.name}`);
    } catch (e2) {
      setFormError(errorText(e2, "Failed to save allowances / deductions"));
    } finally {
      setSaving(false);
    }
  };

  const close = () => { if (!saving) onClose(); };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold">Individual Allowance & Deduction</h3>
            <p className="text-white/80 text-xs">{employee ? `${employee.name} · ${employee.empId}` : "Select an employee"}</p>
          </div>
          <button type="button" onClick={close} className="p-1.5 hover:bg-white/20 rounded-xl"><X size={18} /></button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Employee */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} className="text-teal-600" /> Employee
            </label>
            <select value={email} onChange={e => setEmail(e.target.value)} disabled={!!initialEmail} required
              className="w-full md:w-[28rem] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 disabled:opacity-80">
              <option value="">Select an employee</option>
              {employees.map(e => (
                <option key={e.email} value={e.email}>{e.name} · {e.empId} · {e.designation}</option>
              ))}
            </select>
          </div>

          {employee && (
            <div className={`text-xs rounded-xl px-4 py-3 ${sheet?.configured ? "bg-gray-50 text-gray-600" : "bg-amber-50 border border-amber-100 text-amber-700"}`}>
              {sheet?.configured ? (
                <>
                  <span className="font-semibold">Job role salary ({employee.designation}{sheet.employmentType ? `, ${sheet.employmentType}` : ""}): </span>
                  basic {money(sheet.basicSalary)} + allowance {money(sheet.roleAllowance)} − deduction {money(sheet.roleDeduction)} = <b>{money(roleTotal)}</b>
                </>
              ) : (
                <>No job role salary is set for {employee.designation || "this employee's job role"} yet, so only the amounts below are counted. Add it under <b>Add Salaries for Job Roles</b>.</>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-2 py-2 font-semibold">Name *</th>
                  <th className="text-left px-2 py-2 font-semibold">Allowance / Deduction *</th>
                  <th className="text-left px-2 py-2 font-semibold">Amount *</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const required = rows.length > 1 || row.name.trim() !== "" || row.amount !== "";
                  return (
                    <tr key={row.key}>
                      <td className="px-2 py-2 min-w-[220px]">
                        <input required={required} value={row.name} maxLength={100}
                          onChange={e => updateRow(row.key, "name", e.target.value)} placeholder="e.g. Fuel allowance" className={fieldCls} />
                      </td>
                      <td className="px-2 py-2 min-w-[170px]">
                        <select value={row.type} onChange={e => updateRow(row.key, "type", e.target.value)}
                          className={`${fieldCls} ${row.type === "ALLOWANCE" ? "text-emerald-700" : "text-red-600"}`}>
                          <option value="ALLOWANCE">Allowance</option>
                          <option value="DEDUCTION">Deduction</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 min-w-[140px]">
                        <input required={required} type="number" min="0.01" step="0.01" value={row.amount}
                          onChange={e => updateRow(row.key, "amount", e.target.value)} placeholder="0.00" className={fieldCls} />
                      </td>
                      <td className="px-2 py-2">
                        <button type="button" onClick={() => removeRow(row.key)} title="Remove row"
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                          <X size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button type="button" onClick={() => setRows(prev => [...prev, newRow()])}
            className="w-full border-2 border-dashed border-teal-200 hover:border-teal-400 hover:bg-teal-50 text-teal-600 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
            <Plus size={16} strokeWidth={2.5} /> Add another allowance / deduction
          </button>

          {/* Totals */}
          <div className="bg-gray-50 rounded-2xl p-4 text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-gray-500">Job role salary</span><span className="font-semibold text-gray-800">{money(roleTotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Individual allowances</span><span className="font-semibold text-emerald-600">+{money(extraAllowance)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Individual deductions</span><span className="font-semibold text-red-600">-{money(extraDeduction)}</span></div>
            <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-200">
              <span className="font-bold text-gray-800">Net Total</span>
              <span className={`text-xl font-bold ${netTotal < 0 ? "text-red-600" : "text-teal-700"}`}>{money(netTotal)}</span>
            </div>
          </div>

          {formError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{formError}</div>}
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
          <button type="button" onClick={close}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
          <button type="submit" disabled={saving || !employee}
            className="inline-flex items-center gap-2 bg-gradient-to-br from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-teal-500/20 transition-all">
            <Save size={16} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdditionalPaymentsModal;
