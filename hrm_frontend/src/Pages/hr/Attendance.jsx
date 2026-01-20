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
  Search,
  Download,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  TrendingUp,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const HRAttendance = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterStatus, setFilterStatus] = useState("all");

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/hr/dashboard" },
    { name: "Employees", icon: Users, path: "/hr/dashboard" },
    { name: "Departments", icon: Building2, path: "/hr/dashboard" },
    { name: "Attendance", icon: CalendarCheck, path: "/hr/attendance" },
    { name: "Leave Management", icon: FileText, path: "/hr/leave" },
    { name: "Payroll", icon: DollarSign, path: "/hr/payslip" },
    { name: "Reports", icon: BarChart3, path: "/hr/dashboard" },
  ];

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
    navigate(path);
  };

  // Sample attendance data
  const [attendanceData] = useState([
    {
      id: 1,
      empId: "EMP001",
      name: "John Doe",
      department: "IT",
      date: "2026-01-21",
      checkIn: "09:00 AM",
      checkOut: "06:00 PM",
      status: "Present",
      workHours: "9h 0m",
    },
    {
      id: 2,
      empId: "EMP002",
      name: "Jane Smith",
      department: "HR",
      date: "2026-01-21",
      checkIn: "08:45 AM",
      checkOut: "05:45 PM",
      status: "Present",
      workHours: "9h 0m",
    },
    {
      id: 3,
      empId: "EMP003",
      name: "Mike Johnson",
      department: "Finance",
      date: "2026-01-21",
      checkIn: "-",
      checkOut: "-",
      status: "Absent",
      workHours: "-",
    },
    {
      id: 4,
      empId: "EMP004",
      name: "Sarah Williams",
      department: "IT",
      date: "2026-01-21",
      checkIn: "09:15 AM",
      checkOut: "-",
      status: "Half Day",
      workHours: "4h 30m",
    },
    {
      id: 5,
      empId: "EMP005",
      name: "David Brown",
      department: "Marketing",
      date: "2026-01-21",
      checkIn: "09:30 AM",
      checkOut: "06:30 PM",
      status: "Present",
      workHours: "9h 0m",
    },
  ]);

  const stats = {
    totalEmployees: 45,
    present: 38,
    absent: 5,
    halfDay: 2,
    late: 8,
    onTime: 30,
  };

  const filteredData = attendanceData.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || record.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    alert("Exporting attendance data...");
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
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-10 w-10 rounded" />
            <div>
              <h1 className="font-bold text-lg">HRM System</h1>
              <p className="text-xs text-gray-500">HR Manager</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.fullName?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleMenuClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                item.name === "Attendance"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
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
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <CalendarCheck className="text-blue-600" size={32} />
                </div>
                Attendance Management
              </h2>
              <p className="text-sm text-gray-500 mt-1">Track and manage employee attendance</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Today's Date</p>
              <p className="text-lg font-bold text-gray-800">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100 text-sm">Total Employees</p>
                <Users size={20} />
              </div>
              <p className="text-3xl font-bold">{stats.totalEmployees}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100 text-sm">Present</p>
                <CheckCircle size={20} />
              </div>
              <p className="text-3xl font-bold">{stats.present}</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 p-5 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-red-100 text-sm">Absent</p>
                <XCircle size={20} />
              </div>
              <p className="text-3xl font-bold">{stats.absent}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-5 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-yellow-100 text-sm">Half Day</p>
                <Clock size={20} />
              </div>
              <p className="text-3xl font-bold">{stats.halfDay}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-100 text-sm">Late</p>
                <UserX size={20} />
              </div>
              <p className="text-3xl font-bold">{stats.late}</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-5 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-indigo-100 text-sm">On Time</p>
                <UserCheck size={20} />
              </div>
              <p className="text-3xl font-bold">{stats.onTime}</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half day">Half Day</option>
                </select>
              </div>

              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                <Download size={20} />
                Export Data
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Emp ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Employee Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Check In</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Check Out</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Work Hours</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((record, index) => (
                    <tr
                      key={record.id}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{record.empId}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{record.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{record.checkIn}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{record.checkOut}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{record.workHours}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            record.status === "Present"
                              ? "bg-green-100 text-green-700"
                              : record.status === "Absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No attendance records found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRAttendance;
