import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, Edit, Trash2, Search, X } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";
import NotificationPopup from "../../components/NotificationPopup.jsx";

const Department = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", shortCode: "", manager: "", description: "" });

  const [departments, setDepartments] = useState([
    { id:1, name:"Human Resources",     shortCode:"HR",  manager:"John Smith",    totalEmployees:12, status:"Active", description:"Manages recruitment, payroll, and employee relations" },
    { id:2, name:"Information Technology",shortCode:"IT", manager:"Sarah Johnson", totalEmployees:28, status:"Active", description:"Handles all IT infrastructure and software development" },
    { id:3, name:"Finance",              shortCode:"FIN", manager:"Mike Wilson",   totalEmployees:15, status:"Active", description:"Manages accounting, budgeting, and financial planning" },
    { id:4, name:"Marketing",            shortCode:"MKT", manager:"Emily Davis",   totalEmployees:10, status:"Active", description:"Handles marketing campaigns and brand management" },
    { id:5, name:"Operations",           shortCode:"OPS", manager:"Robert Brown",  totalEmployees:20, status:"Active", description:"Manages daily operations and logistics" },
  ]);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) { const u = JSON.parse(s); if (u.role !== "HR_MANAGER" && u.role !== "ADMIN") { navigate("/unauthorized"); return; } setUser(u); }
    else navigate("/login");
  }, [navigate]);

  const handleAddDepartment = (e) => {
    e.preventDefault();
    setDepartments(prev => [...prev, { id: prev.length + 1, ...formData, totalEmployees: 0, status: "Active" }]);
    setFormData({ name: "", shortCode: "", manager: "", description: "" });
    setShowAddForm(false);
  };
  const handleDelete = (id) => setDepartments(prev => prev.filter(d => d.id !== id));
  const filtered = departments.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.shortCode.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!user) return null;
  return (
    <PageLayout role="hr" activePage="Departments" title="Departments" subtitle="Manage all departments and their details"
      actions={
        <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> Add Department
        </button>
      }
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search departments by name or code…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50" />
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-teal-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">Add New Department</h3>
              <button onClick={() => setShowAddForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddDepartment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[["Department Name","name","text"],["Short Code","shortCode","text"],["Manager","manager","text"]].map(([label,key,type]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label} *</label>
                    <input type={type} value={formData[key]} required onChange={e => setFormData({...formData,[key]:key==="shortCode"?e.target.value.toUpperCase():e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData,description:e.target.value})} rows="2"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold transition-colors">Save Department</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(dept => (
            <div key={dept.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{dept.name}</h3>
                    <p className="text-teal-100 text-sm mt-0.5">Code: {dept.shortCode}</p>
                  </div>
                  <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{dept.status}</span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div><p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Manager</p><p className="font-semibold text-gray-800 text-sm">{dept.manager}</p></div>
                <div><p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Description</p><p className="text-sm text-gray-600">{dept.description}</p></div>
                <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Total Employees</p>
                  <p className="text-2xl font-bold text-teal-600">{dept.totalEmployees}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-xs font-semibold transition-colors"><Edit size={13} /> Edit</button>
                  <button onClick={() => handleDelete(dept.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl text-xs font-semibold transition-colors"><Trash2 size={13} /> Delete</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <Building2 size={40} className="mx-auto mb-3 opacity-30" />
              <p>No departments found</p>
            </div>
          )}
        </div>
      </div>

      <NotificationPopup isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </PageLayout>
  );
};
export default Department;
