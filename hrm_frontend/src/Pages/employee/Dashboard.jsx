import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClockIcon, CalendarDays, DollarSign, User, Bell,
  Award, Target, TrendingUp, CheckCircle2, Calendar, Gift,
} from "lucide-react";
import { PageLayout } from "../../components/PageLayout";
import { employeeApi } from "../../services/api";
import { getCurrentPosition, formatMinutes, summarizeSessions, useNow } from "../../utils/attendance";

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
  const [todaySessions, setTodaySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clockInLoading, setClockInLoading] = useState(false);
  const [clockOutLoading, setClockOutLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isClockedIn = todaySessions.some((s) => !s.clockOutTime);
  const now = useNow(isClockedIn);
  const attendance = useMemo(() => summarizeSessions(todaySessions, now), [todaySessions, now]);

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
      setTodaySessions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setTodaySessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      setClockInLoading(true);
      const coords = await getCurrentPosition();
      const response = await employeeApi.clockInGPS(coords.latitude, coords.longitude);
      if (response.data) {
        setMessage("✓ Clocked in successfully!");
        setTimeout(() => setMessage(""), 3000);
        fetchTodayAttendance();
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
      const coords = await getCurrentPosition();
      const response = await employeeApi.clockOutGPS(coords.latitude, coords.longitude);
      if (response.data) {
        setMessage("✓ Clocked out successfully!");
        setTimeout(() => setMessage(""), 3000);
        fetchTodayAttendance();
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

  if (!user) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-employee-500" />
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
            { edge: "border-t-indigo-500",   chip: "bg-indigo-50 text-indigo-600",     icon: <ClockIcon size={22} />,    label: "Present Days",   value: stats.presentDays,         sub: "This month"        },
            { edge: "border-t-violet-500",   chip: "bg-violet-50 text-violet-600",     icon: <Calendar size={22} />,     label: "Leave Balance",  value: stats.leaveBalance,        sub: "Days available"    },
            { edge: "border-t-amber-500",    chip: "bg-amber-50 text-amber-700",       icon: <CalendarDays size={22} />, label: "Pending Leaves", value: stats.pendingLeaves,       sub: "Awaiting approval" },
            { edge: "border-t-emerald-600",  chip: "bg-emerald-50 text-emerald-700",   icon: <DollarSign size={22} />,   label: "Last Salary",    value: `Rs. ${stats.lastSalary}`, sub: "January 2026"      },
          ].map(c => (
            <div key={c.label}
              className={`bg-gradient-to-br from-white to-employee-50 p-6 rounded-xl border border-employee-100 border-t-4 ${c.edge} shadow-sm hover:shadow-md transition-shadow duration-300`}>
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-slate-500">{c.label}</p>
                <div className={`${c.chip} p-2.5 rounded-lg`}>{c.icon}</div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">{c.value}</h3>
              <p className="text-xs text-slate-400 mt-2">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Today's Attendance + Quick Actions ──
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
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
                    <p className="text-3xl font-bold text-green-600">{formatMinutes(attendance?.totalWorkingMinutes || 0, isClockedIn)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleClockIn}
                    disabled={clockInLoading || isClockedIn}
                    className="flex-1 bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 font-semibold">
                    <ClockIcon size={20} /> {clockInLoading ? "Getting location..." : "Clock In"}
                  </button>
                  <button 
                    onClick={handleClockOut}
                    disabled={clockOutLoading || !isClockedIn}
                    className="flex-1 bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:bg-gray-300 hover:text-gray-500 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold transition">
                    <ClockIcon size={20} /> {clockOutLoading ? "Getting location..." : "Clock Out"}
                  </button>
                </div>
              </>
            )}
          </div>

          
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
        </div> */}

        {/* ── Performance + Upcoming Events ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance */}
          <div className="bg-gradient-to-br from-white to-employee-50 p-6 rounded-xl border border-employee-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center text-slate-800">
              <div className="bg-orange-50 p-2 rounded-lg mr-3">
                <Target className="text-orange-600" size={20} />
              </div>
              My Performance
            </h3>
            <div className="space-y-4">
              {[
                { label: "Attendance Rate",    pct: 95 },
                { label: "Task Completion",    pct: 88 },
                { label: "Team Collaboration", pct: 92 },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">{m.label}</span>
                    <span className="text-sm font-semibold text-slate-800">{m.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-employee-500 h-2 rounded-full" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-4 p-4 bg-employee-50 border border-employee-100 rounded-lg flex items-center gap-3">
                <Award className="text-amber-500" size={22} />
                <div>
                  <p className="font-semibold text-slate-800">Great Job!</p>
                  <p className="text-sm text-slate-600">You're performing above average</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gradient-to-br from-white to-employee-50 p-6 rounded-xl border border-employee-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center text-slate-800">
              <div className="bg-amber-50 p-2 rounded-lg mr-3">
                <Calendar className="text-amber-600" size={20} />
              </div>
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {[
                { icon: <Calendar size={18} />, tone: "bg-indigo-50 text-indigo-600", title: "Team Meeting",        sub: "Tomorrow at 10:00 AM"    },
                { icon: <Award size={18} />,    tone: "bg-orange-50 text-orange-600", title: "Performance Review",  sub: "Jan 25, 2026 at 2:00 PM" },
                { icon: <Gift size={18} />,     tone: "bg-rose-50 text-rose-500",     title: "Company Anniversary", sub: "Jan 28, 2026"            },
              ].map(e => (
                <div key={e.title} className="flex items-start gap-3 p-3 border border-employee-100 bg-white/70 hover:bg-white rounded-lg transition">
                  <div className={`${e.tone} p-2 rounded-lg`}>{e.icon}</div>
                  <div>
                    <p className="font-medium text-slate-800">{e.title}</p>
                    <p className="text-sm text-slate-500">{e.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Notifications ── */}
        <div className="bg-gradient-to-br from-white to-employee-50 p-6 rounded-xl border border-employee-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center text-slate-800">
            <div className="bg-rose-50 p-2 rounded-lg mr-3">
              <Bell className="text-rose-500" size={20} />
            </div>
            Recent Notifications
          </h3>
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div key={n.id || i} className="flex items-start gap-3 p-3 hover:bg-white/70 rounded-lg transition">
                <CheckCircle2 className={`${n.isRead ? "text-gray-300" : "text-rose-500"} mt-1`} size={20} />
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{n.title}</p>
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