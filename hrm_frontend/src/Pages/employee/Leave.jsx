import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Plus, CheckCircle, XCircle, Clock, FileText, Calendar, AlertCircle, X } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";
import { employeeApi } from "../../services/api";

// Top-edge colours for the per-type balance cards, in the order the API returns the types
const BALANCE_EDGES = ["border-t-employee-500", "border-t-emerald-600", "border-t-amber-500"];

const Leave = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const emptyForm = { leaveTypeId: "", startDate: "", endDate: "", reason: "" };
  const [formData, setFormData] = useState(emptyForm);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) {
      setUser(JSON.parse(s));
      loadLeaveData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const loadLeaveData = async () => {
    try {
      setLoading(true);
      const [typesRes, balanceRes, historyRes] = await Promise.all([
        employeeApi.getLeaveTypes(),
        employeeApi.getLeaveBalance(),
        employeeApi.getLeaves(),
      ]);
      setLeaveTypes(typesRes.data || []);
      setBalances(balanceRes.data || []);
      setLeaveHistory(historyRes.data || []);
    } catch (error) {
      console.error("Error loading leave data:", error);
      setMessage("✗ " + (error.message || "Failed to load leave data"));
    } finally {
      setLoading(false);
    }
  };

  const openApplyForm = () => {
    setFormData(emptyForm);
    setFormError("");
    setShowApplyForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.endDate < formData.startDate) {
      setFormError("End date cannot be before start date");
      return;
    }
    try {
      setSubmitting(true);
      setFormError("");
      await employeeApi.applyLeave({
        leaveTypeId: Number(formData.leaveTypeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
      });
      setShowApplyForm(false);
      setFormData(emptyForm);
      setMessage("✓ Leave application submitted");
      setTimeout(() => setMessage(""), 3000);
      loadLeaveData();
    } catch (error) {
      // Server errors come back as "400: <reason>"; show just the reason in the form
      setFormError((error.message || "Failed to submit leave application").replace(/^\d{3}:\s*/, ""));
    } finally {
      setSubmitting(false);
    }
  };

  // API statuses are upper-case enums (PENDING, APPROVED, ...); the UI shows them capitalised
  const statusLabel = (st) => (st ? st.charAt(0) + st.slice(1).toLowerCase() : "");
  const formatAppliedOn = (createdAt) => (createdAt ? createdAt.split("T")[0] : "—");

  const statusStyle = (s) => ({
    Approved:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    Rejected:  "bg-red-50 text-red-700 ring-1 ring-red-200",
    Pending:   "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    Cancelled: "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
  }[s] || "bg-slate-50 text-slate-600 ring-1 ring-slate-200");

  const statusIcon = { Approved: <CheckCircle size={14} />, Rejected: <XCircle size={14} />, Pending: <Clock size={14} />, Cancelled: <AlertCircle size={14} /> };

  if (!user) return null;

  return (
    <PageLayout
      role="employee"
      activePage="Leave"
      title="Leave Management"
      subtitle="Apply for leave and track your balance"
      actions={
        <button onClick={openApplyForm} className="flex items-center gap-2 bg-employee-600 hover:bg-employee-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Plus size={16} /> Apply for Leave
        </button>
      }
    >
      <div className="space-y-6">
        {message && (
          <div className={`p-4 rounded-lg text-white ${message.startsWith("✓") ? "bg-green-500" : "bg-red-500"}`}>
            {message}
          </div>
        )}

        {/* Balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-5">
          {[
            ...balances.map((b, i) => ({
              label: b.leaveTypeName,
              remaining: b.remainingDays,
              used: b.usedDays,
              total: b.totalDays,
              edge: BALANCE_EDGES[i % BALANCE_EDGES.length],
            })),
            {
              label: "Total Balance",
              remaining: balances.reduce((sum, b) => sum + (b.remainingDays || 0), 0),
              used: balances.reduce((sum, b) => sum + (b.usedDays || 0), 0),
              total: balances.reduce((sum, b) => sum + (b.totalDays || 0), 0),
              edge: "border-t-slate-700",
            },
          ].map(b => (
            <div key={b.label} className={`bg-white border border-slate-200 border-t-4 ${b.edge} p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300`}>
              <p className="text-slate-500 text-sm font-medium mb-1">{b.label}</p>
              <p className="text-3xl font-bold text-slate-900">{b.remaining}</p>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-slate-400">Remaining</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{b.used}/{b.total} used</span>
              </div>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-3 mb-5">
            <span className="bg-employee-50 p-2 rounded-lg"><FileText size={20} className="text-employee-600" /></span> Leave History
          </h2>
          <div className="space-y-3">
            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-employee-500"></div>
              </div>
            )}
            {!loading && leaveHistory.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-8">No leave applications yet</p>
            )}
            {!loading && leaveHistory.map(leave => (
              <div key={leave.id} className="border border-slate-200 rounded-lg p-5 hover:border-employee-200 hover:bg-slate-50/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-800">{leave.leaveTypeName}</h3>
                      <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle(statusLabel(leave.status))}`}>
                        {statusIcon[statusLabel(leave.status)]} {statusLabel(leave.status)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {leave.startDate} → {leave.endDate}</span>
                      <span className="flex items-center gap-1"><CalendarDays size={12} /> {leave.numberOfDays} working day{leave.numberOfDays > 1 ? "s" : ""}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> Applied {formatAppliedOn(leave.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Reason: </span>{leave.reason}
                </div>
                {leave.status === "REJECTED" && leave.rejectionReason && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 text-sm text-red-700 mt-2">
                    <span className="font-medium">Rejection reason: </span>{leave.rejectionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Form Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Apply for Leave</h2>
              <button onClick={() => setShowApplyForm(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Leave Type *</label>
                <select value={formData.leaveTypeId} onChange={e => setFormData({...formData, leaveTypeId: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-employee-500 focus:border-employee-500 bg-white" required>
                  <option value="">Select leave type</option>
                  {leaveTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-employee-500 focus:border-employee-500 bg-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Date *</label>
                  <input type="date" value={formData.endDate} min={formData.startDate || undefined} onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-employee-500 focus:border-employee-500 bg-white" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reason *</label>
                <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} rows="3"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-employee-500 focus:border-employee-500 bg-white resize-none"
                  placeholder="Please provide a reason..." required />
              </div>
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{formError}</div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="flex-1 bg-employee-600 hover:bg-employee-700 text-white disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold text-sm transition-colors">{submitting ? "Submitting..." : "Submit Application"}</button>
                <button type="button" onClick={() => setShowApplyForm(false)} className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-lg font-semibold text-sm transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Leave;
