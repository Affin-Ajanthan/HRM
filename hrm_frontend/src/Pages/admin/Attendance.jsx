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
  Download,
  Filter,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const AdminAttendance = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");

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

  // Sample department-wise attendance data
  const [departmentData] = useState([
    {
      id: 1,
      department: "IT",
      totalEmployees: 25,
      present: 22,
      absent: 2,
      halfDay: 1,
      lateCount: 5,
      avgWorkHours: "8.5",
    },
    {
      id: 2,
      department: "HR",
      totalEmployees: 10,
      present: 9,
      absent: 1,
      halfDay: 0,
      lateCount: 2,
      avgWorkHours: "9.0",
    },
    {
      id: 3,
      department: "Finance",
      totalEmployees: 15,
      present: 13,
      absent: 1,
      halfDay: 1,
      lateCount: 3,
      avgWorkHours: "8.7",
    },
    {
      id: 4,
      department: "Marketing",
      totalEmployees: 12,
      present: 11,
      absent: 1,
      halfDay: 0,
      lateCount: 4,
      avgWorkHours: "8.3",
    },
    {
      id: 5,
      department: "Operations",
      totalEmployees: 18,
      present: 16,
      absent: 2,
      halfDay: 0,
      lateCount: 6,
      avgWorkHours: "8.8",
    },
  ]);

  const stats = {
    totalEmployees: departmentData.reduce((sum, d) => sum + d.totalEmployees, 0),
    totalPresent: departmentData.reduce((sum, d) => sum + d.present, 0),
    totalAbsent: departmentData.reduce((sum, d) => sum + d.absent, 0),
    totalLate: departmentData.reduce((sum, d) => sum + d.lateCount, 0),
    avgAttendance: ((departmentData.reduce((sum, d) => sum + d.present, 0) / 
                     departmentData.reduce((sum, d) => sum + d.totalEmployees, 0)) * 100).toFixed(1),
  };

  const filteredData = departmentData.filter((dept) => {
    const matchesSearch = dept.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || dept.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

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
                item.name === "Attendance"
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <CalendarCheck className="text-purple-600" size={32} />
                </div>
                System-Wide Attendance Overview
              </h2>
              <p className="text-sm text-gray-500 mt-1">Monitor attendance across all departments</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Today's Date</p>
              <p className="text-lg font-bold text-gray-800">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-100 text-sm">Total Employees</p>
                <Users size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.totalEmployees}</p>
              <p className="text-sm text-purple-100 mt-1">All departments</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100 text-sm">Present Today</p>
                <CheckCircle size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.totalPresent}</p>
              <p className="text-sm text-green-100 mt-1">{stats.avgAttendance}% attendance</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-red-100 text-sm">Absent</p>
                <XCircle size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.totalAbsent}</p>
              <p className="text-sm text-red-100 mt-1">Across all depts</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-orange-100 text-sm">Late Arrivals</p>
                <Clock size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.totalLate}</p>
              <p className="text-sm text-orange-100 mt-1">Past 9:00 AM</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100 text-sm">Avg Attendance</p>
                <TrendingUp size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.avgAttendance}%</p>
              <p className="text-sm text-blue-100 mt-1">This month</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Departments</option>
                  {departmentData.map((dept) => (
                    <option key={dept.id} value={dept.department}>{dept.department}</option>
                  ))}
                </select>
              </div>

              <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg">
                <Download size={20} />
                Export Report
              </button>
            </div>
          </div>

          {/* Department Attendance Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Total Employees</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Present</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Absent</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Half Day</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Late Count</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Avg Work Hours</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((dept, index) => {
                    const attendancePercent = ((dept.present / dept.totalEmployees) * 100).toFixed(1);
                    return (
                      <tr
                        key={dept.id}
                        className={`hover:bg-purple-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-bold text-gray-800">{dept.department}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{dept.totalEmployees}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                            {dept.present}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                            {dept.absent}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-semibold">
                            {dept.halfDay}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-orange-600 font-semibold">{dept.lateCount}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{dept.avgWorkHours}h</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                              <div
                                className={`h-2 rounded-full ${
                                  attendancePercent >= 90 ? "bg-green-500" :
                                  attendancePercent >= 70 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ width: `${attendancePercent}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-gray-800">{attendancePercent}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAttendance;
