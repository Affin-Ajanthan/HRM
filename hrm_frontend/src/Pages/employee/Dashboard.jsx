import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClockIcon,
  CalendarDays,
  DollarSign,
  User,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Award,
  Target,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Gift,
  Search,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const EmployeeDashboard = () => {
  const [user, setUser]           = useState(null);
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [clockedIn, setClockedIn] = useState(false);
  const [stats] = useState({ presentDays: 0, leaveBalance: 0, pendingLeaves: 0, lastSalary: "0.00" });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    else navigate("/login");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { name: "Overview",   icon: LayoutDashboard, path: null },
    { name: "Attendance", icon: ClockIcon,        path: "/employee/attendance" },
    { name: "Leave",      icon: CalendarDays,     path: "/employee/leave" },
    { name: "Payslip",    icon: DollarSign,       path: "/employee/payslip" },
    { name: "Profile",    icon: User,             path: "/employee/profile" },
  ];

  const handleMenuClick = (item) => {
    if (item.path) navigate(item.path);
    else setActiveMenu(item.name);
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'E';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });

  return (
    <div className="flex h-screen bg-gray-50">

      {/* ── Premium Navy Sidebar ── */}
      <nav
        className={`flex flex-col transition-all duration-300 shadow-2xl flex-shrink-0 ${isSidebarOpen ? 'w-64' : 'w-20'}`}
        style={{ background: 'linear-gradient(180deg, #0a1120 0%, #0f172a 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 flex-shrink-0">
          <img src={logo} alt="Logo" className="w-9 h-9 rounded-xl flex-shrink-0 shadow-md" />
          {isSidebarOpen && <span className="text-white text-base font-bold tracking-tight">HRM Portal</span>}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Nav */}
        <ul className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = activeMenu === item.name;
            return (
              <li key={item.name}>
                <button
                  onClick={() => handleMenuClick(item)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}
                    ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(14,165,233,0.7), rgba(6,182,212,0.5))',
                    boxShadow: '0 2px 12px rgba(14,165,233,0.3)'
                  } : {}}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {isSidebarOpen && <span>{item.name}</span>}
                </button>
              </li>
            );
          })}
        </ul>

        {/* User + logout */}
        <div className="border-t border-white/10 p-3 space-y-2 flex-shrink-0">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{user.fullName}</p>
                <p className="text-gray-500 text-xs">Employee</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-red-500/20 transition-all ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex-shrink-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{activeMenu}</h1>
            <p className="text-xs text-gray-400 hidden md:block">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search…" className="pl-9 pr-4 py-2 w-48 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all" />
            </div>
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="relative">
              <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow">
                  {initials}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold text-gray-800 leading-tight">{user.fullName}</span>
                  <span className="text-xs text-gray-400">Employee</span>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20">
                  <button onClick={() => navigate('/employee/profile')} className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">👤 My Profile</button>
                  <hr className="border-gray-100" />
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50">🚪 Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {activeMenu === "Overview" && (
            <div className="space-y-6 animate-fade-in">

              {/* Banner + Clock-in */}
              <div className="relative overflow-hidden rounded-3xl p-8 text-white"
                   style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)' }}>
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
                     style={{ background: 'radial-gradient(circle, #7dd3fc, transparent)' }} />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <p className="text-sky-200 text-sm font-medium mb-1">Employee Self Service</p>
                    <h2 className="text-3xl font-bold mb-2">Welcome, {user.fullName?.split(' ')[0]} 👋</h2>
                    <p className="text-sky-200 text-sm">
                      {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4">
                    <div className="text-center">
                      <p className="text-sky-200 text-xs font-medium mb-1">Work Status</p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${clockedIn ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                        <span className="text-sm font-bold">{clockedIn ? 'Clocked In' : 'Clocked Out'}</span>
                      </div>
                      <button
                        onClick={() => setClockedIn(!clockedIn)}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                          clockedIn ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-white text-sky-700 hover:bg-sky-50'
                        }`}
                      >
                        {clockedIn ? '⏹ Clock Out' : '▶ Clock In'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {[
                  { title:'Present Days',   value:stats.presentDays,   icon:'⏱', gradient:'from-sky-400 to-blue-500',    sub:'This month' },
                  { title:'Leave Balance',  value:stats.leaveBalance,  icon:'🌴', gradient:'from-emerald-400 to-teal-500', sub:'Days available' },
                  { title:'Pending Leaves', value:stats.pendingLeaves, icon:'🗓', gradient:'from-amber-400 to-orange-500', sub:'Awaiting approval' },
                  { title:'Last Salary',    value:`Rs. ${stats.lastSalary}`, icon:'💳', gradient:'from-violet-400 to-purple-500', sub:'January 2026' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${s.gradient} shadow-md mb-4`}>
                      {s.icon}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{s.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Bottom grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Attendance + Quick Actions */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="card">
                    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-5">
                      <span className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">⏱</span>
                      Today's Attendance
                    </h3>
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {[
                        { label:'Clock In',      value:'--:--', bg:'bg-sky-50',    text:'text-sky-600' },
                        { label:'Clock Out',     value:'--:--', bg:'bg-orange-50', text:'text-orange-600' },
                        { label:'Working Hours', value:'0h 0m', bg:'bg-emerald-50',text:'text-emerald-600' },
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
                        className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors"
                      >
                        <ClockIcon size={18} /> Clock In
                      </button>
                      <button
                        disabled={!clockedIn}
                        onClick={() => setClockedIn(false)}
                        className="flex-1 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-400 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors disabled:cursor-not-allowed"
                      >
                        <ClockIcon size={18} /> Clock Out
                      </button>
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="card">
                    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-5">
                      <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">🎯</span>
                      My Performance
                    </h3>
                    <div className="space-y-4">
                      {[
                        { label:'Attendance Rate',    pct:95, color:'from-emerald-500 to-teal-500',    textCls:'text-emerald-600' },
                        { label:'Task Completion',    pct:88, color:'from-sky-500 to-cyan-500',         textCls:'text-sky-600' },
                        { label:'Team Collaboration', pct:92, color:'from-violet-500 to-purple-500',   textCls:'text-violet-600' },
                      ].map(m => (
                        <div key={m.label}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-gray-600 font-medium">{m.label}</span>
                            <span className={`font-bold ${m.textCls}`}>{m.pct}%</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-700`} style={{ width:`${m.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-amber-50 rounded-xl flex items-center gap-3">
                      <Award className="text-amber-500" size={24} />
                      <div>
                        <p className="font-semibold text-amber-800 text-sm">Great Job!</p>
                        <p className="text-xs text-amber-600">You're performing above average</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-5">
                  {/* Quick Actions */}
                  <div className="card">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">⚡ Quick Actions</h3>
                    <div className="space-y-2.5">
                      {[
                        { label:'Apply for Leave',icon:'🌴', bg:'bg-emerald-50 hover:bg-emerald-100 text-emerald-700', path:'/employee/leave' },
                        { label:'View Payslip',  icon:'💳', bg:'bg-violet-50 hover:bg-violet-100 text-violet-700',   path:'/employee/payslip' },
                        { label:'Update Profile',icon:'👤', bg:'bg-sky-50 hover:bg-sky-100 text-sky-700',            path:'/employee/profile' },
                      ].map(a => (
                        <button key={a.label} onClick={() => navigate(a.path)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-xl font-medium text-sm transition-all ${a.bg}`}>
                          <span className="flex items-center gap-2.5"><span className="text-lg">{a.icon}</span>{a.label}</span>
                          <ChevronRight size={16} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Events */}
                  <div className="card">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">📅 Upcoming</h3>
                    <div className="space-y-3">
                      {[
                        { title:'Team Meeting',        time:'Tomorrow 10 AM',   icon:'👥', bg:'bg-sky-50 text-sky-600' },
                        { title:'Performance Review',  time:'Jan 25 at 2 PM',   icon:'🏆', bg:'bg-violet-50 text-violet-600' },
                        { title:'Company Anniversary', time:'Jan 28, 2026',     icon:'🎉', bg:'bg-amber-50 text-amber-600' },
                      ].map((e, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${e.bg}`}>{e.icon}</div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{e.title}</p>
                            <p className="text-xs text-gray-400">{e.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
