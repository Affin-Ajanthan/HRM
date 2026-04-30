import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Filter, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";

const HRAttendance = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) { const u = JSON.parse(s); if (u.role !== "HR_MANAGER" && u.role !== "ADMIN") { navigate("/unauthorized"); return; } setUser(u); }
    else navigate("/login");
  }, [navigate]);

  const attendanceData = [
    { id:1, empId:"EMP001", name:"John Doe",      department:"IT",        date:"2026-01-21", checkIn:"09:00 AM", checkOut:"06:00 PM", status:"Present",  workHours:"9h 0m" },
    { id:2, empId:"EMP002", name:"Jane Smith",    department:"HR",        date:"2026-01-21", checkIn:"08:45 AM", checkOut:"05:45 PM", status:"Present",  workHours:"9h 0m" },
    { id:3, empId:"EMP003", name:"Mike Johnson",  department:"Finance",   date:"2026-01-21", checkIn:"-",        checkOut:"-",        status:"Absent",   workHours:"-" },
    { id:4, empId:"EMP004", name:"Sarah Williams",department:"IT",        date:"2026-01-21", checkIn:"09:15 AM", checkOut:"-",        status:"Half Day", workHours:"4h 30m" },
    { id:5, empId:"EMP005", name:"David Brown",   department:"Marketing", date:"2026-01-21", checkIn:"09:30 AM", checkOut:"06:30 PM", status:"Present",  workHours:"9h 0m" },
  ];
  const stats = { total:45, present:38, absent:5, halfDay:2, late:8, onTime:30 };
  const filtered = attendanceData.filter(r =>
    (r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.empId.toLowerCase().includes(searchTerm.toLowerCase()) || r.department.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === "all" || r.status.toLowerCase() === filterStatus.toLowerCase())
  );
  const statusBadge = (s) => ({ Present:"bg-emerald-100 text-emerald-700", Absent:"bg-red-100 text-red-700", "Half Day":"bg-amber-100 text-amber-700" }[s] || "bg-gray-100 text-gray-600");

  if (!user) return null;
  return (
    <PageLayout role="hr" activePage="Attendance" title="Attendance Management" subtitle="Track and manage employee attendance"
      actions={
        <button onClick={() => alert("Exporting…")} className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Download size={16} /> Export
        </button>
      }
    >
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label:"Total",    value:stats.total,   gradient:"from-teal-400 to-emerald-500" },
            { label:"Present",  value:stats.present, gradient:"from-emerald-400 to-green-500" },
            { label:"Absent",   value:stats.absent,  gradient:"from-red-400 to-rose-500" },
            { label:"Half Day", value:stats.halfDay, gradient:"from-amber-400 to-orange-500" },
            { label:"Late",     value:stats.late,    gradient:"from-violet-400 to-purple-500" },
            { label:"On Time",  value:stats.onTime,  gradient:"from-sky-400 to-blue-500" },
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
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half day">Half Day</option>
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
                  {["Emp ID","Employee","Department","Date","Check In","Check Out","Hours","Status"].map(h => <th key={h} className="px-5 py-4 text-left font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r, i) => (
                  <tr key={r.id} className={`hover:bg-teal-50/40 transition-colors ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
                    <td className="px-5 py-3.5 font-mono font-semibold text-gray-700">{r.empId}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{r.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{r.department}</td>
                    <td className="px-5 py-3.5 text-gray-500">{r.date}</td>
                    <td className="px-5 py-3.5 text-gray-600">{r.checkIn}</td>
                    <td className="px-5 py-3.5 text-gray-600">{r.checkOut}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{r.workHours}</td>
                    <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(r.status)}`}>{r.status}</span></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
export default HRAttendance;
