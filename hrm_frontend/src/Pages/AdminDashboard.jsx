import React, { useState, useEffect } from 'react';

// ─── Mini SVG Bar Chart ───────────────────────────────────
const MiniBarChart = ({ data, color = '#6366f1' }) => {
  const max = Math.max(...data, 1);
  return (
    <svg viewBox={`0 0 ${data.length * 14} 40`} className="w-full h-12">
      {data.map((v, i) => {
        const h = (v / max) * 36;
        return (
          <rect
            key={i}
            x={i * 14 + 2}
            y={40 - h}
            width={10}
            height={h}
            rx={3}
            fill={color}
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
};

// ─── Animated Count‑Up Stat Card ─────────────────────────
const StatCard = ({ title, value, icon, gradient, subtitle, trend, chartData, chartColor }) => {
  const [count, setCount] = useState(0);
  const numeric = parseInt(String(value).replace(/[^0-9]/g, '')) || 0;
  const prefix  = String(value).match(/^[^0-9]*/)?.[0] || '';
  const suffix  = String(value).match(/[^0-9]*$/)?.[0] || '';

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(numeric / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= numeric) { setCount(numeric); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [numeric]);

  return (
    <div className="stat-card animate-fade-in">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${gradient} shadow-md`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-900 tabular-nums">
        {prefix}{count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}

      {/* Sparkline */}
      {chartData && (
        <div className="mt-3 -mx-1">
          <MiniBarChart data={chartData} color={chartColor} />
        </div>
      )}
    </div>
  );
};

// ─── Department Breakdown Bar ─────────────────────────────
const DeptBar = ({ name, count, total, color }) => {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{name}</span>
        <span className="text-gray-500">{count} <span className="text-xs text-gray-400">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

// ─── Admin Dashboard ─────────────────────────────────────
const AdminDashboard = ({ userData }) => {
  const stats = [
    { title: 'Total Employees', value: '156', icon: '👥', gradient: 'from-indigo-500 to-violet-600', subtitle: '+5 this month', trend: 3.2, chartData: [80,95,100,110,120,135,156], chartColor: '#818cf8' },
    { title: "Today's Attendance", value: '142/156', icon: '✅', gradient: 'from-emerald-400 to-teal-500', subtitle: '91% present', trend: 1.4, chartData: [130,138,142,135,145,140,142], chartColor: '#34d399' },
    { title: 'Pending Leaves', value: '8', icon: '🗓', gradient: 'from-amber-400 to-orange-500', subtitle: 'Require attention', trend: -12, chartData: [15,12,10,14,9,11,8], chartColor: '#fbbf24' },
    { title: 'Monthly Payroll', value: '$75,420', icon: '💰', gradient: 'from-pink-500 to-rose-500', subtitle: 'This month', trend: 2.1, chartData: [68000,70000,71000,73000,74000,75000,75420], chartColor: '#fb7185' },
  ];

  const activities = [
    { id:1, icon:'👤', action:'New employee onboarded', user:'Sarah Johnson', dept:'Engineering', time:'10:30 AM', color:'bg-indigo-100 text-indigo-600' },
    { id:2, icon:'✅', action:'Leave request approved',  user:'Mike Chen',      dept:'Design',       time:'09:15 AM', color:'bg-emerald-100 text-emerald-600' },
    { id:3, icon:'💳', action:'Payroll batch processed', user:'Finance Dept',   dept:'Finance',      time:'08:45 AM', color:'bg-amber-100 text-amber-600' },
    { id:4, icon:'⚙️', action:'System backup completed', user:'IT Operations',  dept:'IT',           time:'08:00 AM', color:'bg-purple-100 text-purple-600' },
  ];

  const departments = [
    { name:'Engineering', count:52, color:'#6366f1' },
    { name:'Design',      count:24, color:'#14b8a6' },
    { name:'Sales',       count:38, color:'#f59e0b' },
    { name:'HR',          count:18, color:'#ec4899' },
    { name:'Finance',     count:24, color:'#8b5cf6' },
  ];

  const quickActions = [
    { icon:'➕', label:'Add Employee',     bg:'bg-indigo-50', text:'text-indigo-700', hover:'hover:bg-indigo-100' },
    { icon:'💳', label:'Process Payroll',  bg:'bg-emerald-50',text:'text-emerald-700',hover:'hover:bg-emerald-100' },
    { icon:'📊', label:'Generate Reports', bg:'bg-amber-50',  text:'text-amber-700',  hover:'hover:bg-amber-100' },
    { icon:'⚙️', label:'System Settings',  bg:'bg-purple-50', text:'text-purple-700', hover:'hover:bg-purple-100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Welcome Banner ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 text-white"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #6d28d9 100%)' }}
      >
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, #c4b5fd, transparent)' }} />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">Admin Portal</p>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {userData?.fullName?.split(' ')[0] || 'Admin'} 👋
            </h1>
            <p className="text-indigo-200 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <span className="px-4 py-2 rounded-full bg-white/20 text-sm font-semibold backdrop-blur-sm">
              🏢 156 Employees
            </span>
            <span className="px-4 py-2 rounded-full bg-white/20 text-sm font-semibold backdrop-blur-sm">
              📋 8 Pending Leaves
            </span>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <div key={i} style={{ animationDelay: `${i * 60}ms` }}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Activity Feed */}
        <div className="card lg:col-span-2">
          <div className="section-title mb-5">
            <span>🔔</span> Recent Activity
          </div>
          <div className="space-y-3">
            {activities.map((a, i) => (
              <div
                key={a.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${a.color}`}>
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{a.action}</p>
                  <p className="text-xs text-gray-500 truncate">{a.user} · {a.dept}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="card">
          <div className="section-title mb-5">
            <span>🏢</span> By Department
          </div>
          {departments.map(d => (
            <DeptBar key={d.name} {...d} total={156} />
          ))}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-3">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((a, i) => (
            <button
              key={i}
              className={`${a.bg} ${a.text} ${a.hover} rounded-2xl p-5 flex flex-col items-center gap-2.5
                          font-semibold text-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
            >
              <span className="text-3xl">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
