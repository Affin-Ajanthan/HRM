import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, FileText, X } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";

const LeaveManagement = ({ role = "hr" }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewingRequest, setViewingRequest] = useState(null);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) {
      const u = JSON.parse(s);
      const allowed = role === "admin" ? u.role === "ADMIN" : u.role === "HR_MANAGER" || u.role === "ADMIN";
      if (!allowed) { navigate("/unauthorized"); return; }
      setUser(u);
    } else navigate("/login");
  }, [navigate, role]);

  const [leaveRequests, setLeaveRequests] = useState([
    { id:1, empId:"EMP001", name:"John Doe",       department:"IT",       leaveType:"Sick Leave",       startDate:"2026-01-25", endDate:"2026-01-27", days:3, reason:"Medical checkup and recovery", appliedOn:"2026-01-20", status:"Pending"  },
    { id:2, empId:"EMP002", name:"Jane Smith",      department:"HR",       leaveType:"Casual Leave",     startDate:"2026-02-01", endDate:"2026-02-03", days:3, reason:"Personal work",               appliedOn:"2026-01-19", status:"Pending"  },
    { id:3, empId:"EMP003", name:"Mike Johnson",    department:"Finance",  leaveType:"Annual Leave",     startDate:"2026-01-22", endDate:"2026-01-23", days:2, reason:"Family function",             appliedOn:"2026-01-18", status:"Approved" },
    { id:4, empId:"EMP004", name:"Sarah Williams",  department:"IT",       leaveType:"Sick Leave",       startDate:"2026-01-20", endDate:"2026-01-20", days:1, reason:"Fever",                      appliedOn:"2026-01-19", status:"Rejected" },
    { id:5, empId:"EMP005", name:"David Brown",     department:"Marketing",leaveType:"Emergency Leave",  startDate:"2026-02-05", endDate:"2026-02-07", days:3, reason:"Vacation trip",              appliedOn:"2026-01-21", status:"Pending"  },
  ]);

  const stats = {
    total:    leaveRequests.length,
    pending:  leaveRequests.filter(r => r.status === "Pending").length,
    approved: leaveRequests.filter(r => r.status === "Approved").length,
    rejected: leaveRequests.filter(r => r.status === "Rejected").length,
  };

  const filtered = leaveRequests.filter(r =>
    (r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.empId.toLowerCase().includes(searchTerm.toLowerCase()) || r.department.toLowerCase().includes(searchTerm.toLowerCase()) || r.leaveType.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === "all" || r.status.toLowerCase() === filterStatus.toLowerCase())
  );

  const handleApprove = (id) => { setLeaveRequests(prev => prev.map(r => r.id === id ? {...r, status:"Approved"} : r)); setViewingRequest(null); };
  const handleReject  = (id) => { setLeaveRequests(prev => prev.map(r => r.id === id ? {...r, status:"Rejected"} : r)); setViewingRequest(null); };

  const statusBadge = (s) => ({ Approved:"bg-emerald-100 text-emerald-700", Rejected:"bg-red-100 text-red-700", Pending:"bg-amber-100 text-amber-700" }[s] || "bg-gray-100 text-gray-600");
  const accentFrom = role === "admin" ? "from-indigo-500 to-violet-600" : "from-teal-500 to-emerald-600";

  if (!user) return null;
  return (
    <PageLayout role={role} activePage={role === "admin" ? "Leave" : "Leave Management"}
      title={role === "admin" ? "System-Wide Leave" : "Leave Management"}
      subtitle="Approve and manage employee leave requests"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            { label:"Total",    value:stats.total,    gradient:"from-indigo-400 to-violet-500" },
            { label:"Pending",  value:stats.pending,  gradient:"from-amber-400 to-orange-500" },
            { label:"Approved", value:stats.approved, gradient:"from-emerald-400 to-teal-500" },
            { label:"Rejected", value:stats.rejected, gradient:"from-red-400 to-rose-500" },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.gradient} p-6 rounded-2xl text-white hover:-translate-y-1 transition-all duration-300`}>
              <p className="text-white/80 text-sm mb-1">{s.label}</p>
              <p className="text-4xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name, ID, department, or leave type…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50" />
            </div>
            <div className="relative">
              <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 appearance-none">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`bg-gradient-to-r ${accentFrom} text-white text-xs`}>
                  {["Emp ID","Employee","Dept","Leave Type","Duration","Days","Applied","Status","Actions"].map(h => <th key={h} className="px-5 py-4 text-left font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r, i) => (
                  <tr key={r.id} className={`hover:bg-teal-50/40 transition-colors ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
                    <td className="px-5 py-3.5 font-mono font-semibold text-gray-700">{r.empId}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{r.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{r.department}</td>
                    <td className="px-5 py-3.5 text-gray-600">{r.leaveType}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{r.startDate} → {r.endDate}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{r.days}</td>
                    <td className="px-5 py-3.5 text-gray-400">{r.appliedOn}</td>
                    <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(r.status)}`}>{r.status}</span></td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setViewingRequest(r)} className="flex items-center gap-1 text-teal-600 hover:text-teal-800 font-semibold text-xs"><Eye size={13} /> View</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={9} className="text-center py-10 text-gray-400">No leave requests found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
            <div className={`flex items-center justify-between p-6 bg-gradient-to-r ${accentFrom} text-white rounded-t-2xl`}>
              <h3 className="text-xl font-bold">Leave Request Details</h3>
              <button onClick={() => setViewingRequest(null)} className="p-1.5 hover:bg-white/20 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[["Employee ID",viewingRequest.empId],["Name",viewingRequest.name],["Department",viewingRequest.department],["Leave Type",viewingRequest.leaveType],["Start Date",viewingRequest.startDate],["End Date",viewingRequest.endDate],["Total Days",`${viewingRequest.days} day(s)`],["Applied On",viewingRequest.appliedOn]].map(([l,v]) => (
                  <div key={l}><p className="text-xs text-gray-400 mb-0.5">{l}</p><p className="font-semibold text-gray-800">{v}</p></div>
                ))}
              </div>
              <div><p className="text-xs text-gray-400 mb-1">Reason</p><p className="bg-gray-50 p-3 rounded-xl text-sm text-gray-700">{viewingRequest.reason}</p></div>
              <div><p className="text-xs text-gray-400 mb-1">Status</p><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(viewingRequest.status)}`}>{viewingRequest.status}</span></div>
              {viewingRequest.status === "Pending" && (
                <div className="flex gap-3">
                  <button onClick={() => handleApprove(viewingRequest.id)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"><CheckCircle size={15} /> Approve</button>
                  <button onClick={() => handleReject(viewingRequest.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"><XCircle size={15} /> Reject</button>
                </div>
              )}
              <button onClick={() => setViewingRequest(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

// Export both HR and Admin leave pages from this shared component
export const HRLeave = () => <LeaveManagement role="hr" />;
export const AdminLeave = () => <LeaveManagement role="admin" />;
export default HRLeave;
