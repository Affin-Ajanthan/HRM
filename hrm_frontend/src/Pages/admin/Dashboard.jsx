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
  Bell,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  CalendarCheck,
  Search,
  ChevronDown,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const AdminDashboard = () => {
  const [user, setUser]           = useState(null);
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [stats] = useState({
    totalCompanies: 24,
    pendingApprovals: 3,
    activeUsers: 156,
    systemHealth: "Good",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role !== "ADMIN") { navigate("/unauthorized"); return; }
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

  const menuItems = [
    { name: "Overview",    icon: LayoutDashboard, path: null },
    { name: "Companies",   icon: Building2,        path: "/admin/companies" },
    { name: "System Users",icon: Users,            path: "/admin/system-users" },
    { name: "Attendance",  icon: CalendarCheck,    path: "/admin/attendance" },
    { name: "Leave",       icon: FileText,         path: "/admin/leave" },
    { name: "Payroll",     icon: Activity,         path: "/admin/payslip" },
    { name: "System Config",icon: Settings,        path: "/admin/system-config" },
  ];

  const handleMenuClick = (item) => {
    if (item.path) navigate(item.path);
    else setActiveMenu(item.name);
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'A';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">

      {/* ── Premium Navy Sidebar ── */}
      <nav
        className={`flex flex-col transition-all duration-300 shadow-2xl flex-shrink-0 ${isSidebarOpen ? 'w-64' : 'w-20'}`}
        style={{ background: 'linear-gradient(180deg, #0a1120 0%, #0f172a 100%)' }}
      >
        {/* Logo row */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 flex-shrink-0">
          <img src={logo} alt="Logo" className="w-9 h-9 rounded-xl flex-shrink-0 shadow-md" />
          {isSidebarOpen && <span className="text-white text-base font-bold tracking-tight">HRM Admin</span>}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Nav items */}
        <ul className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = activeMenu === item.name;
            return (
              <li key={item.name}>
                <button
                  onClick={() => handleMenuClick(item)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                    } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(79,70,229,0.6))',
                    boxShadow: '0 2px 12px rgba(99,102,241,0.35)'
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{user.fullName}</p>
                <p className="text-gray-500 text-xs">Administrator</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-red-500/20 transition-all duration-200 ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="flex-shrink-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{activeMenu}</h1>
            <p className="text-xs text-gray-400 hidden md:block">System Administrator Dashboard</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search…" className="pl-9 pr-4 py-2 w-48 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
            </div>
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow">
                  {initials}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold text-gray-800 leading-tight">{user.fullName}</span>
                  <span className="text-xs text-gray-400">Admin</span>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20">
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {activeMenu === "Overview" && (
            <div className="space-y-6 animate-fade-in">

              {/* Banner */}
              <div className="relative overflow-hidden rounded-3xl p-8 text-white"
                   style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #6d28d9 100%)' }}>
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20"
                     style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-indigo-200 text-sm font-medium mb-1">Administrator Portal</p>
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {user.fullName?.split(' ')[0]} 👋</h2>
                    <p className="text-indigo-200 text-sm">
                      {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
                    </p>
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-2">
                    <span className="px-4 py-2 rounded-full bg-white/20 text-sm font-semibold backdrop-blur-sm">🏢 {stats.totalCompanies} Companies</span>
                    <span className="px-4 py-2 rounded-full bg-white/20 text-sm font-semibold backdrop-blur-sm">⚠️ {stats.pendingApprovals} Pending</span>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {[
                  { title:'Total Companies',    value:stats.totalCompanies,  icon:'🏢', gradient:'from-indigo-500 to-violet-600', trend:'+12%' },
                  { title:'Pending Approvals',  value:stats.pendingApprovals,icon:'⚠️', gradient:'from-amber-400 to-orange-500',  trend:'Needs attention' },
                  { title:'Active Users',       value:stats.activeUsers,     icon:'👥', gradient:'from-emerald-400 to-teal-500',  trend:'+8%' },
                  { title:'System Health',      value:'Good',                icon:'✅', gradient:'from-sky-400 to-blue-500',      trend:'All operational' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${s.gradient} shadow-md`}>
                        {s.icon}
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">{s.trend}</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{s.title}</p>
                  </div>
                ))}
              </div>

              {/* Middle Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Activity Feed */}
                <div className="card lg:col-span-2">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-5">🔔 Recent System Activity</h3>
                  <div className="space-y-3">
                    {[
                      { icon:'🏢', bg:'bg-indigo-100 text-indigo-600', action:'New company registration', detail:'Tech Solutions Ltd — Pending Approval', time:'2h ago', badge:'Pending', badgeCls:'bg-amber-100 text-amber-700' },
                      { icon:'⚙️', bg:'bg-purple-100 text-purple-600', action:'System configuration updated', detail:'Leave policy settings modified', time:'5h ago', badge:'Updated', badgeCls:'bg-blue-100 text-blue-700' },
                      { icon:'✅', bg:'bg-emerald-100 text-emerald-600', action:'Company approved', detail:'ABC Corporation — Now Active', time:'1d ago', badge:'Approved', badgeCls:'bg-emerald-100 text-emerald-700' },
                    ].map((a, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${a.bg} flex-shrink-0`}>{a.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{a.action}</p>
                          <p className="text-xs text-gray-500 truncate">{a.detail}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.badgeCls}`}>{a.badge}</span>
                          <span className="text-xs text-gray-400">{a.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Health */}
                <div className="card">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-5">📊 System Health</h3>
                  <div className="space-y-4">
                    {[
                      { label:'Server Uptime',  pct:99.9, color:'bg-emerald-500', textCls:'text-emerald-600' },
                      { label:'Database Load',  pct:45,   color:'bg-blue-500',    textCls:'text-blue-600' },
                      { label:'API Response',   pct:78,   color:'bg-amber-500',   textCls:'text-amber-600' },
                      { label:'Storage Used',   pct:62,   color:'bg-orange-500',  textCls:'text-orange-600' },
                    ].map(m => (
                      <div key={m.label}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-600">{m.label}</span>
                          <span className={`font-semibold ${m.textCls}`}>{m.pct}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${m.color} transition-all duration-700`} style={{ width:`${m.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pending Approvals Table */}
              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">🏢 Pending Company Approvals</h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">2 pending</span>
                </div>
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="text-left px-4 py-2 font-medium">Company</th>
                        <th className="text-left px-4 py-2 font-medium">Contact</th>
                        <th className="text-left px-4 py-2 font-medium">Size</th>
                        <th className="text-left px-4 py-2 font-medium">Submitted</th>
                        <th className="text-right px-4 py-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { name:'Tech Solutions Ltd', type:'IT Services', contact:'contact@techsol.com', size:'~50', when:'2h ago' },
                        { name:'Global Marketing Inc',type:'Marketing',  contact:'info@globalmark.com', size:'~120',when:'1d ago' },
                      ].map((c, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-800">{c.name}</p>
                            <p className="text-xs text-gray-400">{c.type}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{c.contact}</td>
                          <td className="px-4 py-3 text-gray-500">{c.size}</td>
                          <td className="px-4 py-3 text-gray-400">{c.when}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors">Approve</button>
                              <button className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold rounded-lg transition-colors">Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeMenu !== "Overview" && (
            <div className="card animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{activeMenu}</h3>
              <p className="text-gray-400 text-sm">Content for {activeMenu} will be displayed here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
