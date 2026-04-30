import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, Mail, Briefcase, Users, X } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";

const Employee = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ fullName:"", email:"", phone:"", department:"", designation:"", salary:"" });

  const [employees, setEmployees] = useState([
    { id:1, employeeId:"EMP001", fullName:"John Smith",    email:"john.smith@company.com",    phone:"+1 (555) 123-4567", department:"Human Resources",       designation:"HR Manager",          joiningDate:"2020-01-15", salary:75000, status:"Active" },
    { id:2, employeeId:"EMP002", fullName:"Sarah Johnson", email:"sarah.johnson@company.com", phone:"+1 (555) 234-5678", department:"Information Technology",  designation:"Senior Developer",    joiningDate:"2019-06-20", salary:95000, status:"Active" },
    { id:3, employeeId:"EMP003", fullName:"Mike Wilson",   email:"mike.wilson@company.com",   phone:"+1 (555) 345-6789", department:"Finance",                 designation:"Finance Manager",     joiningDate:"2021-03-10", salary:80000, status:"Active" },
    { id:4, employeeId:"EMP004", fullName:"Emily Davis",   email:"emily.davis@company.com",   phone:"+1 (555) 456-7890", department:"Marketing",               designation:"Marketing Lead",      joiningDate:"2020-11-05", salary:70000, status:"Active" },
    { id:5, employeeId:"EMP005", fullName:"Robert Brown",  email:"robert.brown@company.com",  phone:"+1 (555) 567-8901", department:"Operations",              designation:"Operations Manager",  joiningDate:"2018-08-12", salary:85000, status:"Active" },
  ]);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) { const u = JSON.parse(s); if (u.role !== "HR_MANAGER" && u.role !== "ADMIN") { navigate("/unauthorized"); return; } setUser(u); }
    else navigate("/login");
  }, [navigate]);

  const handleAddEmployee = (e) => {
    e.preventDefault();
    setEmployees(prev => [...prev, { id:prev.length+1, employeeId:`EMP${String(prev.length+1).padStart(3,"0")}`, ...formData, joiningDate:new Date().toISOString().split("T")[0], status:"Active" }]);
    setFormData({ fullName:"", email:"", phone:"", department:"", designation:"", salary:"" });
    setShowAddForm(false);
  };
  const handleDelete = (id) => setEmployees(prev => prev.filter(e => e.id !== id));
  const filtered = employees.filter(e => e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) || e.email.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!user) return null;
  return (
    <PageLayout role="hr" activePage="Employees" title="Employees" subtitle="Manage all employees and their information"
      actions={
        <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> Add Employee
        </button>
      }
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search employees by name, ID, or email…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50" />
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-teal-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">Add New Employee</h3>
              <button onClick={() => setShowAddForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[["Full Name","fullName","text"],["Email Address","email","email"],["Phone Number","phone","tel"],["Designation","designation","text"]].map(([label,key,type]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label} *</label>
                    <input type={type} value={formData[key]} required onChange={e => setFormData({...formData,[key]:e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Department *</label>
                  <select value={formData.department} required onChange={e => setFormData({...formData,department:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50">
                    <option value="">Select Department</option>
                    {["Human Resources","Information Technology","Finance","Marketing","Operations"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Salary *</label>
                  <input type="number" value={formData.salary} required onChange={e => setFormData({...formData,salary:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold transition-colors">Save Employee</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs">
                  {["ID","Name","Email","Department","Designation","Salary","Status","Actions"].map(h => <th key={h} className="px-5 py-4 text-left font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((emp, i) => (
                  <tr key={emp.id} className={`hover:bg-teal-50/40 transition-colors ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
                    <td className="px-5 py-3.5 font-mono font-semibold text-gray-700">{emp.employeeId}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">{emp.fullName.charAt(0)}</div>
                        <span className="font-medium text-gray-800">{emp.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{emp.email}</td>
                    <td className="px-5 py-3.5 text-gray-600">{emp.department}</td>
                    <td className="px-5 py-3.5 text-gray-600">{emp.designation}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">${Number(emp.salary).toLocaleString()}</td>
                    <td className="px-5 py-3.5"><span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">{emp.status}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">
                    <Users size={32} className="mx-auto mb-2 opacity-30" /><p>No employees found</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex items-center justify-between text-sm text-gray-500">
            <span>Total: <strong className="text-gray-800">{employees.length}</strong></span>
            <span>Showing <strong className="text-gray-800">{filtered.length}</strong> of <strong className="text-gray-800">{employees.length}</strong></span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
export default Employee;
