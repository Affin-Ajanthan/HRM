import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Filter, Calendar, MapPin } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";
import { hrApi } from "../../services/api";
import { formatMinutes, groupSessionsByEmployee, toLocalDateString, useNow } from "../../utils/attendance";

const mapLink = (location) => (location ? `https://www.google.com/maps?q=${location}` : null);

const calculateStats = (rows) => {
  let present = 0, absent = 0, halfDay = 0, late = 0;
  rows.forEach((r) => {
    if (r.status === "PRESENT") present++;
    else if (r.status === "ABSENT") absent++;
    else if (r.status === "HALF_DAY") halfDay++;
    else if (r.status === "LATE") late++;
  });
  return { total: rows.length, present, absent, halfDay, late, onTime: present - late };
};

const HRAttendance = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(() => toLocalDateString(new Date()));
  const [filterStatus, setFilterStatus] = useState("all");
  const [rawSessions, setRawSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const now = useNow(filterDate === toLocalDateString(new Date()));
  const rows = useMemo(() => groupSessionsByEmployee(rawSessions, now), [rawSessions, now]);
  const stats = useMemo(() => calculateStats(rows), [rows]);

  const filtered = rows.filter((r) =>
    ((r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.empId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.department || "").toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === "all" || r.status === filterStatus)
  );

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) {
      const u = JSON.parse(s);
      if (u.role !== "HR_MANAGER" && u.role !== "ADMIN") { navigate("/unauthorized"); return; }
      setUser(u);
    } else navigate("/login");
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filterDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await hrApi.getDailyAttendance(filterDate);
      setRawSessions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError(err.message || "Failed to load attendance data");
      setRawSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "-";
    const [hours, minutes] = time.split(":").slice(0, 2);
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const statusBadge = (s) => ({
    PRESENT: "bg-emerald-100 text-emerald-700",
    ABSENT: "bg-red-100 text-red-700",
    HALF_DAY: "bg-amber-100 text-amber-700",
    LATE: "bg-violet-100 text-violet-700",
  }[s] || "bg-gray-100 text-gray-600");

  const statusLabel = (s) => ({
    PRESENT: "Present",
    ABSENT: "Absent",
    HALF_DAY: "Half Day",
    LATE: "Late",
  }[s] || s || "-");

  const exportCsv = () => {
    const header = ["Emp ID", "Employee", "Department", "Date", "Check In", "Check Out", "Hours", "Status"];
    const lines = filtered.map((r) => [
      r.empId, r.name, r.department || "", r.date, formatTime(r.clockInTime), formatTime(r.clockOutTime),
      formatMinutes(r.totalWorkingMinutes), statusLabel(r.status),
    ].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `attendance-${filterDate}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) return null;
  return (
    <PageLayout role="hr" activePage="Attendance" title="Attendance Management" subtitle="Track and manage employee attendance"
      actions={
        <button onClick={exportCsv} className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Download size={16} /> Export
        </button>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: "Total",    value: stats.total,   gradient: "from-teal-400 to-emerald-500" },
            { label: "Present",  value: stats.present, gradient: "from-emerald-400 to-green-500" },
            { label: "Absent",   value: stats.absent,  gradient: "from-red-400 to-rose-500" },
            { label: "Half Day", value: stats.halfDay, gradient: "from-amber-400 to-orange-500" },
            { label: "Late",     value: stats.late,    gradient: "from-violet-400 to-purple-500" },
            { label: "On Time",  value: stats.onTime,  gradient: "from-sky-400 to-blue-500" },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.gradient} p-5 rounded-2xl text-white hover:-translate-y-1 transition-all duration-300`}>
              <p className="text-white/80 text-xs mb-1">{s.label}</p>
              <p className="text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name, ID, department…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50" />
            </div>
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50" />
            </div>
            <div className="relative">
              <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 appearance-none">
                <option value="all">All Status</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="LATE">Late</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs">
                  {["Emp ID", "Employee", "Department", "Date", "Check In", "Check Out", "Hours", "Location", "Status"].map(h => <th key={h} className="px-5 py-4 text-left font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-12">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                    </div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">No records found</td></tr>
                ) : filtered.map((r, i) => (
                  <tr key={r.employeeId ?? i} className={`hover:bg-teal-50/40 transition-colors ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
                    <td className="px-5 py-3.5 font-mono font-semibold text-gray-700">{r.empId}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {r.name}
                      {r.sessionCount > 1 && (
                        <span className="ml-1.5 text-xs font-semibold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-full align-middle">×{r.sessionCount}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{r.department || "-"}</td>
                    <td className="px-5 py-3.5 text-gray-500">{r.date}</td>
                    <td className="px-5 py-3.5 text-gray-600">{formatTime(r.clockInTime)}</td>
                    <td className="px-5 py-3.5 text-gray-600">{formatTime(r.clockOutTime)}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{formatMinutes(r.totalWorkingMinutes)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        {r.clockInLocation && (
                          <a href={mapLink(r.clockInLocation)} target="_blank" rel="noopener noreferrer" title="Clock-in location" className="text-sky-500 hover:text-sky-700">
                            <MapPin size={15} />
                          </a>
                        )}
                        {r.clockOutLocation && (
                          <a href={mapLink(r.clockOutLocation)} target="_blank" rel="noopener noreferrer" title="Clock-out location" className="text-orange-500 hover:text-orange-700">
                            <MapPin size={15} />
                          </a>
                        )}
                        {!r.clockInLocation && !r.clockOutLocation && <span className="text-gray-300 text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(r.status)}`}>{statusLabel(r.status)}</span></td>
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
export default HRAttendance;
