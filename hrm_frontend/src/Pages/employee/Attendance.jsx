import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  LayoutDashboard,
  CalendarDays,
  DollarSign,
  User,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const Attendance = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("January 2026");
  const [clockedIn, setClockedIn] = useState(false);

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
    { name: "Attendance", icon: Clock, path: "/employee/attendance" },
    { name: "Leave", icon: CalendarDays, path: "/employee/leave" },
    { name: "Payslip", icon: DollarSign, path: "/employee/payslip" },
    { name: "Profile", icon: User, path: "/employee/profile" },
  ];

  // Sample attendance data
  const attendanceStats = {
    totalDays: 21,
    present: 18,
    absent: 2,
    leave: 1,
    late: 3,
    workingHours: "152.5",
  };

  const attendanceHistory = [
    { date: "2026-01-21", day: "Tuesday", checkIn: "09:02 AM", checkOut: "06:15 PM", hours: "9h 13m", status: "Present" },
    { date: "2026-01-20", day: "Monday", checkIn: "08:55 AM", checkOut: "06:05 PM", hours: "9h 10m", status: "Present" },
    { date: "2026-01-17", day: "Friday", checkIn: "09:15 AM", checkOut: "06:00 PM", hours: "8h 45m", status: "Late" },
    { date: "2026-01-16", day: "Thursday", checkIn: "08:58 AM", checkOut: "06:10 PM", hours: "9h 12m", status: "Present" },
    { date: "2026-01-15", day: "Wednesday", checkIn: "-", checkOut: "-", hours: "-", status: "Leave" },
    { date: "2026-01-14", day: "Tuesday", checkIn: "-", checkOut: "-", hours: "-", status: "Absent" },
    { date: "2026-01-13", day: "Monday", checkIn: "09:00 AM", checkOut: "06:05 PM", hours: "9h 5m", status: "Present" },
  ];

  const handleClockIn = () => {
    setClockedIn(true);
    // Add API call here
  };

  const handleClockOut = () => {
    setClockedIn(false);
    // Add API call here
  };

  const getStatusBadge = (status) => {
    const badges = {
      Present: "bg-green-100 text-green-700",
      Absent: "bg-red-100 text-red-700",
      Leave: "bg-blue-100 text-blue-700",
      Late: "bg-yellow-100 text-yellow-700",
    };
    return badges[status] || "bg-gray-100 text-gray-700";
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

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.name === "Attendance"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

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
            <h2 className="text-2xl font-bold text-gray-800">Attendance Management</h2>
            <p className="text-sm text-gray-500">Track your attendance and working hours</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
              <Download size={20} />
              Export Report
            </button>
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

        <div className="p-6">

      {/* Clock In/Out Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <Clock className="text-blue-600" size={24} />
          </div>
          Today's Attendance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-gray-600 text-sm mb-2">Clock In</p>
            <p className="text-3xl font-bold text-blue-600">
              {clockedIn ? "09:02 AM" : "--:--"}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <p className="text-gray-600 text-sm mb-2">Clock Out</p>
            <p className="text-3xl font-bold text-orange-600">--:--</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p className="text-gray-600 text-sm mb-2">Working Hours</p>
            <p className="text-3xl font-bold text-green-600">
              {clockedIn ? "2h 15m" : "0h 0m"}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <p className="text-gray-600 text-sm mb-2">Status</p>
            <p className="text-2xl font-bold text-purple-600">
              {clockedIn ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          {!clockedIn ? (
            <button
              onClick={handleClockIn}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition flex items-center justify-center gap-2 font-semibold text-lg shadow-lg"
            >
              <CheckCircle size={24} />
              Clock In
            </button>
          ) : (
            <button
              onClick={handleClockOut}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 px-6 rounded-lg hover:from-red-600 hover:to-pink-700 transition flex items-center justify-center gap-2 font-semibold text-lg shadow-lg"
            >
              <XCircle size={24} />
              Clock Out
            </button>
          )}
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <p className="text-blue-100 text-sm mb-2">Total Days</p>
          <p className="text-4xl font-bold">{attendanceStats.totalDays}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <p className="text-green-100 text-sm mb-2">Present</p>
          <p className="text-4xl font-bold">{attendanceStats.present}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-pink-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <p className="text-red-100 text-sm mb-2">Absent</p>
          <p className="text-4xl font-bold">{attendanceStats.absent}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <p className="text-purple-100 text-sm mb-2">Leave</p>
          <p className="text-4xl font-bold">{attendanceStats.leave}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <p className="text-yellow-100 text-sm mb-2">Late</p>
          <p className="text-4xl font-bold">{attendanceStats.late}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <p className="text-indigo-100 text-sm mb-2">Hours</p>
          <p className="text-3xl font-bold">{attendanceStats.workingHours}h</p>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center text-gray-800">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <Calendar className="text-purple-600" size={24} />
            </div>
            Attendance History
          </h2>
          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>January 2026</option>
              <option>December 2024</option>

            </select>
            <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              <Filter size={20} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Day</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Check In</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Check Out</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Working Hours</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {attendanceHistory.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{record.date}</td>
                  <td className="p-4 text-gray-600">{record.day}</td>
                  <td className="p-4 text-gray-600">{record.checkIn}</td>
                  <td className="p-4 text-gray-600">{record.checkOut}</td>
                  <td className="p-4 font-semibold text-gray-800">{record.hours}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      </main>
    </div>
  );
};

export default Attendance;
