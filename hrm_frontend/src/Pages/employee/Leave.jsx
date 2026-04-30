import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Plus, CheckCircle, XCircle, Clock, FileText, Calendar, AlertCircle, X } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";

const Leave = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formData, setFormData] = useState({ leaveType: "", startDate: "", endDate: "", reason: "" });

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
    else navigate("/login");
  }, [navigate]);

  const leaveBalance = {
    annual:  { total: 15, used: 3,  remaining: 12 },
    sick:    { total: 10, used: 1,  remaining: 9  },
    casual:  { total: 7,  used: 2,  remaining: 5  },
  };

  const leaveHistory = [
    { id: 1, type: "Annual Leave", startDate: "2026-01-15", endDate: "2026-01-15", days: 1, status: "Approved", appliedOn: "2026-01-10", reason: "Personal work" },
    { id: 2, type: "Sick Leave",   startDate: "2026-01-08", endDate: "2026-01-08", days: 1, status: "Approved", appliedOn: "2026-01-08", reason: "Medical checkup" },
    { id: 3, type: "Casual Leave", startDate: "2025-12-28", endDate: "2025-12-29", days: 2, status: "Approved", appliedOn: "2025-12-20", reason: "Family function" },
    { id: 4, type: "Annual Leave", startDate: "2026-02-10", endDate: "2026-02-12", days: 3, status: "Pending",  appliedOn: "2026-01-20", reason: "Vacation trip" },
  ];

  const handleSubmit = (e) => { e.preventDefault(); setShowApplyForm(false); setFormData({ leaveType: "", startDate: "", endDate: "", reason: "" }); };

  const statusStyle = (s) => ({
    Approved:  "bg-emerald-100 text-emerald-700",
    Rejected:  "bg-red-100 text-red-700",
    Pending:   "bg-amber-100 text-amber-700",
    Cancelled: "bg-gray-100 text-gray-600",
  }[s] || "bg-gray-100 text-gray-600");

  const statusIcon = { Approved: <CheckCircle size={14} />, Rejected: <XCircle size={14} />, Pending: <Clock size={14} />, Cancelled: <AlertCircle size={14} /> };

  if (!user) return null;

  return (
    <PageLayout
      role="employee"
      activePage="Leave"
      title="Leave Management"
      subtitle="Apply for leave and track your balance"
      actions={
        <button onClick={() => setShowApplyForm(true)} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> Apply for Leave
        </button>
      }
    >
      <div className="space-y-6">
        {/* Balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-5">
          {[
            { label: "Annual Leave",  ...leaveBalance.annual,  gradient: "from-sky-400 to-blue-500" },
            { label: "Sick Leave",    ...leaveBalance.sick,    gradient: "from-emerald-400 to-teal-500" },
            { label: "Casual Leave",  ...leaveBalance.casual,  gradient: "from-violet-400 to-purple-500" },
            { label: "Total Balance", remaining: leaveBalance.annual.remaining + leaveBalance.sick.remaining + leaveBalance.casual.remaining, used: leaveBalance.annual.used + leaveBalance.sick.used + leaveBalance.casual.used, total: 32, gradient: "from-amber-400 to-orange-500" },
          ].map(b => (
            <div key={b.label} className={`bg-gradient-to-br ${b.gradient} p-6 rounded-2xl text-white relative overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-md`}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <p className="text-white/80 text-sm mb-1 relative z-10">{b.label}</p>
              <p className="text-4xl font-bold relative z-10">{b.remaining}</p>
              <div className="flex items-center justify-between text-xs mt-2 relative z-10">
                <span className="text-white/70">Remaining</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full">{b.used}/{b.total} used</span>
              </div>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-5">
            <FileText size={18} className="text-emerald-500" /> Leave History
          </h2>
          <div className="space-y-3">
            {leaveHistory.map(leave => (
              <div key={leave.id} className="border border-gray-100 rounded-xl p-5 hover:border-sky-200 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{leave.type}</h3>
                      <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle(leave.status)}`}>
                        {statusIcon[leave.status]} {leave.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {leave.startDate} → {leave.endDate}</span>
                      <span className="flex items-center gap-1"><CalendarDays size={12} /> {leave.days} day{leave.days > 1 ? "s" : ""}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> Applied {leave.appliedOn}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-2.5 text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Reason: </span>{leave.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Form Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Apply for Leave</h2>
              <button onClick={() => setShowApplyForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Leave Type *</label>
                <select value={formData.leaveType} onChange={e => setFormData({...formData, leaveType: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50" required>
                  <option value="">Select leave type</option>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason *</label>
                <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} rows="3"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50 resize-none"
                  placeholder="Please provide a reason..." required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors">Submit Application</button>
                <button type="button" onClick={() => setShowApplyForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Leave;
