import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Filter, Eye, CheckCircle, XCircle, UserCog, UserPlus, ShieldCheck, X } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";

const AdminSystemUsers = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [viewingUser, setViewingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) { const u = JSON.parse(s); if (u.role !== "ADMIN") { navigate("/unauthorized"); return; } setUser(u); }
    else navigate("/login");
  }, [navigate]);

  const [systemUsers, setSystemUsers] = useState([
    { id:1, name:"Alice Johnson",  email:"alice@techsolutions.com",  role:"HR Manager", company:"Tech Solutions Ltd",  status:"Active",  joinedOn:"2026-02-22" },
    { id:2, name:"Bob Williams",   email:"bob@globalmarketing.com",  role:"Unassigned", company:"Global Marketing Inc",status:"Pending", joinedOn:"2026-02-21" },
    { id:3, name:"Carol Smith",    email:"carol@abccorp.com",        role:"HR Manager", company:"ABC Corporation",     status:"Active",  joinedOn:"2026-02-19" },
    { id:4, name:"David Lee",      email:"david@system.com",        role:"Admin",      company:"System",              status:"Active",  joinedOn:"2026-01-10" },
    { id:5, name:"Eva Martinez",   email:"eva@medcare.com",          role:"Unassigned", company:"MedCare Solutions",   status:"Pending", joinedOn:"2026-02-23" },
    { id:6, name:"Frank Brown",    email:"frank@system.com",        role:"Admin",      company:"System",              status:"Active",  joinedOn:"2025-12-01" },
  ]);

  const stats = {
    total: systemUsers.length,
    hrManagers: systemUsers.filter(u => u.role === "HR Manager").length,
    admins: systemUsers.filter(u => u.role === "Admin").length,
    unassigned: systemUsers.filter(u => u.role === "Unassigned").length,
  };

  const filtered = systemUsers.filter(u => {
    const m = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.company.toLowerCase().includes(searchTerm.toLowerCase());
    const r = filterRole === "all" || u.role.toLowerCase() === filterRole.toLowerCase();
    return m && r;
  });

  const handleAssignRole = (id) => {
    if (!selectedRole) return;
    setSystemUsers(users => users.map(u => u.id === id ? { ...u, role: selectedRole, status: "Active" } : u));
    setViewingUser(null); setSelectedRole("");
  };
  const handleDeactivate = (id) => { setSystemUsers(users => users.map(u => u.id === id ? { ...u, status: "Inactive" } : u)); setViewingUser(null); };

  const roleBadge = (r) => ({ Admin:"bg-violet-100 text-violet-700", "HR Manager":"bg-indigo-100 text-indigo-700", Unassigned:"bg-amber-100 text-amber-700" }[r] || "bg-gray-100 text-gray-600");
  const statusBadge = (s) => ({ Active:"bg-emerald-100 text-emerald-700", Inactive:"bg-red-100 text-red-700", Pending:"bg-amber-100 text-amber-700" }[s] || "bg-gray-100 text-gray-600");

  if (!user) return null;
  return (
    <PageLayout role="admin" activePage="System Users" title="User & Role Management" subtitle="Manage all system users, assign HR Manager roles, and oversee administrators">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            { label:"Total Users",  value:stats.total,      icon:"👥", gradient:"from-indigo-400 to-violet-500" },
            { label:"Unassigned",   value:stats.unassigned, icon:"⏳", gradient:"from-amber-400 to-orange-500" },
            { label:"HR Managers",  value:stats.hrManagers, icon:"🎯", gradient:"from-emerald-400 to-teal-500" },
            { label:"Admins",       value:stats.admins,     icon:"🛡", gradient:"from-violet-400 to-purple-600" },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.gradient} p-6 rounded-2xl text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}>
              <div className="flex items-center justify-between mb-2"><p className="text-white/80 text-sm">{s.label}</p><span className="text-2xl">{s.icon}</span></div>
              <p className="text-4xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name, email, or company…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" />
            </div>
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 appearance-none">
                <option value="all">All Roles</option>
                <option value="hr manager">HR Manager</option>
                <option value="admin">Admin</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs">
                  {["Name","Email","Company","Role","Joined","Status","Actions"].map(h => <th key={h} className="px-5 py-4 text-left font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u, i) => (
                  <tr key={u.id} className={`hover:bg-indigo-50/40 transition-colors ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{u.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3.5 text-gray-600">{u.company}</td>
                    <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge(u.role)}`}>{u.role}</span></td>
                    <td className="px-5 py-3.5 text-gray-400">{u.joinedOn}</td>
                    <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(u.status)}`}>{u.status}</span></td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setViewingUser(u)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-xs"><Eye size={14} /> Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manage Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-t-2xl">
              <div><h3 className="text-xl font-bold">Manage User</h3><p className="text-indigo-200 text-sm">{viewingUser.email}</p></div>
              <button onClick={() => { setViewingUser(null); setSelectedRole(""); }} className="p-1.5 hover:bg-white/20 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[["Name",viewingUser.name],["Company",viewingUser.company],["Role",null],["Status",null]].map(([l,v], i) => (
                  <div key={i}>
                    <p className="text-xs text-gray-400 mb-1">{l}</p>
                    {v ? <p className="font-semibold text-gray-800">{v}</p> : 
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${l === "Role" ? roleBadge(viewingUser.role) : statusBadge(viewingUser.status)}`}>
                        {l === "Role" ? viewingUser.role : viewingUser.status}
                      </span>}
                  </div>
                ))}
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl">
                <p className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2"><UserCog size={16} /> Assign / Change Role</p>
                <div className="flex gap-3">
                  <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-indigo-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">Select a role…</option>
                    <option value="HR Manager">HR Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Unassigned">Unassigned</option>
                  </select>
                  <button onClick={() => handleAssignRole(viewingUser.id)} disabled={!selectedRole}
                    className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5">
                    <CheckCircle size={15} /> Assign
                  </button>
                </div>
              </div>
              {viewingUser.status === "Active" && (
                <button onClick={() => handleDeactivate(viewingUser.id)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <XCircle size={16} /> Deactivate User
                </button>
              )}
              <button onClick={() => { setViewingUser(null); setSelectedRole(""); }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
export default AdminSystemUsers;