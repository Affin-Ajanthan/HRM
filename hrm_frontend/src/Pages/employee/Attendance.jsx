import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Calendar, CheckCircle, XCircle, Download, Filter, MapPin, Timer } from "lucide-react";
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
    PRESENT: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    ABSENT: "bg-red-50 text-red-700 ring-1 ring-red-200",
    HALF_DAY: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    LATE: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  }[s] || "bg-slate-50 text-slate-600 ring-1 ring-slate-200");

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
        <button className="flex items-center gap-2 bg-employee-600 hover:bg-employee-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
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
        <div className="bg-gradient-to-br from-white to-employee-50 rounded-xl border border-employee-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-3 mb-5">
            <span className="bg-indigo-50 p-2 rounded-lg"><Timer className="text-indigo-600" size={20} /></span>
            Today's Attendance
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-employee-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                {[
                  { label: "Last Clock In",  value: formatTime(attendance?.clockInTime),  text: "text-slate-900" },
                  { label: "Last Clock Out", value: formatTime(attendance?.clockOutTime), text: "text-slate-900" },
                  { label: "Working Hours",  value: formatMinutes(attendance?.totalWorkingMinutes || 0, isClockedIn), text: "text-slate-900" },
                  { label: "Status",         value: !attendance ? "Not Started" : attendance.isClockedIn ? "Clocked In" : "Clocked Out", text: "text-indigo-700" },
                ].map(t => (
                  <div key={t.label} className="bg-white/70 border border-employee-100 rounded-lg p-4 text-center">
                    <p className="text-slate-500 text-xs mb-2">{t.label}</p>
                    <p className={`text-2xl font-bold ${t.text}`}>{t.value}</p>
                  </div>
                ))}
              </div>
              {attendance?.sessions?.length > 1 && (
                <p className="text-xs text-slate-400 mb-3">{attendance.sessions.length} sessions today</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleClockIn}
                  disabled={clockInLoading || attendance?.isClockedIn}
                  className="flex-1 bg-employee-600 hover:bg-employee-700 text-white disabled:opacity-40 disabled:cursor-not-allowed py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm transition-colors"
                >
                  <CheckCircle size={18} /> {clockInLoading ? "Getting location..." : "Clock In"}
                </button>
                <button
                  onClick={handleClockOut}
                  disabled={clockOutLoading || !attendance?.isClockedIn}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm transition-colors"
                >
                  <XCircle size={18} /> {clockOutLoading ? "Getting location..." : "Clock Out"}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
                <MapPin size={12} /> Your GPS location is captured at clock-in and clock-out. You can clock in and out as many times as needed during the day.
              </p>
              {(attendance?.clockInLocation || attendance?.clockOutLocation) && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {attendance?.clockInLocation && (
                    <a href={mapLink(attendance.clockInLocation)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">
                      <MapPin size={13} /> Clock-in location
                    </a>
                  )}
                  {attendance?.clockOutLocation && (
                    <a href={mapLink(attendance.clockOutLocation)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
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
            { label: "Total Days",     value: stats.totalDays,        edge: "border-t-indigo-500" },
            { label: "Present",        value: stats.present,          edge: "border-t-emerald-600" },
            { label: "Absent",         value: stats.absent,           edge: "border-t-red-500" },
            { label: "On Leave",       value: stats.leave,            edge: "border-t-violet-500" },
            { label: "Late",           value: stats.late,             edge: "border-t-amber-500" },
            { label: "Hours",          value: stats.workingHours+"h", edge: "border-t-slate-700" },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br from-white to-employee-50 border border-employee-100 border-t-4 ${s.edge} p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300`}>
              <p className="text-slate-500 text-xs font-medium mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* History table */}
        <div className="bg-gradient-to-br from-white to-employee-50 rounded-xl border border-employee-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-employee-100">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
              <span className="bg-indigo-50 p-2 rounded-lg"><Calendar size={20} className="text-indigo-600" /></span> Attendance History
            </h2>
            <div className="flex gap-3">
              <button className="flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 rounded-lg text-sm hover:bg-slate-50 transition text-slate-700">
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {attendanceHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No attendance records found for this period
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-employee-50/80 border-b border-employee-100 text-slate-500 text-xs uppercase tracking-wide">
                    {["Date", "Day", "Check In", "Check Out", "Working Hours", "Location", "Status"].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-employee-100/70">
                  {attendanceHistory.map((r, i) => (
                    <tr key={i} className="hover:bg-white/70 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {r.date}
                        {r.sessionCount > 1 && (
                          <span className="ml-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full align-middle">×{r.sessionCount}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{getDayName(r.date)}</td>
                      <td className="px-5 py-3.5 text-slate-600">{formatTime(r.clockInTime)}</td>
                      <td className="px-5 py-3.5 text-slate-600">{formatTime(r.clockOutTime)}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{formatMinutes(r.totalWorkingMinutes)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          {r.clockInLocation && (
                            <a href={mapLink(r.clockInLocation)} target="_blank" rel="noopener noreferrer" title="Clock-in location"
                              className="text-emerald-600 hover:text-emerald-800">
                              <MapPin size={15} />
                            </a>
                          )}
                          {r.clockOutLocation && (
                            <a href={mapLink(r.clockOutLocation)} target="_blank" rel="noopener noreferrer" title="Clock-out location"
                              className="text-slate-500 hover:text-slate-700">
                              <MapPin size={15} />
                            </a>
                          )}
                          {!r.clockInLocation && !r.clockOutLocation && <span className="text-slate-300 text-xs">—</span>}
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
