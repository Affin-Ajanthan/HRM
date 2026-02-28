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
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const Employee = () => {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Employees");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [employees, setEmployees] = useState([
    {
      id: 1,
      employeeId: "EMP001",
      fullName: "John Smith",
      email: "john.smith@company.com",
      phone: "+1 (555) 123-4567",
      department: "Human Resources",
      designation: "HR Manager",
      joiningDate: "2020-01-15",
      salary: 75000,
      status: "Active",
    },
    {
      id: 2,
      employeeId: "EMP002",
      fullName: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      phone: "+1 (555) 234-5678",
      department: "Information Technology",
      designation: "Senior Developer",
      joiningDate: "2019-06-20",
      salary: 95000,
      status: "Active",
    },
    {
      id: 3,
      employeeId: "EMP003",
      fullName: "Mike Wilson",
      email: "mike.wilson@company.com",
      phone: "+1 (555) 345-6789",
      department: "Finance",
      designation: "Finance Manager",
      joiningDate: "2021-03-10",
      salary: 80000,
      status: "Active",
    },
    {
      id: 4,
      employeeId: "EMP004",
      fullName: "Emily Davis",
      email: "emily.davis@company.com",
      phone: "+1 (555) 456-7890",
      department: "Marketing",
      designation: "Marketing Lead",
      joiningDate: "2020-11-05",
      salary: 70000,
      status: "Active",
    },
    {
      id: 5,
      employeeId: "EMP005",
      fullName: "Robert Brown",
      email: "robert.brown@company.com",
      phone: "+1 (555) 567-8901",
      department: "Operations",
      designation: "Operations Manager",
      joiningDate: "2018-08-12",
      salary: 85000,
      status: "Active",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    salary: "",
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
    { name: "Employees", icon: Users, path: "/hr/employees" },
    { name: "Departments", icon: Building2, path: "/hr/departments" },
    { name: "Attendance", icon: CalendarCheck, path: "/hr/attendance" },
    { name: "Leave Management", icon: FileText, path: "/hr/leave" },
    { name: "Payroll", icon: DollarSign, path: "/hr/payslip" },
    { name: "Reports", icon: BarChart3, path: null },
  ];

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = (e) => {
    e.preventDefault();
    const newEmp = {
      id: employees.length + 1,
      employeeId: `EMP${String(employees.length + 1).padStart(3, "0")}`,
      ...formData,
      joiningDate: new Date().toISOString().split("T")[0],
      status: "Active",
    };
    setEmployees([...employees, newEmp]);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      department: "",
      designation: "",
      salary: "",
    });
    setShowAddForm(false);
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
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
            <h2 className="text-2xl font-bold text-slate-800">Employees</h2>
            <p className="text-sm text-slate-500">
              Manage all employees and their information
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
                placeholder="Search employees by name, ID, or email..."
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
              Add Employee
            </button>
          </div>

          {/* Add Employee Form */}
          {showAddForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-t-4 border-teal-600">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Add New Employee
              </h3>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Information Technology">
                        Information Technology
                      </option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Designation *
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          designation: e.target.value,
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Salary *
                    </label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition font-semibold"
                  >
                    Save Employee
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

          {/* Employees Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        {emp.employeeId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {emp.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {emp.fullName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-slate-400" />
                          {emp.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {emp.department}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Briefcase size={16} className="text-slate-400" />
                          {emp.designation}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        ${Number(emp.salary).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No employees found</p>
              </div>
            )}

            {/* Footer Stats */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Total Employees: <span className="font-bold text-slate-800">{employees.length}</span>
              </p>
              <p className="text-sm text-slate-600">
                Showing <span className="font-bold text-slate-800">{filteredEmployees.length}</span> of{" "}
                <span className="font-bold text-slate-800">{employees.length}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Employee;
