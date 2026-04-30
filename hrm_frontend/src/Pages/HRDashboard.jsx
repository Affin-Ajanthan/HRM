import React, { useState, useEffect } from 'react';

// ─── Animated Stat Card ───────────────────────────────────
const StatCard = ({ title, value, icon, gradient, subtitle, trend }) => {
  const [count, setCount] = useState(0);
  const numeric = parseInt(String(value).replace(/[^0-9]/g, '')) || 0;

  useEffect(() => {
    let n = 0;
    const step = Math.ceil(numeric / 40);
    const t = setInterval(() => {
      n += step;
      if (n >= numeric) { setCount(numeric); clearInterval(t); }
      else setCount(n);
    }, 18);
    return () => clearInterval(t);
  }, [numeric]);

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${gradient} shadow-md`}>
          {icon}
        </div>
        {trend != null && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900">{count.toLocaleString()}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
};

// ─── HR Dashboard ─────────────────────────────────────────
const HRDashboard = ({ userData }) => {
  const stats = [
    { title:'Total Employees', value:'156', icon:'👥', gradient:'from-teal-400 to-emerald-500', subtitle:'Active headcount', trend:2.1 },
    { title:'Open Positions',  value:'12',  icon:'📋', gradient:'from-violet-400 to-purple-500', subtitle:'Hiring in progress', trend:null },
    { title:'Leave Requests',  value:'8',   icon:'🗓', gradient:'from-amber-400 to-orange-500',  subtitle:'Awaiting approval', trend:-5 },
    { title:'New This Month',  value:'5',   icon:'🆕', gradient:'from-sky-400 to-blue-500',      subtitle:'Onboarded', trend:null },
  ];

  const employees = [
    { id:1, name:'Priya Sharma',   role:'Senior Dev',        dept:'Engineering', status:'Active',   initials:'PS', color:'bg-indigo-500' },
    { id:2, name:'David Lim',      role:'Product Manager',   dept:'Product',     status:'Active',   initials:'DL', color:'bg-teal-500' },
    { id:3, name:'Aisha Patel',    role:'UX Designer',       dept:'Design',      status:'On Leave', initials:'AP', color:'bg-pink-500' },
    { id:4, name:'Tom Walker',     role:'Data Analyst',      dept:'Analytics',   status:'Active',   initials:'TW', color:'bg-amber-500' },
    { id:5, name:'Chloe Martin',   role:'HR Specialist',     dept:'HR',          status:'Active',   initials:'CM', color:'bg-purple-500' },
  ];

  const leaveRequests = [
    { id:1, name:'Aisha Patel',   type:'Annual Leave',  days:3, from:'May 3', to:'May 5',   urgency:'normal', initials:'AP', color:'bg-pink-500' },
    { id:2, name:'Ravi Kumar',    type:'Sick Leave',    days:1, from:'May 2', to:'May 2',   urgency:'urgent', initials:'RK', color:'bg-indigo-500' },
    { id:3, name:'Sarah Johnson', type:'Casual Leave',  days:2, from:'May 6', to:'May 7',   urgency:'normal', initials:'SJ', color:'bg-teal-500' },
  ];

  const [leaveList, setLeaveList] = useState(leaveRequests);

  const handleApprove = (id) => setLeaveList(l => l.filter(r => r.id !== id));
  const handleReject  = (id) => setLeaveList(l => l.filter(r => r.id !== id));

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Welcome Banner ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 text-white"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #5eead4, transparent)' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-teal-200 text-sm font-medium mb-1">HR Manager Portal</p>
            <h1 className="text-3xl font-bold mb-2">
              Hello, {userData?.fullName?.split(' ')[0] || 'HR Manager'} 👋
            </h1>
            <p className="text-teal-200 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <span className="px-4 py-2 rounded-full bg-white/20 text-sm font-semibold backdrop-blur-sm">👥 156 Employees</span>
            <span className="px-4 py-2 rounded-full bg-white/20 text-sm font-semibold backdrop-blur-sm">📋 12 Open Positions</span>
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

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Employee Table */}
        <div className="card lg:col-span-2">
          <div className="section-title mb-4">
            <span>👤</span> Recent Employees
          </div>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left px-3 py-2 font-medium">Name</th>
                  <th className="text-left px-3 py-2 font-medium">Role</th>
                  <th className="text-left px-3 py-2 font-medium">Dept</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${e.color} text-white text-xs flex items-center justify-center font-semibold flex-shrink-0`}>
                          {e.initials}
                        </div>
                        <span className="font-medium text-gray-800">{e.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-500">{e.role}</td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">{e.dept}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`badge ${e.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Requests */}
        <div className="card">
          <div className="section-title mb-4">
            <span>🗓</span> Leave Requests
            <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {leaveList.length}
            </span>
          </div>
          {leaveList.length === 0 && (
            <div className="text-center text-gray-400 py-8 text-sm">All caught up! ✅</div>
          )}
          <div className="space-y-3">
            {leaveList.map(r => (
              <div key={r.id}
                   className={`p-3 rounded-xl border ${r.urgency === 'urgent' ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-full ${r.color} text-white text-xs flex items-center justify-center font-semibold`}>
                    {r.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.type} · {r.days}d</p>
                  </div>
                  {r.urgency === 'urgent' && (
                    <span className="ml-auto text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Urgent</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3">{r.from} → {r.to}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(r.id)}
                    className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    className="flex-1 py-1.5 bg-gray-200 hover:bg-red-100 text-gray-600 hover:text-red-600 text-xs font-semibold rounded-lg transition-colors"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
