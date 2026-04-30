import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Calendar, CheckCircle, XCircle, Download, Filter } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";

const Attendance = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("January 2026");
  const [clockedIn, setClockedIn] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
    else navigate("/login");
  }, [navigate]);

  const attendanceStats = { totalDays: 21, present: 18, absent: 2, leave: 1, late: 3, workingHours: "152.5" };
  const attendanceHistory = [
    { date: "2026-01-21", day: "Tuesday",   checkIn: "09:02 AM", checkOut: "06:15 PM", hours: "9h 13m", status: "Present" },
    { date: "2026-01-20", day: "Monday",    checkIn: "08:55 AM", checkOut: "06:05 PM", hours: "9h 10m", status: "Present" },
    { date: "2026-01-17", day: "Friday",    checkIn: "09:15 AM", checkOut: "06:00 PM", hours: "8h 45m", status: "Late" },
    { date: "2026-01-16", day: "Thursday",  checkIn: "08:58 AM", checkOut: "06:10 PM", hours: "9h 12m", status: "Present" },
    { date: "2026-01-15", day: "Wednesday", checkIn: "-",        checkOut: "-",        hours: "-",       status: "Leave" },
    { date: "2026-01-14", day: "Tuesday",   checkIn: "-",        checkOut: "-",        hours: "-",       status: "Absent" },
    { date: "2026-01-13", day: "Monday",    checkIn: "09:00 AM", checkOut: "06:05 PM", hours: "9h 5m",  status: "Present" },
  ];

  const statusBadge = (s) => ({
    Present: "bg-emerald-100 text-emerald-700",
    Absent:  "bg-red-100 text-red-700",
    Leave:   "bg-sky-100 text-sky-700",
    Late:    "bg-amber-100 text-amber-700",
  }[s] || "bg-gray-100 text-gray-600");

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
        {/* Clock In/Out card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-5">
            <span className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">⏱</span>
            Today's Attendance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { label: "Clock In",       value: clockedIn ? "09:02 AM" : "--:--", bg: "bg-sky-50",    text: "text-sky-600" },
              { label: "Clock Out",      value: "--:--",                           bg: "bg-orange-50", text: "text-orange-600" },
              { label: "Working Hours",  value: clockedIn ? "2h 15m" : "0h 0m",   bg: "bg-emerald-50",text: "text-emerald-600" },
              { label: "Status",         value: clockedIn ? "Active" : "Inactive", bg: "bg-violet-50", text: "text-violet-600" },
            ].map(t => (
              <div key={t.label} className={`${t.bg} rounded-xl p-4 text-center`}>
                <p className="text-gray-500 text-xs mb-2">{t.label}</p>
                <p className={`text-2xl font-bold ${t.text}`}>{t.value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setClockedIn(true)}
              disabled={clockedIn}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors"
            >
              <CheckCircle size={18} /> Clock In
            </button>
            <button
              onClick={() => setClockedIn(false)}
              disabled={!clockedIn}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors"
            >
              <XCircle size={18} /> Clock Out
            </button>
          </div>
        </div>

        {/* Monthly stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: "Total Days",     value: attendanceStats.totalDays,     gradient: "from-sky-400 to-blue-500" },
            { label: "Present",        value: attendanceStats.present,       gradient: "from-emerald-400 to-green-500" },
            { label: "Absent",         value: attendanceStats.absent,        gradient: "from-red-400 to-rose-500" },
            { label: "On Leave",       value: attendanceStats.leave,         gradient: "from-violet-400 to-purple-500" },
            { label: "Late",           value: attendanceStats.late,          gradient: "from-amber-400 to-orange-500" },
            { label: "Hours",          value: attendanceStats.workingHours+"h", gradient: "from-indigo-400 to-indigo-600" },
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
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50"
              >
                <option>January 2026</option>
                <option>December 2025</option>
              </select>
              <button className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition text-gray-600">
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs">
                  {["Date", "Day", "Check In", "Check Out", "Working Hours", "Status"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {attendanceHistory.map((r, i) => (
                  <tr key={i} className="hover:bg-sky-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800">{r.date}</td>
                    <td className="px-5 py-3.5 text-gray-500">{r.day}</td>
                    <td className="px-5 py-3.5 text-gray-600">{r.checkIn}</td>
                    <td className="px-5 py-3.5 text-gray-600">{r.checkOut}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{r.hours}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(r.status)}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Attendance;
