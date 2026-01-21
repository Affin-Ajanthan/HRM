import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  FileText,
  CreditCard,
  LayoutDashboard,
  Clock,
  CalendarDays,
  User,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const Payslip = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [viewingPayslip, setViewingPayslip] = useState(null);

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

  // Sample payslip data
  const payslips = [
    {
      id: 1,
      month: "January 2026",
      basicSalary: 50000,
      allowances: 10000,
      deductions: 5000,
      netSalary: 55000,
      paidDate: "2026-01-31",
      status: "Paid",
    },
    {
      id: 2,
      month: "December 2025",
      basicSalary: 50000,
      allowances: 12000,
      deductions: 5200,
      netSalary: 56800,
      paidDate: "2025-12-31",
      status: "Paid",
    },
    {
      id: 3,
      month: "November 2025",
      basicSalary: 50000,
      allowances: 9000,
      deductions: 4800,
      netSalary: 54200,
      paidDate: "2025-11-30",
      status: "Paid",
    },
  ];

  const handleDownload = (payslip) => {
    // Add PDF download logic here
    console.log("Downloading payslip:", payslip.month);
  };

  const handleView = (payslip) => {
    setViewingPayslip(payslip);
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
                item.name === "Payslip"
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
            <h2 className="text-2xl font-bold text-gray-800">Payslip Management</h2>
            <p className="text-sm text-gray-500">View and download your salary payslips</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>2026</option>
              <option>2025</option>
              <option>2024</option>
            </select>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100 text-sm">Last Salary</p>
              <DollarSign size={24} />
            </div>
            <p className="text-3xl font-bold">Rs. 55,000</p>
            <p className="text-sm text-blue-100 mt-1">January 2026</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-100 text-sm">Avg. Monthly</p>
              <TrendingUp size={24} />
            </div>
            <p className="text-3xl font-bold">Rs. 55,333</p>
            <p className="text-sm text-green-100 mt-1">Last 3 months</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-100 text-sm">YTD Earnings</p>
              <CreditCard size={24} />
            </div>
            <p className="text-3xl font-bold">Rs. 55,000</p>
            <p className="text-sm text-purple-100 mt-1">Year to date</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-orange-100 text-sm">Total Payslips</p>
              <FileText size={24} />
            </div>
            <p className="text-3xl font-bold">{payslips.length}</p>
            <p className="text-sm text-orange-100 mt-1">Available</p>
          </div>
        </div>
      </div>

      {/* Payslips List */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <FileText className="text-blue-600" size={24} />
          </div>
          Payslip History
        </h2>

        <div className="space-y-4">
          {payslips.map((payslip) => (
            <div
              key={payslip.id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:border-blue-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Calendar className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{payslip.month}</h3>
                      <p className="text-sm text-gray-500">Paid on {payslip.paidDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Basic Salary</p>
                      <p className="text-lg font-bold text-gray-800">Rs. {payslip.basicSalary.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Allowances</p>
                      <p className="text-lg font-bold text-green-600">+Rs. {payslip.allowances.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Deductions</p>
                      <p className="text-lg font-bold text-red-600">-Rs. {payslip.deductions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Net Salary</p>
                      <p className="text-xl font-bold text-blue-600">Rs. {payslip.netSalary.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex flex-col gap-3">
                  <button
                    onClick={() => handleView(payslip)}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    <Eye size={18} />
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(payslip)}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payslip Detail Modal */}
      {viewingPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Payslip Details</h2>
                  <p className="text-blue-100 mt-1">{viewingPayslip.month}</p>
                </div>
                <button
                  onClick={() => setViewingPayslip(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Employee Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Employee Name</p>
                    <p className="font-semibold">John Doe</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Employee ID</p>
                    <p className="font-semibold">EMP-12345</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-semibold">Engineering</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Designation</p>
                    <p className="font-semibold">Senior Developer</p>
                  </div>
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
                    <span className="font-semibold">Rs. 2,000</span>
                  </div>
                  <div className="flex justify-between py-3 bg-green-50 px-3 rounded-lg">
                    <span className="font-bold text-green-700">Total Earnings</span>
                    <span className="font-bold text-green-700">
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
                    <span className="font-semibold">Rs. 2,500</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Professional Tax</span>
                    <span className="font-semibold">Rs. 2,000</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Income Tax</span>
                    <span className="font-semibold">Rs. 500</span>
                  </div>
                  <div className="flex justify-between py-3 bg-red-50 px-3 rounded-lg">
                    <span className="font-bold text-red-700">Total Deductions</span>
                    <span className="font-bold text-red-700">Rs. {viewingPayslip.deductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Net Salary</span>
                  <span className="text-3xl font-bold">Rs. {viewingPayslip.netSalary.toLocaleString()}</span>
                </div>
                <p className="text-blue-100 mt-2 text-sm">
                  Amount paid on {viewingPayslip.paidDate}
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleDownload(viewingPayslip)}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 font-semibold"
                >
                  <Download size={20} />
                  Download PDF
                </button>
                <button
                  onClick={() => setViewingPayslip(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Close
                </button>
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

export default Payslip;
