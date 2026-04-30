import React, { useState, useEffect } from 'react';

// ─── SVG Clock Ring ───────────────────────────────────────
const ClockRing = ({ hoursWorked, totalHours = 9 }) => {
  const pct  = Math.min((parseFloat(hoursWorked) / totalHours) * 100, 100);
  const r    = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      {/* Track */}
      <circle cx="48" cy="48" r={r} fill="none" stroke="#e0e7ff" strokeWidth="8" />
      {/* Progress */}
      <circle
        cx="48" cy="48" r={r} fill="none"
        stroke="url(#skyGrad)" strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}   /* start at top */
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      {/* Center text */}
      <text x="48" y="44" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">{hoursWorked}h</text>
      <text x="48" y="58" textAnchor="middle" fontSize="9"  fontWeight="500" fill="#94a3b8">of {totalHours}h</text>
    </svg>
  );
};

// ─── Leave Balance Card ────────────────────────────────────
const LeaveCard = ({ type, used, total, color, bg, icon }) => {
  const pct = Math.round((used / total) * 100);
  return (
    <div className={`${bg} rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-semibold text-gray-700">{type}</span>
        </div>
        <span className="text-xs text-gray-500">{total - used} left</span>
      </div>
      <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background: color }} />
      </div>
      <p className="text-xs text-gray-500">{used} used / {total} total</p>
    </div>
  );
};

// ─── Employee Dashboard ───────────────────────────────────
const EmployeeDashboard = ({ userData }) => {
  const [clockedIn, setClockedIn] = useState(false);
  const [hoursWorked] = useState(6.5);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const leaveBalances = [
    { type:'Annual Leave', used:5,  total:21, color:'linear-gradient(90deg,#6366f1,#818cf8)', bg:'bg-indigo-50', icon:'🌴' },
    { type:'Sick Leave',   used:2,  total:10, color:'linear-gradient(90deg,#14b8a6,#2dd4bf)', bg:'bg-teal-50',   icon:'🤒' },
    { type:'Casual Leave', used:1,  total:7,  color:'linear-gradient(90deg,#f59e0b,#fbbf24)', bg:'bg-amber-50',  icon:'☀️' },
    { type:'Maternity',    used:0,  total:84, color:'linear-gradient(90deg,#ec4899,#f9a8d4)', bg:'bg-pink-50',   icon:'🌸' },
  ];

  const payslips = [
    { month:'April 2026', net:'$3,850', status:'Available' },
    { month:'March 2026', net:'$3,720', status:'Available' },
    { month:'Feb 2026',   net:'$3,720', status:'Available' },
  ];

  const recentLeaves = [
    { id:1, type:'Annual Leave', from:'Apr 20', to:'Apr 22', days:3, status:'Approved' },
    { id:2, type:'Sick Leave',   from:'Mar 15', to:'Mar 15', days:1, status:'Approved' },
    { id:3, type:'Casual Leave', from:'Mar 01', to:'Mar 02', days:2, status:'Pending'  },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Welcome Banner ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 text-white"
        style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #7dd3fc, transparent)' }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sky-200 text-sm font-medium mb-1">Employee Self Service</p>
            <h1 className="text-3xl font-bold mb-2">
              {greeting}, {userData?.fullName?.split(' ')[0] || 'Employee'} 👋
            </h1>
            <p className="text-sky-200 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
            </p>
          </div>

          {/* Clock-in section */}
          <div className="flex items-center gap-5 bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4">
            <ClockRing hoursWorked={hoursWorked} />
            <div>
              <p className="text-sky-200 text-xs font-medium mb-2">Today's Work</p>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${clockedIn ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm font-semibold">{clockedIn ? 'Clocked In' : 'Clocked Out'}</span>
              </div>
              <button
                onClick={() => setClockedIn(!clockedIn)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  clockedIn
                    ? 'bg-red-500 hover:bg-red-400 text-white'
                    : 'bg-white text-sky-700 hover:bg-sky-50'
                }`}
              >
                {clockedIn ? 'Clock Out' : 'Clock In'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Leave Balance ── */}
      <div className="card">
        <div className="section-title mb-4"><span>📊</span> Leave Balance</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {leaveBalances.map((l, i) => (
            <LeaveCard key={i} {...l} />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <button className="btn-primary text-sm">+ Apply for Leave</button>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Leave History */}
        <div className="card">
          <div className="section-title mb-4"><span>🗓</span> Recent Leaves</div>
          <div className="space-y-3">
            {recentLeaves.map(l => (
              <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{l.type}</p>
                  <p className="text-xs text-gray-500">{l.from} → {l.to} · {l.days} day{l.days > 1 ? 's' : ''}</p>
                </div>
                <span className={`badge ${
                  l.status === 'Approved' ? 'badge-success' : 'badge-warning'
                }`}>{l.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payslips */}
        <div className="card">
          <div className="section-title mb-4"><span>💳</span> Recent Payslips</div>
          <div className="space-y-3">
            {payslips.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{p.month}</p>
                  <p className="text-xs text-gray-500">Net Pay · {p.net}</p>
                </div>
                <button className="text-xs font-semibold text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors">
                  ⬇ Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
