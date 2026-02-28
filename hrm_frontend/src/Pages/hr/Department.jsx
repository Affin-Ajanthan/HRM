import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  FileText,
  DollarSign,
  BarChart3,
  LogOut,
  Bell,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import logo from "../../assets/logo.jpg";
import NotificationPopup from "../../components/NotificationPopup.jsx";

const Department = () => {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Departments");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: "Human Resources",
      shortCode: "HR",
      manager: "John Smith",
      totalEmployees: 12,
      status: "Active",
      description: "Manages recruitment, payroll, and employee relations",
    },
    {
      id: 2,
      name: "Information Technology",
      shortCode: "IT",
      manager: "Sarah Johnson",
      totalEmployees: 28,
      status: "Active",
      description: "Handles all IT infrastructure and software development",
    },
    {
      id: 3,
      name: "Finance",
      shortCode: "FIN",
      manager: "Mike Wilson",
      totalEmployees: 15,
      status: "Active",
      description: "Manages accounting, budgeting, and financial planning",
    },
    {
      id: 4,
      name: "Marketing",
      shortCode: "MKT",
      manager: "Emily Davis",
      totalEmployees: 10,
      status: "Active",
      description: "Handles marketing campaigns and brand management",
    },
    {
      id: 5,
      name: "Operations",
      shortCode: "OPS",
      manager: "Robert Brown",
      totalEmployees: 20,
      status: "Active",
      description: "Manages daily operations and logistics",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    shortCode: "",
    manager: "",
    description: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role !== "HR_MANAGER" && userData.role !== "ADMIN") {
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
    if (path) {
      navigate(path);
    } else {
      setActiveMenu("Overview");
    }
  };

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/hr/dashboard" },
    { name: "Employees", icon: Users, path: null },
    { name: "Departments", icon: Building2, path: "/hr/departments" },
    { name: "Attendance", icon: CalendarCheck, path: "/hr/attendance" },
    { name: "Leave Management", icon: FileText, path: "/hr/leave" },
    { name: "Payroll", icon: DollarSign, path: "/hr/payslip" },
    { name: "Reports", icon: BarChart3, path: null },
  ];

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDepartment = (e) => {
    e.preventDefault();
    const newDept = {
      id: departments.length + 1,
      ...formData,
      totalEmployees: 0,
      status: "Active",
    };
    setDepartments([...departments, newDept]);
    setFormData({ name: "", shortCode: "", manager: "", description: "" });
    setShowAddForm(false);
  };

  const handleDeleteDepartment = (id) => {
    setDepartments(departments.filter((dept) => dept.id !== id));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between border-slate-200">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-10 w-10 rounded" />
              <div>
                <h1 className="font-bold text-lg text-slate-800">HRM System</h1>
                <p className="text-xs text-slate-500">HR Manager</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleMenuClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === item.name
                  ? "bg-slate-600 text-white"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Departments</h2>
            <p className="text-sm text-slate-500">
              Manage all departments and their details
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-slate-100 rounded-full"
            >
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-0 right-0 h-4 w-4 bg-teal-500 rounded-full text-xs text-white flex items-center justify-center">
                2
              </span>
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">
                  {user.fullName}
                </p>
                <p className="text-xs text-slate-500">
                  {user.role === "ADMIN" ? "Administrator" : "HR Manager"}
                </p>
              </div>
              <div className="h-10 w-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.fullName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <NotificationPopup
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />

        <div className="p-6">
          {/* Controls */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search departments by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition font-semibold"
            >
              <Plus size={20} />
              Add Department
            </button>
          </div>

          {/* Add Department Form */}
          {showAddForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-t-4 border-teal-600">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Add New Department
              </h3>
              <form onSubmit={handleAddDepartment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Short Code *
                    </label>
                    <input
                      type="text"
                      value={formData.shortCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shortCode: e.target.value.toUpperCase(),
                        })
                      }
                      maxLength="3"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Department Manager *
                    </label>
                    <input
                      type="text"
                      value={formData.manager}
                      onChange={(e) =>
                        setFormData({ ...formData, manager: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition font-semibold"
                  >
                    Save Department
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Departments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-teal-600"
              >
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{dept.name}</h3>
                      <p className="text-slate-200 text-sm mt-1">
                        Code: {dept.shortCode}
                      </p>
                    </div>
                    <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {dept.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">MANAGER</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {dept.manager}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      DESCRIPTION
                    </p>
                    <p className="text-sm text-slate-700">
                      {dept.description}
                    </p>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                    <p className="text-xs text-slate-500 font-medium">
                      TOTAL EMPLOYEES
                    </p>
                    <p className="text-2xl font-bold text-teal-600">
                      {dept.totalEmployees}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition font-medium">
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(dept.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition font-medium"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredDepartments.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No departments found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Department;
