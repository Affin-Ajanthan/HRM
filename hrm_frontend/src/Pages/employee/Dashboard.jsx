import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClockIcon,
  CalendarDays,
  DollarSign,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Award,
  Target,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Gift,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const EmployeeDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    presentDays: 0,
    leaveBalance: 0,
    pendingLeaves: 0,
    lastSalary: "0.00",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/employee/dashboard" },
    { name: "Attendance", icon: ClockIcon, path: "/employee/attendance" },
    { name: "Leave", icon: CalendarDays, path: "/employee/leave" },
    { name: "Payslip", icon: DollarSign, path: "/employee/payslip" },
    { name: "Profile", icon: User, path: "/employee/profile" },
  ];

  const handleMenuClick = (item) => {
    if (item.path && item.name !== "Overview") {
      navigate(item.path);
    } else {
      setActiveMenu(item.name);
    }
  };

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
                <p className="text-xs text-gray-500">Employee Portal</p>
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
              onClick={() => handleMenuClick(item)}
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
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome, {user.fullName}!
            </h2>
            <p className="text-sm text-gray-500">Employee Dashboard - {activeMenu}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                2
              </span>
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.employeeId || "Employee"}</p>
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
                      <ClockIcon size={28} />
                    </div>
                  </div>
                  <p className="text-blue-100 text-sm font-medium mb-1 relative z-10">Present Days</p>
                  <h3 className="text-4xl font-bold relative z-10">{stats.presentDays}</h3>
                  <p className="text-sm text-blue-100 mt-2 relative z-10">This month</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <Calendar size={28} />
                    </div>
                  </div>
                  <p className="text-green-100 text-sm font-medium mb-1 relative z-10">Leave Balance</p>
                  <h3 className="text-4xl font-bold relative z-10">{stats.leaveBalance}</h3>
                  <p className="text-sm text-green-100 mt-2 relative z-10">Days available</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <CalendarDays size={28} />
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
                      <DollarSign size={28} />
                    </div>
                  </div>
                  <p className="text-purple-100 text-sm font-medium mb-1 relative z-10">Last Salary</p>
                  <h3 className="text-3xl font-bold relative z-10">Rs. {stats.lastSalary}</h3>
                  <p className="text-sm text-purple-100 mt-2 relative z-10">January 2026</p>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Today's Attendance */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <ClockIcon className="text-blue-600" size={24} />
                    </div>
                    Today's Attendance
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-gray-500 text-sm mb-2">Clock In</p>
                      <p className="text-3xl font-bold text-blue-600">--:--</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-gray-500 text-sm mb-2">Clock Out</p>
                      <p className="text-3xl font-bold text-orange-600">--:--</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-gray-500 text-sm mb-2">Working Hours</p>
                      <p className="text-3xl font-bold text-green-600">0h 0m</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 font-semibold">
                      <ClockIcon size={20} />
                      Clock In
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-400 py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 font-semibold">
                      <ClockIcon size={20} />
                      Clock Out
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <LayoutDashboard className="text-gray-700" size={24} />
                    </div>
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/employee/leave')}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                    >
                      <CalendarDays size={20} />
                      Apply for Leave
                    </button>
                    <button 
                      onClick={() => navigate('/employee/payslip')}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                    >
                      <DollarSign size={20} />
                      View Payslip
                    </button>
                    <button 
                      onClick={() => navigate('/employee/profile')}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                    >
                      <User size={20} />
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Performance & Upcoming Events */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Performance Metrics */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <Target className="text-green-600" size={24} />
                    </div>
                    My Performance
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Attendance Rate</span>
                        <span className="text-sm font-bold text-green-600">95%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{width: '95%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Task Completion</span>
                        <span className="text-sm font-bold text-blue-600">88%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full" style={{width: '88%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Team Collaboration</span>
                        <span className="text-sm font-bold text-purple-600">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{width: '92%'}}></div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Award className="text-yellow-600" size={24} />
                        <div>
                          <p className="font-semibold text-yellow-800">Great Job!</p>
                          <p className="text-sm text-yellow-700">You're performing above average</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                    <div className="bg-orange-100 p-2 rounded-lg mr-3">
                      <Calendar className="text-orange-600" size={24} />
                    </div>
                    Upcoming Events
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="bg-blue-500 text-white p-2 rounded">
                        <Calendar size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Team Meeting</p>
                        <p className="text-sm text-gray-600">Tomorrow at 10:00 AM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="bg-purple-500 text-white p-2 rounded">
                        <Award size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Performance Review</p>
                        <p className="text-sm text-gray-600">Jan 25, 2026 at 2:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="bg-green-500 text-white p-2 rounded">
                        <Gift size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Company Anniversary</p>
                        <p className="text-sm text-gray-600">Jan 28, 2026</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Notifications */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                  <div className="bg-red-100 p-2 rounded-lg mr-3">
                    <Bell className="text-red-600" size={24} />
                  </div>
                  Recent Notifications
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                    <CheckCircle2 className="text-green-500 mt-1" size={20} />
                    <div className="flex-1">
                      <p className="font-medium">Leave Approved</p>
                      <p className="text-sm text-gray-500">Your annual leave request has been approved</p>
                      <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                    <DollarSign className="text-purple-500 mt-1" size={20} />
                    <div className="flex-1">
                      <p className="font-medium">Payslip Available</p>
                      <p className="text-sm text-gray-500">Your January 2026 payslip is ready to view</p>
                      <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                    <TrendingUp className="text-blue-500 mt-1" size={20} />
                    <div className="flex-1">
                      <p className="font-medium">Performance Update</p>
                      <p className="text-sm text-gray-500">Your performance score has improved by 5%</p>
                      <p className="text-xs text-gray-400 mt-1">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
