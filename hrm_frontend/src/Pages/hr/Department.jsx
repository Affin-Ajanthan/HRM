import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, Plus, Pencil, Trash2, Eye, X, Search, ChevronRight,
  Briefcase, Users, CheckCircle, XCircle, AlertCircle, Loader,
  Menu, LayoutDashboard, CalendarCheck, FileText, DollarSign,
  BarChart3, LogOut, Bell, Save, ArrowLeft, Tag,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:5004/api";

const api = {
  get: async (path) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  post: async (path, body) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  },
  put: async (path, body) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  },
  delete: async (path) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, removeToast }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in
          ${t.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : t.type === "error" ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-blue-50 text-blue-700 border border-blue-200"}`}
      >
        {t.type === "success" ? <CheckCircle size={15} /> : t.type === "error" ? <XCircle size={15} /> : <AlertCircle size={15} />}
        {t.message}
        <button onClick={() => removeToast(t.id)} className="ml-1 opacity-60 hover:opacity-100"><X size={13} /></button>
      </div>
    ))}
  </div>
);

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-red-100 p-2 rounded-lg"><Trash2 className="text-red-600" size={20} /></div>
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        </div>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── DEPARTMENT FORM MODAL ────────────────────────────────────────────────────
const DepartmentModal = ({ open, dept, employees, onClose, onSave, saving }) => {
  const [form, setForm] = useState({ name: "", description: "", managerId: "", active: true });

  useEffect(() => {
    if (dept) {
      setForm({
        name: dept.name || "",
        description: dept.description || "",
        managerId: dept.managerId || "",
        active: dept.active !== undefined ? dept.active : true,
      });
    } else {
      setForm({ name: "", description: "", managerId: "", active: true });
    }
  }, [dept, open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, managerId: form.managerId || null });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg"><Building2 className="text-white" size={20} /></div>
            <div>
              <h2 className="text-white font-bold text-lg">{dept ? "Edit Department" : "Add Department"}</h2>
              <p className="text-blue-200 text-xs">{dept ? "Update department information" : "Create a new department"}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Engineering, Marketing, HR..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of this department..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Department Manager</label>
            <select
              value={form.managerId}
              onChange={(e) => setForm({ ...form, managerId: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">— No Manager Assigned —</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.fullName} ({e.designation || e.role})</option>
              ))}
            </select>
          </div>

          {dept && (
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
              <button
                onClick={() => setForm({ ...form, active: !form.active })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                  ${form.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
              >
                {form.active ? <CheckCircle size={13} /> : <XCircle size={13} />}
                {form.active ? "Active" : "Inactive"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.name.trim()}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
            {dept ? "Update" : "Create"} Department
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── JOB ROLE FORM ────────────────────────────────────────────────────────────
const JobRoleModal = ({ open, role, departmentName, onClose, onSave, saving }) => {
  const [form, setForm] = useState({ title: "", description: "", minSalary: "", maxSalary: "", active: true });

  useEffect(() => {
    if (role) {
      setForm({
        title: role.title || "",
        description: role.description || "",
        minSalary: role.minSalary || "",
        maxSalary: role.maxSalary || "",
        active: role.active !== undefined ? role.active : true,
      });
    } else {
      setForm({ title: "", description: "", minSalary: "", maxSalary: "", active: true });
    }
  }, [role, open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSave({
      ...form,
      minSalary: form.minSalary ? parseFloat(form.minSalary) : null,
      maxSalary: form.maxSalary ? parseFloat(form.maxSalary) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-violet-600 to-violet-700 p-5 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg"><Briefcase className="text-white" size={20} /></div>
            <div>
              <h2 className="text-white font-bold text-lg">{role ? "Edit Job Role" : "Add Job Role"}</h2>
              <p className="text-violet-200 text-xs">{departmentName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Software Engineer, Product Manager..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Role responsibilities and requirements..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Min Salary (LKR)</label>
              <input
                type="number"
                value={form.minSalary}
                onChange={(e) => setForm({ ...form, minSalary: e.target.value })}
                placeholder="50000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Max Salary (LKR)</label>
              <input
                type="number"
                value={form.maxSalary}
                onChange={(e) => setForm({ ...form, maxSalary: e.target.value })}
                placeholder="150000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {role && (
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
              <button
                onClick={() => setForm({ ...form, active: !form.active })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                  ${form.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
              >
                {form.active ? <CheckCircle size={13} /> : <XCircle size={13} />}
                {form.active ? "Active" : "Inactive"}
              </button>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.title.trim()}
            className="px-5 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
            {role ? "Update" : "Add"} Job Role
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── DEPARTMENT DETAIL PAGE ───────────────────────────────────────────────────
const DepartmentDetail = ({ dept, employees, onBack, addToast }) => {
  const [jobRoles, setJobRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleModal, setRoleModal] = useState({ open: false, role: null });
  const [confirm, setConfirm] = useState({ open: false, roleId: null });
  const [saving, setSaving] = useState(false);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/departments/${dept.id}/job-roles`);
      setJobRoles(res.data || []);
    } catch (e) {
      addToast("Failed to load job roles", "error");
    } finally {
      setLoading(false);
    }
  }, [dept.id]);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const handleSaveRole = async (form) => {
    setSaving(true);
    try {
      if (roleModal.role) {
        await api.put(`/departments/job-roles/${roleModal.role.id}`, form);
        addToast("Job role updated", "success");
      } else {
        await api.post(`/departments/${dept.id}/job-roles`, form);
        addToast("Job role added", "success");
      }
      setRoleModal({ open: false, role: null });
      loadRoles();
    } catch (e) {
      addToast(e.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    try {
      await api.delete(`/departments/job-roles/${confirm.roleId}`);
      addToast("Job role removed", "success");
      setConfirm({ open: false, roleId: null });
      loadRoles();
    } catch (e) {
      addToast(e.message || "Failed to delete", "error");
    }
  };

  const deptEmployees = employees.filter((e) => e.departmentId === dept.id);

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Departments
        </button>
      </div>

      {/* Dept Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Building2 className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{dept.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{dept.description || "No description provided"}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                  ${dept.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {dept.active ? "Active" : "Inactive"}
                </span>
                {dept.managerName && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users size={12} /> Manager: {dept.managerName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide">Employees</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">{deptEmployees.length}</p>
          </div>
          <div className="bg-violet-50 rounded-xl p-4">
            <p className="text-xs text-violet-500 font-semibold uppercase tracking-wide">Job Roles</p>
            <p className="text-3xl font-bold text-violet-700 mt-1">{jobRoles.filter(r => r.active).length}</p>
          </div>
        </div>
      </div>

      {/* Job Roles Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-violet-600" />
            <h3 className="font-bold text-gray-800">Job Roles</h3>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
              {jobRoles.length}
            </span>
          </div>
          <button
            onClick={() => setRoleModal({ open: true, role: null })}
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700 transition-all"
          >
            <Plus size={15} /> Add Job Role
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-violet-600" size={24} />
          </div>
        ) : jobRoles.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No job roles yet</p>
            <p className="text-sm">Add job roles for this department</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {jobRoles.map((role) => (
              <div key={role.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Tag size={16} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{role.title}</p>
                    {role.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{role.description}</p>}
                    {(role.minSalary || role.maxSalary) && (
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">
                        LKR {role.minSalary?.toLocaleString()} – {role.maxSalary?.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                    ${role.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                    {role.active ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => setRoleModal({ open: true, role })}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setConfirm({ open: true, roleId: role.id })}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Employees in Department */}
      {deptEmployees.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h3 className="font-bold text-gray-800">Employees in Department</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{deptEmployees.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {deptEmployees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {emp.fullName?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{emp.fullName}</p>
                  <p className="text-xs text-gray-500">{emp.designation || emp.role}</p>
                </div>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold
                  ${emp.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {emp.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <JobRoleModal
        open={roleModal.open}
        role={roleModal.role}
        departmentName={dept.name}
        onClose={() => setRoleModal({ open: false, role: null })}
        onSave={handleSaveRole}
        saving={saving}
      />
      <ConfirmDialog
        open={confirm.open}
        title="Remove Job Role"
        message="This job role will be deactivated. Employees with this role won't be affected."
        onConfirm={handleDeleteRole}
        onCancel={() => setConfirm({ open: false, roleId: null })}
      />
    </div>
  );
};

// ─── MAIN DEPARTMENT PAGE ─────────────────────────────────────────────────────
export default function Department() {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptModal, setDeptModal] = useState({ open: false, dept: null });
  const [confirm, setConfirm] = useState({ open: false, deptId: null, name: "" });
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [viewDept, setViewDept] = useState(null); // for detail view

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [deptRes, empRes] = await Promise.all([
        api.get("/departments"),
        api.get("/hr/employees"),
      ]);
      setDepartments(deptRes.data || []);
      setEmployees(empRes.data || []);
    } catch (e) {
      addToast("Failed to load data: " + e.message, "error");
      if (e.message.includes("401")) navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate, addToast]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) { navigate("/login"); return; }
    if (role !== "HR_MANAGER" && role !== "ADMIN") { navigate("/unauthorized"); return; }
    loadData();
  }, [navigate, loadData]);

  const handleSaveDept = async (form) => {
    setSaving(true);
    try {
      if (deptModal.dept) {
        await api.put(`/departments/${deptModal.dept.id}`, form);
        addToast("Department updated successfully", "success");
      } else {
        await api.post("/departments", form);
        addToast("Department created successfully", "success");
      }
      setDeptModal({ open: false, dept: null });
      loadData();
    } catch (e) {
      addToast(e.message || "Failed to save department", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/departments/${confirm.deptId}`);
      addToast(`"${confirm.name}" deactivated`, "success");
      setConfirm({ open: false, deptId: null, name: "" });
      loadData();
    } catch (e) {
      addToast(e.message || "Failed to delete", "error");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/hr/dashboard" },
    { name: "Employees", icon: Users, path: "/hr/employees" },
    { name: "Departments", icon: Building2, path: "/hr/department", active: true },
    { name: "Attendance", icon: CalendarCheck, path: "/hr/attendance" },
    { name: "Leave", icon: FileText, path: "/hr/leave" },
    { name: "Payslip", icon: DollarSign, path: "/hr/payslip" },
    { name: "Reports", icon: BarChart3, path: "/hr/reports" },
  ];

  const filtered = departments.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  // If viewing a specific department detail
  if (viewDept) {
    const fullDept = departments.find((d) => d.id === viewDept) || {};
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Toast toasts={toasts} removeToast={removeToast} />
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white shadow-lg transition-all duration-300 flex flex-col flex-shrink-0`}>
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            {isSidebarOpen && <img src={logo} alt="Logo" className="h-8 object-contain" />}
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded">
              <Menu size={20} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${item.active ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <item.icon size={18} />
                {isSidebarOpen && <span>{item.name}</span>}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-100">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
              <LogOut size={18} />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <DepartmentDetail
            dept={fullDept}
            employees={employees}
            onBack={() => setViewDept(null)}
            addToast={addToast}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white shadow-lg transition-all duration-300 flex flex-col flex-shrink-0`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          {isSidebarOpen && <img src={logo} alt="Logo" className="h-8 object-contain" />}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded">
            <Menu size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${item.active ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <item.icon size={18} />
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Building2 size={22} className="text-blue-600" /> Department Management
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage departments and job roles</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
              <Bell size={18} />
            </button>
            <button
              onClick={() => setDeptModal({ open: true, dept: null })}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
            >
              <Plus size={16} /> Add Department
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Departments", value: departments.length, color: "blue", icon: Building2 },
              { label: "Active", value: departments.filter((d) => d.active).length, color: "emerald", icon: CheckCircle },
              { label: "Total Employees", value: employees.length, color: "violet", icon: Users },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-${s.color}-100 flex items-center justify-center`}>
                  <s.icon size={22} className={`text-${s.color}-600`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-4">#</th>
                  <th className="text-left px-5 py-4">Department</th>
                  <th className="text-left px-5 py-4">Manager</th>
                  <th className="text-left px-5 py-4">Employees</th>
                  <th className="text-left px-5 py-4">Status</th>
                  <th className="text-center px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12">
                    <Loader className="animate-spin text-blue-500 mx-auto" size={24} />
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                    <Building2 size={36} className="mx-auto mb-2 opacity-30" />
                    <p>No departments found</p>
                  </td></tr>
                ) : filtered.map((dept, idx) => {
                  const deptEmployees = employees.filter((e) => e.departmentId === dept.id);
                  return (
                    <tr
                      key={dept.id}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                      onClick={() => setViewDept(dept.id)}
                    >
                      <td className="px-5 py-4 text-sm text-gray-400">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                            {dept.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{dept.name}</p>
                            {dept.description && (
                              <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">{dept.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {dept.managerName || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <Users size={13} className="text-gray-400" />
                          {deptEmployees.length}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold
                          ${dept.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                          {dept.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewDept(dept.id)}
                            className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setDeptModal({ open: true, dept })}
                            className="p-2 text-amber-500 hover:bg-amber-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setConfirm({ open: true, deptId: dept.id, name: dept.name })}
                            className="p-2 text-red-400 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                          <ChevronRight size={15} className="text-gray-300 group-hover:text-blue-400 ml-1" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      <DepartmentModal
        open={deptModal.open}
        dept={deptModal.dept}
        employees={employees}
        onClose={() => setDeptModal({ open: false, dept: null })}
        onSave={handleSaveDept}
        saving={saving}
      />
      <ConfirmDialog
        open={confirm.open}
        title="Deactivate Department"
        message={`"${confirm.name}" and all its job roles will be deactivated. Employees in this department won't be affected.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, deptId: null, name: "" })}
      />
    </div>
  );
}