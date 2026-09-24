import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Calendar, CheckCircle, XCircle, Download, Filter, MapPin } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";
import { employeeApi } from "../../services/api";
import {
  getCurrentPosition, formatMinutes, summarizeSessions, groupSessionsByDate, toLocalDateString, useNow,
} from "../../utils/attendance";

const mapLink = (location) => {
  if (!location) return null;
  return `https://www.google.com/maps?q=${location}`;
};

const calculateStats = (days) => {
  let present = 0, absent = 0, leave = 0, late = 0;
  let totalMinutes = 0;

  days.forEach(d => {
    if (d.status === "PRESENT") present++;
    else if (d.status === "ABSENT") absent++;
    else if (d.status === "HALF_DAY") leave++;
    else if (d.status === "LATE") late++;

    totalMinutes += d.totalWorkingMinutes || 0;
  });

  return {
    totalDays: days.length,
    present,
    absent,
    leave,
    late,
    workingHours: (totalMinutes / 60).toFixed(1)
  };
};

const Attendance = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  // Raw session rows from the API; the summaries below are derived from them on every render
  // so an open session's working time keeps counting up while the page is open.
  const [todaySessions, setTodaySessions] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("current");
  const [loading, setLoading] = useState(true);
  const [clockInLoading, setClockInLoading] = useState(false);
  const [clockOutLoading, setClockOutLoading] = useState(false);
  const [message, setMessage] = useState("");
  const isClockedIn = todaySessions.some((sess) => !sess.clockOutTime);
  const now = useNow(isClockedIn);
  const attendance = useMemo(() => summarizeSessions(todaySessions, now), [todaySessions, now]);
  const attendanceHistory = useMemo(() => groupSessionsByDate(historySessions, now), [historySessions, now]);
  const stats = useMemo(() => calculateStats(attendanceHistory), [attendanceHistory]);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) {
      setUser(JSON.parse(s));
      fetchAttendanceData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      // Fetch today's sessions (an employee may clock in/out multiple times a day)
      const todayResponse = await employeeApi.getTodayAttendance();
      setTodaySessions(Array.isArray(todayResponse.data) ? todayResponse.data : []);

      // Fetch attendance history for the month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const historyResponse = await employeeApi.getAttendanceHistory(
        toLocalDateString(startDate),
        toLocalDateString(endDate)
      );
      setHistorySessions(Array.isArray(historyResponse.data) ? historyResponse.data : []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setMessage("Error loading attendance data");
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      setClockInLoading(true);
      setMessage("");
      const coords = await getCurrentPosition();
      const response = await employeeApi.clockInGPS(coords.latitude, coords.longitude);
      if (response.data) {
        setMessage("✓ Clocked in successfully!");
        setTimeout(() => setMessage(""), 3000);
        fetchAttendanceData();
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
      setMessage("");
      const coords = await getCurrentPosition();
      const response = await employeeApi.clockOutGPS(coords.latitude, coords.longitude);
      if (response.data) {
        setMessage("✓ Clocked out successfully!");
        setTimeout(() => setMessage(""), 3000);
        fetchAttendanceData();
      }
    } catch (error) {
      console.error("Clock out error:", error);
      setMessage("✗ " + (error.message || "Failed to clock out"));
      setTimeout(() => setMessage(""), 5000);
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

  const statusBadge = (s) => ({
    PRESENT: "bg-emerald-100 text-emerald-700",
    ABSENT: "bg-red-100 text-red-700",
    HALF_DAY: "bg-sky-100 text-sky-700",
    LATE: "bg-amber-100 text-amber-700",
  }[s] || "bg-gray-100 text-gray-600");

  const statusLabel = (s) => ({
    PRESENT: "Present",
    ABSENT: "Absent",
    HALF_DAY: "Leave",
    LATE: "Late",
  }[s] || s);

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  if (!user) return null;

  return (
    <PageLayout
      role="employee"
      activePage="Attendance"
      title="Attendance"
      subtitle="Track your attendance and working hours"
      actions={
        <button className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Download size={16} /> Export
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-lg text-white ${message.startsWith("✓") ? "bg-green-500" : "bg-red-500"}`}>
            {message}
          </div>
        )}

        {/* Clock In/Out card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-5">
            <span className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">⏱</span>
            Today's Attendance
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                {[
                  { label: "Last Clock In",  value: formatTime(attendance?.clockInTime), bg: "bg-sky-50",    text: "text-sky-600" },
                  { label: "Last Clock Out", value: formatTime(attendance?.clockOutTime), bg: "bg-orange-50", text: "text-orange-600" },
                  { label: "Working Hours",  value: formatMinutes(attendance?.totalWorkingMinutes || 0, isClockedIn), bg: "bg-emerald-50",text: "text-emerald-600" },
                  { label: "Status",         value: !attendance ? "Not Started" : attendance.isClockedIn ? "Clocked In" : "Clocked Out", bg: "bg-violet-50", text: "text-violet-600" },
                ].map(t => (
                  <div key={t.label} className={`${t.bg} rounded-xl p-4 text-center`}>
                    <p className="text-gray-500 text-xs mb-2">{t.label}</p>
                    <p className={`text-2xl font-bold ${t.text}`}>{t.value}</p>
                  </div>
                ))}
              </div>
              {attendance?.sessions?.length > 1 && (
                <p className="text-xs text-gray-400 mb-3">{attendance.sessions.length} sessions today</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleClockIn}
                  disabled={clockInLoading || attendance?.isClockedIn}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors"
                >
                  <CheckCircle size={18} /> {clockInLoading ? "Getting location..." : "Clock In"}
                </button>
                <button
                  onClick={handleClockOut}
                  disabled={clockOutLoading || !attendance?.isClockedIn}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors"
                >
                  <XCircle size={18} /> {clockOutLoading ? "Getting location..." : "Clock Out"}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                <MapPin size={12} /> Your GPS location is captured at clock-in and clock-out. You can clock in and out as many times as needed during the day.
              </p>
              {(attendance?.clockInLocation || attendance?.clockOutLocation) && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {attendance?.clockInLocation && (
                    <a href={mapLink(attendance.clockInLocation)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-sky-600 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors">
                      <MapPin size={13} /> Clock-in location
                    </a>
                  )}
                  {attendance?.clockOutLocation && (
                    <a href={mapLink(attendance.clockOutLocation)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
                      <MapPin size={13} /> Clock-out location
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Monthly stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: "Total Days",     value: stats.totalDays,     gradient: "from-sky-400 to-blue-500" },
            { label: "Present",        value: stats.present,       gradient: "from-emerald-400 to-green-500" },
            { label: "Absent",         value: stats.absent,        gradient: "from-red-400 to-rose-500" },
            { label: "On Leave",       value: stats.leave,         gradient: "from-violet-400 to-purple-500" },
            { label: "Late",           value: stats.late,          gradient: "from-amber-400 to-orange-500" },
            { label: "Hours",          value: stats.workingHours+"h", gradient: "from-indigo-400 to-indigo-600" },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.gradient} p-5 rounded-xl text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}>
              <p className="text-white/80 text-xs mb-1">{s.label}</p>
              <p className="text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* History table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={18} className="text-violet-500" /> Attendance History
            </h2>
            <div className="flex gap-3">
              <button className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition text-gray-600">
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {attendanceHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No attendance records found for this period
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs">
                    {["Date", "Day", "Check In", "Check Out", "Working Hours", "Location", "Status"].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attendanceHistory.map((r, i) => (
                    <tr key={i} className="hover:bg-sky-50/40 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-800">
                        {r.date}
                        {r.sessionCount > 1 && (
                          <span className="ml-1.5 text-xs font-semibold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-full align-middle">×{r.sessionCount}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{getDayName(r.date)}</td>
                      <td className="px-5 py-3.5 text-gray-600">{formatTime(r.clockInTime)}</td>
                      <td className="px-5 py-3.5 text-gray-600">{formatTime(r.clockOutTime)}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{formatMinutes(r.totalWorkingMinutes)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          {r.clockInLocation && (
                            <a href={mapLink(r.clockInLocation)} target="_blank" rel="noopener noreferrer" title="Clock-in location"
                              className="text-sky-500 hover:text-sky-700">
                              <MapPin size={15} />
                            </a>
                          )}
                          {r.clockOutLocation && (
                            <a href={mapLink(r.clockOutLocation)} target="_blank" rel="noopener noreferrer" title="Clock-out location"
                              className="text-orange-500 hover:text-orange-700">
                              <MapPin size={15} />
                            </a>
                          )}
                          {!r.clockInLocation && !r.clockOutLocation && <span className="text-gray-300 text-xs">—</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(r.status)}`}>
                          {statusLabel(r.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Attendance;
