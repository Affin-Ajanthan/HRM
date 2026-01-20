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
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const AdminLeave = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewingRequest, setViewingRequest] = useState(null);

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Companies", icon: Building2, path: "/admin/dashboard" },
    { name: "System Users", icon: Users, path: "/admin/dashboard" },
    { name: "Attendance", icon: CalendarCheck, path: "/admin/attendance" },
    { name: "Leave", icon: FileText, path: "/admin/leave" },
    { name: "Payroll", icon: Activity, path: "/admin/payslip" },
    { name: "System Config", icon: Settings, path: "/admin/dashboard" },
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

  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      empId: "EMP001",
      name: "John Doe",
      department: "IT",
      leaveType: "Sick Leave",
      startDate: "2026-01-25",
      endDate: "2026-01-27",
      days: 3,
      reason: "Medical checkup",
      status: "Pending",
      appliedOn: "2026-01-20",
    },
    {
      id: 2,
      empId: "EMP002",
      name: "Jane Smith",
      department: "HR",
      leaveType: "Casual Leave",
      startDate: "2026-02-01",
      endDate: "2026-02-03",
      days: 3,
      reason: "Personal work",
      status: "Pending",
      appliedOn: "2026-01-19",
    },
    {
      id: 3,
      empId: "EMP003",
      name: "Mike Johnson",
      department: "Finance",
      leaveType: "Annual Leave",
      startDate: "2026-01-22",
      endDate: "2026-01-24",
      days: 3,
      reason: "Family vacation",
      status: "Approved",
      appliedOn: "2026-01-18",
    },
    {
      id: 4,
      empId: "EMP004",
      name: "Sarah Williams",
      department: "IT",
      leaveType: "Sick Leave",
      startDate: "2026-01-20",
      endDate: "2026-01-20",
      days: 1,
      reason: "Fever and cold",
      status: "Approved",
      appliedOn: "2026-01-19",
    },
    {
      id: 5,
      empId: "EMP005",
      name: "David Brown",
      department: "Marketing",
      leaveType: "Emergency Leave",
      startDate: "2026-01-18",
      endDate: "2026-01-19",
      days: 2,
      reason: "Family emergency",
      status: "Rejected",
      appliedOn: "2026-01-17",
    },
  ]);

  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((r) => r.status === "Pending").length,
    approved: leaveRequests.filter((r) => r.status === "Approved").length,
    rejected: leaveRequests.filter((r) => r.status === "Rejected").length,
  };

  const filteredData = leaveRequests.filter((request) => {
    const matchesSearch =
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || request.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id) => {
    setLeaveRequests(leaveRequests.map((req) => 
      req.id === id ? { ...req, status: "Approved" } : req
    ));
    setViewingRequest(null);
  };

  const handleReject = (id) => {
    setLeaveRequests(leaveRequests.map((req) => 
      req.id === id ? { ...req, status: "Rejected" } : req
    ));
    setViewingRequest(null);
  };

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
                item.name === "Leave"
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
                <FileText className="text-purple-600" size={32} />
              </div>
              System-Wide Leave Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">Monitor and approve leave requests across all departments</p>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-100 text-sm">Total Requests</p>
                <FileText size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.total}</p>
              <p className="text-sm text-purple-100 mt-1">All time</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-yellow-100 text-sm">Pending</p>
                <Clock size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.pending}</p>
              <p className="text-sm text-yellow-100 mt-1">Needs action</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100 text-sm">Approved</p>
                <CheckCircle size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.approved}</p>
              <p className="text-sm text-green-100 mt-1">Granted</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-red-100 text-sm">Rejected</p>
                <XCircle size={24} />
              </div>
              <p className="text-4xl font-bold">{stats.rejected}</p>
              <p className="text-sm text-red-100 mt-1">Denied</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Emp ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Employee</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Leave Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Duration</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Days</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Applied On</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((request, index) => (
                    <tr
                      key={request.id}
                      className={`hover:bg-purple-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{request.empId}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{request.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{request.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{request.leaveType}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-xs">
                        {request.startDate} to {request.endDate}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{request.days}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{request.appliedOn}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            request.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : request.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setViewingRequest(request)}
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
        </div>
      </main>

      {/* Leave Detail Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-xl">
              <h3 className="text-2xl font-bold">Leave Request Details</h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Employee ID</p>
                  <p className="font-semibold text-gray-800">{viewingRequest.empId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Employee Name</p>
                  <p className="font-semibold text-gray-800">{viewingRequest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Department</p>
                  <p className="font-semibold text-gray-800">{viewingRequest.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Leave Type</p>
                  <p className="font-semibold text-gray-800">{viewingRequest.leaveType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Start Date</p>
                  <p className="font-semibold text-gray-800">{viewingRequest.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">End Date</p>
                  <p className="font-semibold text-gray-800">{viewingRequest.endDate}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Reason</p>
                <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">{viewingRequest.reason}</p>
              </div>

              {viewingRequest.status === "Pending" && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(viewingRequest.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle size={20} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(viewingRequest.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <XCircle size={20} />
                    Reject
                  </button>
                </div>
              )}

              <button
                onClick={() => setViewingRequest(null)}
                className="w-full mt-4 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
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

export default AdminLeave;
