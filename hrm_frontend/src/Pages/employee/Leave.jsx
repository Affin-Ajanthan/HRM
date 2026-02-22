import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  AlertCircle,
  LayoutDashboard,
  DollarSign,
  User,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import logo from "../../assets/logo.jpg";
import { getRoleLabel } from "../../utils/roleLabel";

const Leave = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

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

  // Sample leave data
  const leaveBalance = {
    annual: { total: 15, used: 3, remaining: 12 },
    sick: { total: 10, used: 1, remaining: 9 },
    casual: { total: 7, used: 2, remaining: 5 },
    unpaid: { total: 0, used: 0, remaining: 0 },
  };

  const leaveHistory = [
    {
      id: 1,
      type: "Annual Leave",
      startDate: "2026-01-15",
      endDate: "2026-01-15",
      days: 1,
      status: "Approved",
      appliedOn: "2026-01-10",
      reason: "Personal work",
    },
    {
      id: 2,
      type: "Sick Leave",
      startDate: "2026-01-08",
      endDate: "2026-01-08",
      days: 1,
      status: "Approved",
      appliedOn: "2026-01-08",
      reason: "Medical checkup",
    },
    {
      id: 3,
      type: "Casual Leave",
      startDate: "2025-12-28",
      endDate: "2025-12-29",
      days: 2,
      status: "Approved",
      appliedOn: "2025-12-20",
      reason: "Family function",
    },
    {
      id: 4,
      type: "Annual Leave",
      startDate: "2026-02-10",
      endDate: "2026-02-12",
      days: 3,
      status: "Pending",
      appliedOn: "2026-01-20",
      reason: "Vacation trip",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add API call here
    setShowApplyForm(false);
    setFormData({ leaveType: "", startDate: "", endDate: "", reason: "" });
  };

  const getStatusBadge = (status) => {
    const badges = {
      Approved: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Cancelled: "bg-gray-100 text-gray-700",
    };
    return badges[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    const icons = {
      Approved: <CheckCircle size={18} className="text-green-600" />,
      Rejected: <XCircle size={18} className="text-red-600" />,
      Pending: <Clock size={18} className="text-yellow-600" />,
      Cancelled: <AlertCircle size={18} className="text-gray-600" />,
    };
    return icons[status];
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
                item.name === "Leave"
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
            <h2 className="text-2xl font-bold text-gray-800">Leave Management</h2>
            <p className="text-sm text-gray-500">Apply for leave and track your leave balance</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowApplyForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg font-semibold"
            >
              <Plus size={20} />
              Apply for Leave
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
                <p className="text-xs text-gray-500">{getRoleLabel(user.role) ?? "Employee"}</p>
              </div>
              <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.fullName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <p className="text-blue-100 text-sm mb-2">Annual Leave</p>
            <p className="text-4xl font-bold mb-2">{leaveBalance.annual.remaining}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-100">Remaining</span>
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                {leaveBalance.annual.used}/{leaveBalance.annual.total} used
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <p className="text-green-100 text-sm mb-2">Sick Leave</p>
            <p className="text-4xl font-bold mb-2">{leaveBalance.sick.remaining}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-100">Remaining</span>
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                {leaveBalance.sick.used}/{leaveBalance.sick.total} used
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <p className="text-purple-100 text-sm mb-2">Casual Leave</p>
            <p className="text-4xl font-bold mb-2">{leaveBalance.casual.remaining}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-100">Remaining</span>
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                {leaveBalance.casual.used}/{leaveBalance.casual.total} used
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <p className="text-orange-100 text-sm mb-2">Total Balance</p>
            <p className="text-4xl font-bold mb-2">
              {leaveBalance.annual.remaining + leaveBalance.sick.remaining + leaveBalance.casual.remaining}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-100">Days Left</span>
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded">Combined</span>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Leave Form Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Apply for Leave</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Leave Type *
                  </label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select leave type</option>
                    <option value="annual">Annual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason *
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please provide a reason for your leave..."
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold"
                >
                  Submit Application
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave History */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
          <div className="bg-green-100 p-2 rounded-lg mr-3">
            <FileText className="text-green-600" size={24} />
          </div>
          Leave History
        </h2>

        <div className="space-y-4">
          {leaveHistory.map((leave) => (
            <div
              key={leave.id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:border-blue-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{leave.type}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusBadge(leave.status)}`}>
                      {getStatusIcon(leave.status)}
                      {leave.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>
                        {leave.startDate} to {leave.endDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-gray-400" />
                      <span>{leave.days} day{leave.days > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span>Applied on {leave.appliedOn}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">Reason:</span> {leave.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
        </div>
      </main>
    </div>
  );
};

export default Leave;
