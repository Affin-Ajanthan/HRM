import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Search, Filter, Eye, CheckCircle, XCircle, Clock, X } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";

const AdminCompanies = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewingCompany, setViewingCompany] = useState(null);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) { const u = JSON.parse(s); if (u.role !== "ADMIN") { navigate("/unauthorized"); return; } setUser(u); }
    else navigate("/login");
  }, [navigate]);

  const [companies, setCompanies] = useState([
    { id: 1, name: "Tech Solutions Ltd",  industry: "IT Services",  contact: "contact@techsol.com",  phone: "+1 234 567 8901", employees: 50,  address: "123 Tech Park, Silicon Valley", submittedOn: "2026-02-22", status: "Pending"  },
    { id: 2, name: "Global Marketing Inc", industry: "Marketing",    contact: "info@globalmark.com",  phone: "+1 234 567 8902", employees: 120, address: "456 Market Blvd, New York",    submittedOn: "2026-02-21", status: "Pending"  },
    { id: 3, name: "ABC Corporation",      industry: "Finance",      contact: "admin@abccorp.com",    phone: "+1 234 567 8903", employees: 80,  address: "789 Finance Ave, Chicago",    submittedOn: "2026-02-19", status: "Active"   },
    { id: 4, name: "Blue Sky Retail",      industry: "Retail",       contact: "hello@bluesky.com",    phone: "+1 234 567 8904", employees: 30,  address: "22 Commerce St, Dallas",      submittedOn: "2026-02-17", status: "Rejected" },
    { id: 5, name: "MedCare Solutions",    industry: "Healthcare",   contact: "support@medcare.com",  phone: "+1 234 567 8905", employees: 200, address: "99 Health Rd, Boston",        submittedOn: "2026-02-23", status: "Pending"  },
  ]);

  const handleApprove = (id) => { setCompanies(c => c.map(x => x.id === id ? { ...x, status: "Active" } : x)); setViewingCompany(null); };
  const handleReject  = (id) => { setCompanies(c => c.map(x => x.id === id ? { ...x, status: "Rejected" } : x)); setViewingCompany(null); };

  const stats = {
    total:    companies.length,
    pending:  companies.filter(c => c.status === "Pending").length,
    active:   companies.filter(c => c.status === "Active").length,
    rejected: companies.filter(c => c.status === "Rejected").length,
  };

  const filtered = companies.filter(c => {
    const m = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const s = filterStatus === "all" || c.status.toLowerCase() === filterStatus;
    return m && s;
  });

  const statusBadge = (s) => ({ Active:"bg-emerald-100 text-emerald-700", Rejected:"bg-red-100 text-red-700", Pending:"bg-amber-100 text-amber-700" }[s] || "bg-gray-100 text-gray-600");

  if (!user) return null;
  return (
    <PageLayout role="admin" activePage="Companies" title="Company Management" subtitle="Review, approve, and manage all registered companies">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            { label:"Total Companies", value:stats.total,    icon:"🏢", gradient:"from-indigo-400 to-violet-500" },
            { label:"Pending",         value:stats.pending,  icon:"⏳", gradient:"from-amber-400 to-orange-500" },
            { label:"Active",          value:stats.active,   icon:"✅", gradient:"from-emerald-400 to-teal-500" },
            { label:"Rejected",        value:stats.rejected, icon:"❌", gradient:"from-red-400 to-rose-500" },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.gradient} p-6 rounded-2xl text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/80 text-sm">{s.label}</p>
                <span className="text-2xl">{s.icon}</span>
              </div>
              <p className="text-4xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or industry…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" />
            </div>
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 appearance-none">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
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
                <tr className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs">
                  {["Company","Industry","Contact","Employees","Submitted","Status","Actions"].map(h => (
                    <th key={h} className="px-5 py-4 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c, i) => (
                  <tr key={c.id} className={`hover:bg-indigo-50/40 transition-colors ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{c.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{c.industry}</td>
                    <td className="px-5 py-3.5 text-gray-600">{c.contact}</td>
                    <td className="px-5 py-3.5 font-semibold">{c.employees}</td>
                    <td className="px-5 py-3.5 text-gray-400">{c.submittedOn}</td>
                    <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(c.status)}`}>{c.status}</span></td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setViewingCompany(c)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-xs"><Eye size={14} /> View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {viewingCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-t-2xl">
              <h3 className="text-xl font-bold">Company Details</h3>
              <button onClick={() => setViewingCompany(null)} className="p-1.5 hover:bg-white/20 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-5 mb-5 text-sm">
                {[["Company Name",viewingCompany.name],["Industry",viewingCompany.industry],["Contact",viewingCompany.contact],["Phone",viewingCompany.phone],["Employees",viewingCompany.employees],["Submitted",viewingCompany.submittedOn]].map(([l,v]) => (
                  <div key={l}><p className="text-xs text-gray-400 mb-1">{l}</p><p className="font-semibold text-gray-800">{v}</p></div>
                ))}
              </div>
              <div className="mb-5"><p className="text-xs text-gray-400 mb-1">Address</p><p className="bg-gray-50 p-3 rounded-xl text-sm text-gray-700">{viewingCompany.address}</p></div>
              <div className="mb-5">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(viewingCompany.status)}`}>{viewingCompany.status}</span>
              </div>
              {viewingCompany.status === "Pending" && (
                <div className="flex gap-3 mb-3">
                  <button onClick={() => handleApprove(viewingCompany.id)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"><CheckCircle size={16} /> Approve</button>
                  <button onClick={() => handleReject(viewingCompany.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"><XCircle size={16} /> Reject</button>
                </div>
              )}
              <button onClick={() => setViewingCompany(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
export default AdminCompanies;