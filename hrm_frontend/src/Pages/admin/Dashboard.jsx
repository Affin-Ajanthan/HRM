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
  Bell,
  Menu,
  X,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CalendarCheck,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    systemHealth: "Good",
  });
  const navigate = useNavigate();

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
    if (path) {
      navigate(path);
    } else {
      setActiveMenu("Overview");
    }
  };

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: null },
    { name: "Companies", icon: Building2, path: null },
    { name: "System Users", icon: Users, path: null },
    { name: "Attendance", icon: CalendarCheck, path: "/admin/attendance" },
    { name: "Leave", icon: FileText, path: "/admin/leave" },
    { name: "Payroll", icon: Activity, path: "/admin/payslip" },
    { name: "System Config", icon: Settings, path: null },
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
                <p className="text-xs text-gray-500">Admin Panel</p>
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
            <p className="text-sm text-gray-500">System Administrator Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
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
              {/* Stats Cards with Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-blue-100 text-sm font-medium">Total Companies</p>
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <Building2 size={24} />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold mb-2">{stats.totalCompanies}</h3>
                  <div className="flex items-center text-sm bg-white bg-opacity-20 rounded-full px-3 py-1 w-fit">
                    <ArrowUpRight size={16} className="mr-1" />
                    <span className="font-semibold">12% from last month</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-yellow-100 text-sm font-medium">Pending Approvals</p>
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg animate-pulse">
                      <AlertCircle size={24} />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold mb-2">{stats.pendingApprovals}</h3>
                  <div className="flex items-center text-sm bg-white bg-opacity-20 rounded-full px-3 py-1 w-fit">
                    <Clock size={16} className="mr-1" />
                    <span className="font-semibold">Needs attention</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-green-100 text-sm font-medium">Active Users</p>
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <Users size={24} />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold mb-2">{stats.activeUsers}</h3>
                  <div className="flex items-center text-sm bg-white bg-opacity-20 rounded-full px-3 py-1 w-fit">
                    <ArrowUpRight size={16} className="mr-1" />
                    <span className="font-semibold">8% increase</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-purple-100 text-sm font-medium">System Health</p>
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <Activity size={24} />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold mb-2">{stats.systemHealth}</h3>
                  <div className="flex items-center text-sm bg-white bg-opacity-20 rounded-full px-3 py-1 w-fit">
                    <CheckCircle size={16} className="mr-1" />
                    <span className="font-semibold">All systems operational</span>
                  </div>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <Activity className="text-blue-600" size={24} />
                    </div>
                    Recent System Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="text-blue-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">New company registration</p>
                        <p className="text-sm text-gray-500">Tech Solutions Ltd - Pending Approval</p>
                        <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pending</span>
                    </div>
                    <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                      <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Settings className="text-purple-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">System configuration updated</p>
                        <p className="text-sm text-gray-500">Leave policy settings modified</p>
                        <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Updated</span>
                    </div>
                    <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Company approved</p>
                        <p className="text-sm text-gray-500">ABC Corporation - Now Active</p>
                        <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Approved</span>
                    </div>
                  </div>
                </div>

                {/* System Health Monitor */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <Activity className="text-green-600" size={24} />
                    </div>
                    System Health
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Server Uptime</span>
                        <span className="text-sm font-semibold text-green-600">99.9%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '99.9%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Database Load</span>
                        <span className="text-sm font-semibold text-blue-600">45%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">API Response</span>
                        <span className="text-sm font-semibold text-yellow-600">78%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '78%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Storage</span>
                        <span className="text-sm font-semibold text-orange-600">62%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '62%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Approvals Table */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-bold mb-6 flex items-center justify-between text-gray-800">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                      <Building2 className="text-yellow-600" size={24} />
                    </div>
                    Pending Company Approvals
                  </div>
                  <span className="text-sm font-normal text-gray-500 bg-yellow-100 px-3 py-1 rounded-full">2 pending</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Company Name</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Contact</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Employees</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Submitted</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">Tech Solutions Ltd</div>
                          <div className="text-sm text-gray-500">IT Services</div>
                        </td>
                        <td className="p-3 text-sm">contact@techsol.com</td>
                        <td className="p-3 text-sm">~50</td>
                        <td className="p-3 text-sm">2 hours ago</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">Approve</button>
                            <button className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Reject</button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">Global Marketing Inc</div>
                          <div className="text-sm text-gray-500">Marketing</div>
                        </td>
                        <td className="p-3 text-sm">info@globalmark.com</td>
                        <td className="p-3 text-sm">~120</td>
                        <td className="p-3 text-sm">1 day ago</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">Approve</button>
                            <button className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Reject</button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "Companies" && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Company Management</h3>
              <p className="text-gray-500">Company approval and management interface will be implemented here.</p>
            </div>
          )}

          {activeMenu === "System Users" && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">System Users</h3>
              <p className="text-gray-500">User management interface will be implemented here.</p>
            </div>
          )}

          {activeMenu === "System Config" && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">System Configuration</h3>
              <p className="text-gray-500">System settings interface will be implemented here.</p>
            </div>
          )}

          {activeMenu === "Audit Logs" && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Audit Logs</h3>
              <p className="text-gray-500">Audit trail viewer will be implemented here.</p>
            </div>
          )}

          {activeMenu === "Analytics" && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">System Analytics</h3>
              <p className="text-gray-500">Analytics dashboard will be implemented here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
