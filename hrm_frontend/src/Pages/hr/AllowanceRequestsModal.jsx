import React, { useState, useEffect, useMemo } from "react";
import { X, FileText, Check, Ban, Search, Clock, CheckCircle, XCircle } from "lucide-react";
import { hrApi } from "../../services/api";

// Server errors come back as "400: <reason>"; show just the reason
const errorText = (error, fallback) => (error?.message || fallback).replace(/^\d{3}:\s*/, "");
const money = (v) => `Rs.${(Number(v) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const formatDate = (dt) => (dt ? dt.replace("T", " ").slice(0, 16) : "—");

const STATUS_STYLE = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};
const STATUS_ICON = { PENDING: <Clock size={12} />, APPROVED: <CheckCircle size={12} />, REJECTED: <XCircle size={12} /> };
const statusLabel = (s) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : "");

/** Opens a PDF blob in a new tab (falls back to downloading it if pop-ups are blocked). */
const openPdf = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "document.pdf";
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

/**
 * HR popup listing employees' allowance requests (stored in hrm_db_employee.allowance_requests).
 * Reject needs a comment, which the employee sees in their history. Approve calls onApproved(request)
 * so the page can open the Individual Allowance & Deduction popup with the allowance filled in.
 */
const AllowanceRequestsModal = ({ onClose, onApproved }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [rejecting, setRejecting] = useState(null); // request being rejected
  const [rejectComment, setRejectComment] = useState("");
  const [rejectError, setRejectError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await hrApi.getAllowanceRequests();
      setRequests(res.data || []);
    } catch (e) {
      setError(errorText(e, "Failed to load allowance requests"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => ({
    ALL: requests.length,
    PENDING: requests.filter(r => r.status === "PENDING").length,
    APPROVED: requests.filter(r => r.status === "APPROVED").length,
    REJECTED: requests.filter(r => r.status === "REJECTED").length,
  }), [requests]);

  const filtered = requests.filter(r => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    const q = searchTerm.trim().toLowerCase();
    return !q || [r.employeeName, r.employeeCode, r.name, r.description].some(v => (v || "").toLowerCase().includes(q));
  });

  const viewDocument = async (r) => {
    try {
      setError("");
      openPdf(await hrApi.getAllowanceDocument(r.id), r.documentName);
    } catch (e) {
      setError(errorText(e, "Could not open the document"));
    }
  };

  const approve = async (r) => {
    try {
      setBusyId(r.id);
      setError("");
      const res = await hrApi.approveAllowanceRequest(r.id, null);
      onApproved(res.data || r);
    } catch (e) {
      setError(errorText(e, "Failed to approve the request"));
      load();
    } finally {
      setBusyId(null);
    }
  };

  const openReject = (r) => {
    setRejecting(r);
    setRejectComment("");
    setRejectError("");
  };

  const confirmReject = async (e) => {
    e.preventDefault();
    if (!rejectComment.trim()) { setRejectError("Enter a comment explaining why the request is rejected"); return; }
    try {
      setBusyId(rejecting.id);
      setRejectError("");
      await hrApi.rejectAllowanceRequest(rejecting.id, rejectComment.trim());
      setRejecting(null);
      load();
    } catch (e2) {
      setRejectError(errorText(e2, "Failed to reject the request"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold">Allowance Requests</h3>
            <p className="text-white/80 text-xs">Requests employees sent with a supporting PDF · approve to add them to the employee's pay</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-xl"><X size={18} /></button>
        </div>

        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {["PENDING", "APPROVED", "REJECTED", "ALL"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${statusFilter === s ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {s === "ALL" ? "All" : statusLabel(s)} ({counts[s]})
              </button>
            ))}
          </div>
          <div className="relative md:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search employee or allowance…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50" />
          </div>
        </div>

        <div className="overflow-y-auto">
          {error && <div className="m-5 mb-0 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
          <div className="overflow-x-auto p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs">
                  {["Employee", "Allowance", "Amount", "Description", "Requested On", "Document", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left font-semibold whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r, i) => (
                  <tr key={r.id} className={`align-top hover:bg-teal-50/40 transition-colors ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 whitespace-nowrap">{r.employeeName || r.employeeEmail}</p>
                      <p className="text-xs text-gray-400 font-mono">{r.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                    <td className="px-4 py-3 font-bold text-teal-700 whitespace-nowrap">{money(r.amount)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[260px]">
                      <p className="line-clamp-3" title={r.description}>{r.description}</p>
                      {r.status !== "PENDING" && (
                        <p className={`text-xs mt-1 ${r.status === "REJECTED" ? "text-red-600" : "text-gray-400"}`}>
                          {r.reviewComment ? `HR: ${r.reviewComment}` : ""}{r.reviewedByName ? ` (${r.reviewedByName}, ${formatDate(r.reviewedAt)})` : ""}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => viewDocument(r)} title={r.documentName}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                        <FileText size={13} /> View PDF
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_STYLE[r.status] || ""}`}>
                        {STATUS_ICON[r.status]} {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "PENDING" ? (
                        <div className="flex gap-1.5">
                          <button onClick={() => approve(r)} disabled={busyId === r.id}
                            className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                            <Check size={13} /> Approve
                          </button>
                          <button onClick={() => openReject(r)} disabled={busyId === r.id}
                            className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                            <Ban size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400">
                    {requests.length === 0 ? "No allowance requests yet" : "No requests match this filter"}
                  </td></tr>
                )}
                {loading && (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading allowance requests…</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reject comment */}
      {rejecting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
          <form onSubmit={confirmReject} className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100">
              <h4 className="text-base font-bold text-gray-800">Reject allowance request</h4>
              <p className="text-xs text-gray-500 mt-0.5">{rejecting.employeeName} · {rejecting.name} · {money(rejecting.amount)}</p>
            </div>
            <div className="p-5 space-y-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Comment for the employee *</label>
              <textarea value={rejectComment} onChange={e => setRejectComment(e.target.value)} rows="4" maxLength={1000} autoFocus
                placeholder="Why is this request rejected?"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-gray-50 resize-none" />
              {rejectError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{rejectError}</div>}
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button type="button" onClick={() => setRejecting(null)} disabled={busyId === rejecting.id}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
              <button type="submit" disabled={busyId === rejecting.id}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                <Ban size={15} /> {busyId === rejecting.id ? "Rejecting..." : "Reject Request"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AllowanceRequestsModal;
