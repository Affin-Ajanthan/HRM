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
  Filter,
  Download,
  Eye,
  Send,
  Calendar,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const HRPayslip = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("2026-01");
  const [viewingPayslip, setViewingPayslip] = useState(null);

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

  // Sample payroll data
  const [payrollData] = useState([
    {
      id: 1,
      empId: "EMP001",
      name: "John Doe",
      department: "IT",
      designation: "Senior Developer",
      month: "January 2026",
      basicSalary: 50000,
      allowances: 10000,
      deductions: 5000,
      netSalary: 55000,
      status: "Processed",
    },
    {
      id: 2,
      empId: "EMP002",
      name: "Jane Smith",
      department: "HR",
      designation: "HR Executive",
      month: "January 2026",
      basicSalary: 45000,
      allowances: 8000,
      deductions: 4000,
      netSalary: 49000,
      status: "Processed",
    },
    {
      id: 3,
      empId: "EMP003",
      name: "Mike Johnson",
      department: "Finance",
      designation: "Accountant",
      month: "January 2026",
      basicSalary: 48000,
      allowances: 9000,
      deductions: 4500,
      netSalary: 52500,
      status: "Pending",
    },
    {
      id: 4,
      empId: "EMP004",
      name: "Sarah Williams",
      department: "IT",
      designation: "Developer",
      month: "January 2026",
      basicSalary: 42000,
      allowances: 7000,
      deductions: 3800,
      netSalary: 45200,
      status: "Processed",
    },
    {
      id: 5,
      empId: "EMP005",
      name: "David Brown",
      department: "Marketing",
      designation: "Marketing Manager",
      month: "January 2026",
      basicSalary: 55000,
      allowances: 12000,
      deductions: 6000,
      netSalary: 61000,
      status: "Pending",
    },
  ]);

  const stats = {
    totalEmployees: payrollData.length,
    totalPayroll: payrollData.reduce((sum, p) => sum + p.netSalary, 0),
    processed: payrollData.filter((p) => p.status === "Processed").length,
    pending: payrollData.filter((p) => p.status === "Pending").length,
  };

  const filteredData = payrollData.filter((payroll) => {
    const matchesSearch =
      payroll.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSendPayslip = (id) => {
    alert(`Payslip sent to employee ${id}`);
  };

  const handleGenerateAll = () => {
    alert("Generating payslips for all employees...");
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
                item.name === "Payroll"
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
                  <DollarSign className="text-blue-600" size={32} />
                </div>
                Payroll Management
              </h2>
              <p className="text-sm text-gray-500 mt-1">Manage employee salaries and payslips</p>
            </div>
            <button
              onClick={handleGenerateAll}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
            >
              <Send size={20} />
              Generate All Payslips
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100 text-sm">Total Employees</p>
                <Users size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.totalEmployees}</p>
              <p className="text-sm text-blue-100 mt-1">On payroll</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100 text-sm">Total Payroll</p>
                <TrendingUp size={24} />
              </div>
              <p className="text-4xl font-bold">Rs. {stats.totalPayroll.toLocaleString()}</p>
              <p className="text-sm text-green-100 mt-1">January 2026</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-100 text-sm">Processed</p>
                <CreditCard size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.processed}</p>
              <p className="text-sm text-purple-100 mt-1">Payslips sent</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-orange-100 text-sm">Pending</p>
                <Calendar size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.pending}</p>
              <p className="text-sm text-orange-100 mt-1">To be processed</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleGenerateAll}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                <Download size={20} />
                Export Report
              </button>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Emp ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Employee</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Designation</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Basic Salary</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Allowances</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Deductions</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Net Salary</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((payroll, index) => (
                    <tr
                      key={payroll.id}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{payroll.empId}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{payroll.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payroll.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payroll.designation}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        Rs. {payroll.basicSalary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                        +Rs. {payroll.allowances.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                        -Rs. {payroll.deductions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">
                        Rs. {payroll.netSalary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            payroll.status === "Processed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {payroll.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingPayslip(payroll)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleSendPayslip(payroll.id)}
                            className="text-green-600 hover:text-green-800 font-semibold"
                          >
                            <Send size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No payroll records found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Payslip Detail Modal */}
      {viewingPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Payslip - {viewingPayslip.month}</h3>
                  <p className="text-blue-100 text-sm mt-1">{viewingPayslip.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100">Employee ID</p>
                  <p className="text-lg font-bold">{viewingPayslip.empId}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-semibold">{viewingPayslip.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Designation</p>
                  <p className="font-semibold">{viewingPayslip.designation}</p>
                </div>
              </div>

              {/* Earnings */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 text-gray-800">Earnings</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Basic Salary</span>
                    <span className="font-semibold">Rs. {viewingPayslip.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">House Rent Allowance</span>
                    <span className="font-semibold">Rs. 5,000</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Transport Allowance</span>
                    <span className="font-semibold">Rs. 3,000</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Other Allowances</span>
                    <span className="font-semibold">Rs. {(viewingPayslip.allowances - 8000).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-green-50 px-3 rounded-lg">
                    <span className="font-bold text-gray-800">Total Earnings</span>
                    <span className="font-bold text-green-600">
                      Rs. {(viewingPayslip.basicSalary + viewingPayslip.allowances).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 text-gray-800">Deductions</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Provident Fund</span>
                    <span className="font-semibold">Rs. 2,000</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Professional Tax</span>
                    <span className="font-semibold">Rs. 1,000</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Income Tax</span>
                    <span className="font-semibold">Rs. {(viewingPayslip.deductions - 3000).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-red-50 px-3 rounded-lg">
                    <span className="font-bold text-gray-800">Total Deductions</span>
                    <span className="font-bold text-red-600">
                      Rs. {viewingPayslip.deductions.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl text-white mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Net Salary</p>
                    <p className="text-4xl font-bold">Rs. {viewingPayslip.netSalary.toLocaleString()}</p>
                  </div>
                  <DollarSign size={48} className="opacity-50" />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleSendPayslip(viewingPayslip.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Send size={20} />
                  Send to Employee
                </button>
                <button
                  onClick={() => setViewingPayslip(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRPayslip;
