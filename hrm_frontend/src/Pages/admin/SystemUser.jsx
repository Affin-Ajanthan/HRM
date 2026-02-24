import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  FileText,
  Activity,
  LogOut,
  CalendarCheck,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  ShieldCheck,
  UserCog,
  UserPlus,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const AdminSystemUsers = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [viewingUser, setViewingUser] = useState(null);
  const [assignRoleModal, setAssignRoleModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Companies", icon: Building2, path: "/admin/companies" },
    { name: "System Users", icon: Users, path: "/admin/system-users" },
    { name: "Attendance", icon: CalendarCheck, path: "/admin/attendance" },
    { name: "Leave", icon: FileText, path: "/admin/leave" },
    { name: "Payroll", icon: Activity, path: "/admin/payslip" },
    { name: "System Config", icon: Settings, path: "/admin/system-config" },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role !== "ADMIN") {
        navigate("/unauthorized");
        return;
      }
      setUser(userData);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const [systemUsers, setSystemUsers] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@techsolutions.com",
      role: "HR Manager",
      company: "Tech Solutions Ltd",
      status: "Active",
      joinedOn: "2026-02-22",
    },
    {
      id: 2,
      name: "Bob Williams",
      email: "bob@globalmarketing.com",
      role: "Unassigned",
      company: "Global Marketing Inc",
      status: "Pending",
      joinedOn: "2026-02-21",
    },
    {
      id: 3,
      name: "Carol Smith",
      email: "carol@abccorp.com",
      role: "HR Manager",
      company: "ABC Corporation",
      status: "Active",
      joinedOn: "2026-02-19",
    },
    {
      id: 4,
      name: "David Lee",
      email: "david@system.com",
      role: "Admin",
      company: "System",
      status: "Active",
      joinedOn: "2026-01-10",
    },
    {
      id: 5,
      name: "Eva Martinez",
      email: "eva@medcare.com",
      role: "Unassigned",
      company: "MedCare Solutions",
      status: "Pending",
      joinedOn: "2026-02-23",
    },
    {
      id: 6,
      name: "Frank Brown",
      email: "frank@system.com",
      role: "Admin",
      company: "System",
      status: "Active",
      joinedOn: "2025-12-01",
    },
  ]);

  const stats = {
    total: systemUsers.length,
    hrManagers: systemUsers.filter((u) => u.role === "HR Manager").length,
    admins: systemUsers.filter((u) => u.role === "Admin").length,
    unassigned: systemUsers.filter((u) => u.role === "Unassigned").length,
  };

  const filteredData = systemUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      filterRole === "all" || u.role.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleAssignRole = (userId) => {
    if (!selectedRole) return;
    setSystemUsers(
      systemUsers.map((u) =>
        u.id === userId
          ? { ...u, role: selectedRole, status: "Active" }
          : u
      )
    );
    setAssignRoleModal(null);
    setViewingUser(null);
    setSelectedRole("");
  };

  const handleDeactivate = (userId) => {
    setSystemUsers(
      systemUsers.map((u) =>
        u.id === userId ? { ...u, status: "Inactive" } : u
      )
    );
    setViewingUser(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-10 w-10 rounded" />
            <div>
              <h1 className="font-bold text-lg">HRM System</h1>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.fullName?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleMenuClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                item.name === "System Users"
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-6 border-b">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Users className="text-purple-600" size={32} />
              </div>
              User & Role Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage all system users, assign HR Manager roles, and oversee platform administrators
            </p>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-100 text-sm">Total Users</p>
                <Users size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.total}</p>
              <p className="text-sm text-purple-100 mt-1">Platform-wide</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-yellow-100 text-sm">Unassigned</p>
                <UserPlus size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.unassigned}</p>
              <p className="text-sm text-yellow-100 mt-1">Needs role assignment</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100 text-sm">HR Managers</p>
                <UserCog size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.hrManagers}</p>
              <p className="text-sm text-green-100 mt-1">Active across companies</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-pink-100 text-sm">Admins</p>
                <ShieldCheck size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.admins}</p>
              <p className="text-sm text-pink-100 mt-1">System-level</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Roles</option>
                  <option value="hr manager">HR Manager</option>
                  <option value="admin">Admin</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Joined On</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((u, index) => (
                    <tr
                      key={u.id}
                      className={`hover:bg-purple-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{u.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{u.company}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.role === "Admin"
                              ? "bg-pink-100 text-pink-700"
                              : u.role === "HR Manager"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.joinedOn}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : u.status === "Inactive"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setViewingUser(u)}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-800 font-semibold"
                        >
                          <Eye size={16} />
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* User Detail / Manage Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-xl">
              <h3 className="text-2xl font-bold">Manage User</h3>
              <p className="text-purple-100 text-sm mt-1">View details and manage role/status</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="font-semibold text-gray-800">{viewingUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-semibold text-gray-800">{viewingUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Company</p>
                  <p className="font-semibold text-gray-800">{viewingUser.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Joined On</p>
                  <p className="font-semibold text-gray-800">{viewingUser.joinedOn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Current Role</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      viewingUser.role === "Admin"
                        ? "bg-pink-100 text-pink-700"
                        : viewingUser.role === "HR Manager"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {viewingUser.role}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      viewingUser.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : viewingUser.status === "Inactive"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {viewingUser.status}
                  </span>
                </div>
              </div>

              {/* Assign / Change Role */}
              <div className="mb-6 bg-purple-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-2">
                  <UserCog size={16} /> Assign / Change Role
                </p>
                <div className="flex gap-3">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="flex-1 px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select a role...</option>
                    <option value="HR Manager">HR Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Unassigned">Unassigned</option>
                  </select>
                  <button
                    onClick={() => handleAssignRole(viewingUser.id)}
                    disabled={!selectedRole}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Assign
                  </button>
                </div>
              </div>

              {/* Deactivate */}
              {viewingUser.status === "Active" && (
                <button
                  onClick={() => handleDeactivate(viewingUser.id)}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors mb-3"
                >
                  <XCircle size={20} />
                  Deactivate User
                </button>
              )}

              <button
                onClick={() => { setViewingUser(null); setSelectedRole(""); }}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSystemUsers;
