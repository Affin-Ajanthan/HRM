import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  DollarSign,
  Building2,
  BarChart3,
  LogOut,
  Bell,
  Menu,
  X,
  UserPlus,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  UserCheck,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const HRDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    todayPresent: 0,
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
    { name: "Overview", icon: LayoutDashboard, path: null },
    { name: "Employees", icon: Users, path: null },
    { name: "Departments", icon: Building2, path: null },
    { name: "Attendance", icon: CalendarCheck, path: "/hr/attendance" },
    { name: "Leave Management", icon: FileText, path: "/hr/leave" },
    { name: "Payroll", icon: DollarSign, path: "/hr/payslip" },
    { name: "Reports", icon: BarChart3, path: null },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-10 w-10 rounded" />
              <div>
                <h1 className="font-bold text-lg">HRM System</h1>
                <p className="text-xs text-gray-500">HR Manager</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded"
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
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
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
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{activeMenu}</h2>
            <p className="text-sm text-gray-500">HR Management Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                5
              </span>
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.fullName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {activeMenu === "Overview" && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <Users size={28} />
                    </div>
                  </div>
                  <p className="text-blue-100 text-sm font-medium mb-1 relative z-10">Total Employees</p>
                  <h3 className="text-4xl font-bold relative z-10">{stats.totalEmployees}</h3>
                  <p className="text-sm text-blue-100 mt-2 relative z-10">Across all departments</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <CheckCircle size={28} />
                    </div>
                  </div>
                  <p className="text-green-100 text-sm font-medium mb-1 relative z-10">Active Employees</p>
                  <h3 className="text-4xl font-bold relative z-10">{stats.activeEmployees}</h3>
                  <p className="text-sm text-green-100 mt-2 relative z-10">Currently working</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <Clock size={28} />
                    </div>
                  </div>
                  <p className="text-yellow-100 text-sm font-medium mb-1 relative z-10">Pending Leaves</p>
                  <h3 className="text-4xl font-bold relative z-10">{stats.pendingLeaves}</h3>
                  <p className="text-sm text-yellow-100 mt-2 relative z-10">Awaiting approval</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <UserCheck size={28} />
                    </div>
                  </div>
                  <p className="text-purple-100 text-sm font-medium mb-1 relative z-10">Today Present</p>
                  <h3 className="text-4xl font-bold relative z-10">{stats.todayPresent}</h3>
                  <p className="text-sm text-purple-100 mt-2 relative z-10">Checked in today</p>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Pending Leave Requests */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-bold mb-6 flex items-center justify-between text-gray-800">
                    <span className="flex items-center">
                      <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                        <FileText className="text-yellow-600" size={24} />
                      </div>
                      Pending Leave Requests
                    </span>
                    <span className="text-sm text-gray-500 font-normal bg-yellow-100 px-3 py-1 rounded-full">{stats.pendingLeaves} pending</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                        JD
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">John Doe</p>
                        <p className="text-sm text-gray-500">Annual Leave • 3 days</p>
                        <p className="text-xs text-gray-400">Jan 25-27, 2026</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-1">
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-1">
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition">
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                        SM
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Sarah Miller</p>
                        <p className="text-sm text-gray-500">Sick Leave • 2 days</p>
                        <p className="text-xs text-gray-400">Jan 22-23, 2026</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-1">
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-1">
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition">
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">
                        RJ
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Robert Johnson</p>
                        <p className="text-sm text-gray-500">Personal Leave • 1 day</p>
                        <p className="text-xs text-gray-400">Jan 24, 2026</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-1">
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-1">
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <LayoutDashboard className="text-blue-600" size={24} />
                    </div>
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2">
                      <UserPlus size={20} />
                      Add New Employee
                    </button>
                    <button className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2">
                      <DollarSign size={20} />
                      Generate Payslips
                    </button>
                    <button className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition flex items-center justify-center gap-2">
                      <BarChart3 size={20} />
                      Export Report
                    </button>
                    <button className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2">
                      <Building2 size={20} />
                      Manage Departments
                    </button>
                  </div>
                </div>
              </div>

              {/* Department Overview & Attendance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Department Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <Building2 className="text-purple-600" size={24} />
                    </div>
                    Employee Distribution
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Engineering</span>
                        <span className="text-sm font-bold text-blue-600">45 employees</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full" style={{width: '75%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Sales & Marketing</span>
                        <span className="text-sm font-bold text-green-600">32 employees</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{width: '53%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Human Resources</span>
                        <span className="text-sm font-bold text-purple-600">12 employees</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{width: '20%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Finance</span>
                        <span className="text-sm font-bold text-orange-600">18 employees</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 h-3 rounded-full" style={{width: '30%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Operations</span>
                        <span className="text-sm font-bold text-red-600">23 employees</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full" style={{width: '38%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Performers */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                      <Award className="text-yellow-600" size={24} />
                    </div>
                    Top Performers This Month
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <div className="text-2xl">🥇</div>
                      <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white">
                        AK
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Alice Kim</p>
                        <p className="text-sm text-gray-500">Engineering • 98% Performance</p>
                      </div>
                      <TrendingUp className="text-green-500" size={20} />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">🥈</div>
                      <div className="h-10 w-10 bg-purple-500 rounded-full flex items-center justify-center font-bold text-white">
                        MB
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Michael Brown</p>
                        <p className="text-sm text-gray-500">Sales • 95% Performance</p>
                      </div>
                      <TrendingUp className="text-green-500" size={20} />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">🥉</div>
                      <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center font-bold text-white">
                        EW
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Emma Wilson</p>
                        <p className="text-sm text-gray-500">Finance • 93% Performance</p>
                      </div>
                      <TrendingUp className="text-green-500" size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "Employees" && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Employee Management</h3>
              <p className="text-gray-500">Employee list and management interface will be implemented here.</p>
            </div>
          )}

          {activeMenu === "Departments" && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Department Management</h3>
              <p className="text-gray-500">Department management interface will be implemented here.</p>
            </div>
          )}

          {activeMenu === "Attendance" && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Attendance Monitoring</h3>
              <p className="text-gray-500">Attendance tracking interface will be implemented here.</p>
            </div>
          )}

          {activeMenu === "Leave Management" && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Leave Management</h3>
              <p className="text-gray-500">Leave approval interface will be implemented here.</p>
            </div>
          )}

          {activeMenu === "Payroll" && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Payroll Management</h3>
              <p className="text-gray-500">Payroll processing interface will be implemented here.</p>
            </div>
          )}

          {activeMenu === "Reports" && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Reports & Analytics</h3>
              <p className="text-gray-500">Reporting interface will be implemented here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HRDashboard;
