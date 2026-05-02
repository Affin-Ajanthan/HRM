import React, { useState, useEffect } from 'react';

const EmployeeDashboard = ({ userData }) => {
  const [attendance, setAttendance] = useState({});
  const [leaveBalance, setLeaveBalance] = useState({});
  const [recentPayslips, setRecentPayslips] = useState([]);

  useEffect(() => {
    // TODO: Replace with real API call when backend is reconnected
    setAttendance({
      todayStatus: 'Present',
      clockIn: '09:00 AM',
      clockOut: '06:00 PM',
      hoursWorked: '9.0'
    });

    setLeaveBalance({
      casual: 12,
      sick: 8,
      annual: 18
    });

    setRecentPayslips([
      { id: 1, month: 'December 2025', amount: '$4,500', status: 'Processed' },
      { id: 2, month: 'November 2025', amount: '$4,500', status: 'Processed' }
    ]);
  }, []);

  const QuickActionButton = ({ icon, label, onClick, variant }) => {
    const colorClasses = {
      primary: 'text-primary-600 bg-primary-50',
      secondary: 'text-accent-600 bg-accent-50',
      success: 'text-success-600 bg-success-50',
      info: 'text-warning-600 bg-warning-50'
    };
    
    return (
      <button 
        className={`rounded-xl p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-200 ${colorClasses[variant]}`}
        onClick={onClick}
      >
        <i className={`${icon} text-3xl`}></i>
        <span className="font-semibold text-gray-800">{label}</span>
      </button>
    );
  };

  // Read user from localStorage if no prop passed
  const user = userData || (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {user?.fullName || user?.name || 'Employee'} 👋
          </h1>
          <p className="text-lg text-gray-600">Here's your overview for today</p>
        </div>
        <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-md ${
          attendance.todayStatus?.toLowerCase() === 'present'
            ? 'bg-emerald-500'
            : 'bg-red-500'
        } text-white`}>
          <span className="text-lg">🕐</span>
          <span className="font-semibold">{attendance.todayStatus || 'Loading...'}</span>
        </div>
      </header>

      {/* Attendance */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            🕐 Today's Attendance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <label className="block text-sm text-indigo-700 font-medium mb-2">Clock In</label>
              <span className="text-3xl font-bold text-indigo-900">{attendance.clockIn}</span>
            </div>
            <div className="text-center p-4 bg-violet-50 rounded-xl border border-violet-100">
              <label className="block text-sm text-violet-700 font-medium mb-2">Clock Out</label>
              <span className="text-3xl font-bold text-violet-900">{attendance.clockOut}</span>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <label className="block text-sm text-emerald-700 font-medium mb-2">Hours Worked</label>
              <span className="text-3xl font-bold text-emerald-900">{attendance.hoursWorked} hrs</span>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button className="flex-1 max-w-xs px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 hover:shadow-lg hover:scale-105 transition-all duration-300">
              ✅ Clock In
            </button>
            <button className="flex-1 max-w-xs px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 hover:shadow-lg hover:scale-105 transition-all duration-300">
              🚪 Clock Out
            </button>
          </div>
        </div>
      </section>

      {/* Leave Balance */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            📅 Leave Balance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-6 bg-violet-50 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-300 border border-violet-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-2xl mb-4 shadow-md">🏖️</div>
              <span className="text-4xl font-bold text-violet-900">{leaveBalance.casual}</span>
              <span className="text-sm text-violet-700 font-medium mt-2">Casual Leave</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-red-50 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-300 border border-red-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-2xl mb-4 shadow-md">❤️</div>
              <span className="text-4xl font-bold text-red-900">{leaveBalance.sick}</span>
              <span className="text-sm text-red-700 font-medium mt-2">Sick Leave</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-indigo-50 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-300 border border-indigo-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white text-2xl mb-4 shadow-md">📆</div>
              <span className="text-4xl font-bold text-indigo-900">{leaveBalance.annual}</span>
              <span className="text-sm text-indigo-700 font-medium mt-2">Annual Leave</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji:'🖐️', label:'Clock In/Out',    bg:'bg-indigo-50',   text:'text-indigo-700',  border:'border-indigo-100' },
            { emoji:'📋', label:'Apply Leave',     bg:'bg-violet-50',   text:'text-violet-700',  border:'border-violet-100' },
            { emoji:'🧾', label:'View Payslip',    bg:'bg-emerald-50',  text:'text-emerald-700', border:'border-emerald-100' },
            { emoji:'✏️', label:'Update Profile',  bg:'bg-amber-50',    text:'text-amber-700',   border:'border-amber-100'  },
          ].map(a => (
            <button key={a.label} className={`${a.bg} ${a.text} border ${a.border} rounded-2xl p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:scale-105 transition-all duration-300`}>
              <span className="text-3xl">{a.emoji}</span>
              <span className="font-semibold text-sm text-gray-800">{a.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Payslips */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              🧾 Recent Payslips
            </h3>
            <button className="px-4 py-2 border-2 border-indigo-500 rounded-xl text-sm text-indigo-700 font-semibold hover:bg-indigo-50 transition-all duration-300">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentPayslips.map(payslip => (
              <div key={payslip.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:shadow-md hover:scale-[1.02] transition-all duration-300 border border-gray-100">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{payslip.month}</h4>
                  <p className="text-sm text-gray-600 font-medium">{payslip.amount}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {payslip.status}
                  </span>
                  <button className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:scale-110 transition-all duration-300 shadow-sm">
                    ⬇️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmployeeDashboard;
