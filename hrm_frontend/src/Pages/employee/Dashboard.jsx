import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClockIcon, CalendarDays, DollarSign, User, Bell,
  Award, Target, TrendingUp, CheckCircle2, Calendar, Gift,
} from "lucide-react";
import { PageLayout } from "../../components/PageLayout";
import { employeeApi } from "../../services/api";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    presentDays: 0,
    leaveBalance: 0,
    pendingLeaves: 0,
    lastSalary: "0.00",
  });
  const [notifications, setNotifications] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockInLoading, setClockInLoading] = useState(false);
  const [clockOutLoading, setClockOutLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchTodayAttendance();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const loadDashboardData = async () => {
        try {
          // Fetch Notifications
          const notRes = await employeeApi.getNotifications();
          setNotifications(notRes.data || []);

          // Fetch Leaves to count pending
          const leavesRes = await employeeApi.getLeaves();
          const pendingCount = (leavesRes.data || []).filter(l => l.status === "PENDING" || l.status === "Pending").length;

          // Fetch Leave Balance
          const balRes = await employeeApi.getLeaveBalance();
          const totalBalance = (balRes.data || []).reduce((sum, b) => sum + (b.daysAvailable || 0), 0);

          // Fetch Payslips for last salary
          const payRes = await employeeApi.getPayslips();
          const lastSal = payRes.data && payRes.data.length > 0 ? payRes.data[0].netSalary : 58000; // fallback if no payslip generated yet

          // Fetch Attendance History to count present days
          const attRes = await employeeApi.getAttendanceHistory();
          const presentCount = (attRes.data || []).filter(a => a.status === "PRESENT" || a.status === "Present").length;

          setStats({
            presentDays: presentCount > 0 ? presentCount : 18, // fallback/actual
            leaveBalance: totalBalance > 0 ? totalBalance : 14,
            pendingLeaves: pendingCount,
            lastSalary: lastSal.toLocaleString(),
          });
        } catch (e) {
          console.error("Error loading employee dashboard stats:", e);
        }
      };
      loadDashboardData();
    }
  }, [user]);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getTodayAttendance();
      if (response.data) {
        setAttendance(response.data);
      } else {
        setAttendance(null);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendance(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      setClockInLoading(true);
      console.log("Attempting to clock in...");
      const response = await employeeApi.clockIn();
      console.log("Clock in response:", response);
      if (response.data) {
        setAttendance(response.data);
        setMessage("✓ Clocked in successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Clock in error:", error);
      setMessage("✗ " + (error.message || "Failed to clock in"));
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setClockInLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setClockOutLoading(true);
      const response = await employeeApi.clockOut();
      if (response.data) {
        setAttendance(response.data);
        setMessage("✓ Clocked out successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("✗ " + (error.message || "Failed to clock out"));
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setClockOutLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "--:--";
    const [hours, minutes] = time.split(":").slice(0, 2);
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateWorkingHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return "0h 0m";
    const [inH, inM] = clockIn.split(":").map(Number);
    const [outH, outM] = clockOut.split(":").map(Number);
    const inMinutes = inH * 60 + inM;
    const outMinutes = outH * 60 + outM;
    const diff = outMinutes - inMinutes;
    if (diff < 0) return "0h 0m";
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}m`;
  };

  if (!user) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  );

  return (
    <PageLayout
      role="employee"
      activePage="Overview"
      title={`Welcome, ${user.fullName}!`}
      subtitle="Here's your overview for today"
    >
      <div className="space-y-6">

        {/* ── Message Alert ── */}
        {message && (
          <div className={`p-4 rounded-lg text-white ${message.startsWith("✓") ? "bg-green-500" : "bg-red-500"}`}>
            {message}
          </div>
        )}

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { gradient: "from-blue-500 to-blue-600",     icon: <ClockIcon size={28} />,    tint: "text-blue-100",   label: "Present Days",   value: stats.presentDays,         sub: "This month"        },
            { gradient: "from-green-500 to-emerald-600", icon: <Calendar size={28} />,     tint: "text-green-100",  label: "Leave Balance",  value: stats.leaveBalance,        sub: "Days available"    },
            { gradient: "from-yellow-500 to-orange-500", icon: <CalendarDays size={28} />, tint: "text-yellow-100", label: "Pending Leaves", value: stats.pendingLeaves,       sub: "Awaiting approval" },
            { gradient: "from-purple-500 to-pink-600",   icon: <DollarSign size={28} />,   tint: "text-purple-100", label: "Last Salary",    value: `Rs. ${stats.lastSalary}`, sub: "January 2026"      },
          ].map(c => (
            <div key={c.label}
              className={`bg-gradient-to-br ${c.gradient} p-6 rounded-xl shadow-xl text-white hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12" />
              <div className="mb-3 relative z-10">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg w-fit">{c.icon}</div>
              </div>
              <p className={`${c.tint} text-sm font-medium mb-1 relative z-10`}>{c.label}</p>
              <h3 className="text-4xl font-bold relative z-10">{c.value}</h3>
              <p className={`text-sm ${c.tint} mt-2 relative z-10`}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Today's Attendance + Quick Actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Attendance */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <ClockIcon className="text-blue-600" size={24} />
              </div>
              Today's Attendance
            </h3>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-500 text-sm mb-2">Clock In</p>
                    <p className="text-3xl font-bold text-blue-600">{formatTime(attendance?.clockInTime)}</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-gray-500 text-sm mb-2">Clock Out</p>
                    <p className="text-3xl font-bold text-orange-600">{formatTime(attendance?.clockOutTime)}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-gray-500 text-sm mb-2">Working Hours</p>
                    <p className="text-3xl font-bold text-green-600">{calculateWorkingHours(attendance?.clockInTime, attendance?.clockOutTime)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleClockIn}
                    disabled={clockInLoading || (attendance && attendance.clockInTime)}
                    className="flex-1 bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 font-semibold">
                    <ClockIcon size={20} /> {clockInLoading ? "Clocking in..." : "Clock In"}
                  </button>
                  <button 
                    onClick={handleClockOut}
                    disabled={clockOutLoading || !attendance?.clockInTime || attendance?.clockOutTime}
                    className="flex-1 bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:bg-gray-300 hover:text-gray-500 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold transition">
                    <ClockIcon size={20} /> {clockOutLoading ? "Clocking out..." : "Clock Out"}
                  </button>
                </div>
              </>
            )}
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
              <button onClick={() => navigate("/employee/leave")}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg">
                <CalendarDays size={20} /> Apply for Leave
              </button>
              <button onClick={() => navigate("/employee/payslip")}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg">
                <DollarSign size={20} /> View Payslip
              </button>
              <button onClick={() => navigate("/employee/profile")}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg">
                <User size={20} /> Update Profile
              </button>
            </div>
          </div>
        </div>

        {/* ── Performance + Upcoming Events ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Target className="text-green-600" size={24} />
              </div>
              My Performance
            </h3>
            <div className="space-y-4">
              {[
                { label: "Attendance Rate",    pct: 95, color: "from-green-500 to-emerald-500",  text: "text-green-600"  },
                { label: "Task Completion",    pct: 88, color: "from-blue-500 to-cyan-500",       text: "text-blue-600"   },
                { label: "Team Collaboration", pct: 92, color: "from-purple-500 to-pink-500",     text: "text-purple-600" },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{m.label}</span>
                    <span className={`text-sm font-bold ${m.text}`}>{m.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className={`bg-gradient-to-r ${m.color} h-3 rounded-full`} style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg flex items-center gap-2">
                <Award className="text-yellow-600" size={24} />
                <div>
                  <p className="font-semibold text-yellow-800">Great Job!</p>
                  <p className="text-sm text-yellow-700">You're performing above average</p>
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
              {[
                { bg: "bg-blue-50",   iconBg: "bg-blue-500",   icon: <Calendar size={20} />, title: "Team Meeting",        sub: "Tomorrow at 10:00 AM"    },
                { bg: "bg-purple-50", iconBg: "bg-purple-500", icon: <Award size={20} />,    title: "Performance Review",  sub: "Jan 25, 2026 at 2:00 PM" },
                { bg: "bg-green-50",  iconBg: "bg-green-500",  icon: <Gift size={20} />,     title: "Company Anniversary", sub: "Jan 28, 2026"            },
              ].map(e => (
                <div key={e.title} className={`flex items-start gap-3 p-3 ${e.bg} rounded-lg`}>
                  <div className={`${e.iconBg} text-white p-2 rounded`}>{e.icon}</div>
                  <div>
                    <p className="font-semibold">{e.title}</p>
                    <p className="text-sm text-gray-600">{e.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Notifications ── */}
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <Bell className="text-red-600" size={24} />
            </div>
            Recent Notifications
          </h3>
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div key={n.id || i} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                <CheckCircle2 className={`${n.isRead ? "text-gray-400" : "text-sky-500"} mt-1`} size={20} />
                <div className="flex-1">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-gray-500">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.createdAt ? n.createdAt.replace("T", " ").substring(0, 16) : ""}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-5 text-gray-400 text-sm">
                No recent notifications.
              </div>
            )}
          </div>
        </div>

      </div>
    </PageLayout>
  );
};

export default EmployeeDashboard;