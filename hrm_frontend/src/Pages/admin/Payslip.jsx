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
  DollarSign,
  Search,
  Download,
  Eye,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const AdminPayslip = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingPayslip, setViewingPayslip] = useState(null);

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

  const [departmentPayroll] = useState([
    {
      id: 1,
      department: "IT",
      employees: 25,
      totalSalary: 1375000,
      avgSalary: 55000,
      processed: 25,
      pending: 0,
    },
    {
      id: 2,
      department: "HR",
      employees: 10,
      totalSalary: 490000,
      avgSalary: 49000,
      processed: 9,
      pending: 1,
    },
    {
      id: 3,
      department: "Finance",
      employees: 15,
      totalSalary: 787500,
      avgSalary: 52500,
      processed: 14,
      pending: 1,
    },
    {
      id: 4,
      department: "Marketing",
      employees: 12,
      totalSalary: 732000,
      avgSalary: 61000,
      processed: 12,
      pending: 0,
    },
    {
      id: 5,
      department: "Operations",
      employees: 18,
      totalSalary: 846000,
      avgSalary: 47000,
      processed: 18,
      pending: 0,
    },
  ]);

  const stats = {
    totalEmployees: departmentPayroll.reduce((sum, d) => sum + d.employees, 0),
    totalPayroll: departmentPayroll.reduce((sum, d) => sum + d.totalSalary, 0),
    totalProcessed: departmentPayroll.reduce((sum, d) => sum + d.processed, 0),
    totalPending: departmentPayroll.reduce((sum, d) => sum + d.pending, 0),
  };

  const filteredData = departmentPayroll.filter((dept) => 
    dept.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                item.name === "Payroll"
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
                <DollarSign className="text-purple-600" size={32} />
              </div>
              System-Wide Payroll Overview
            </h2>
            <p className="text-sm text-gray-500 mt-1">Monitor payroll across all departments and employees</p>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-100 text-sm">Total Employees</p>
                <Users size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.totalEmployees}</p>
              <p className="text-sm text-purple-100 mt-1">On payroll</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100 text-sm">Total Payroll</p>
                <TrendingUp size={24} />
              </div>
              <p className="text-4xl font-bold">Rs. {(stats.totalPayroll / 1000000).toFixed(2)}M</p>
              <p className="text-sm text-green-100 mt-1">January 2026</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100 text-sm">Processed</p>
                <BarChart3 size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.totalProcessed}</p>
              <p className="text-sm text-blue-100 mt-1">Payslips sent</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-orange-100 text-sm">Pending</p>
                <Activity size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.totalPending}</p>
              <p className="text-sm text-orange-100 mt-1">To process</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg">
                <Download size={20} />
                Export Payroll Report
              </button>
            </div>
          </div>

          {/* Department Payroll Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Total Employees</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Total Salary</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Avg Salary</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Processed</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Pending</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((dept, index) => (
                    <tr
                      key={dept.id}
                      className={`hover:bg-purple-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-bold text-gray-800">{dept.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{dept.employees}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        Rs. {dept.totalSalary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        Rs. {dept.avgSalary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                          {dept.processed}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full font-semibold ${
                          dept.pending > 0 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {dept.pending}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(dept.processed / dept.employees) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-800">
                            {((dept.processed / dept.employees) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setViewingPayslip(dept)}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-800 font-semibold"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payroll Summary Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Department Wise Distribution</h3>
              <div className="space-y-3">
                {departmentPayroll.map((dept) => {
                  const percentage = ((dept.totalSalary / stats.totalPayroll) * 100).toFixed(1);
                  return (
                    <div key={dept.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-700">{dept.department}</span>
                        <span className="text-sm font-bold text-gray-800">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Trend</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">January 2026</p>
                    <p className="text-2xl font-bold text-green-600">Rs. {(stats.totalPayroll / 1000000).toFixed(2)}M</p>
                  </div>
                  <TrendingUp size={32} className="text-green-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">December 2025</p>
                    <p className="text-2xl font-bold text-blue-600">Rs. 4.15M</p>
                  </div>
                  <TrendingUp size={32} className="text-blue-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">November 2025</p>
                    <p className="text-2xl font-bold text-purple-600">Rs. 4.10M</p>
                  </div>
                  <TrendingUp size={32} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Department Detail Modal */}
      {viewingPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-xl">
              <h3 className="text-2xl font-bold">{viewingPayslip.department} - Payroll Details</h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                  <p className="text-3xl font-bold text-purple-600">{viewingPayslip.employees}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Salary</p>
                  <p className="text-3xl font-bold text-green-600">
                    Rs. {viewingPayslip.totalSalary.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Average Salary</p>
                  <p className="text-3xl font-bold text-blue-600">
                    Rs. {viewingPayslip.avgSalary.toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-orange-600">{viewingPayslip.pending}</p>
                </div>
              </div>

              <button
                onClick={() => setViewingPayslip(null)}
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

export default AdminPayslip;
