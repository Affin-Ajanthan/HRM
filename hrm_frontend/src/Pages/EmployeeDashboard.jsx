import React, { useState, useEffect } from 'react';

const EmployeeDashboard = ({ userData }) => {
  const [attendance, setAttendance] = useState({});
  const [leaveBalance, setLeaveBalance] = useState({});
  const [recentPayslips, setRecentPayslips] = useState([]);

  useEffect(() => {
    // Simulated API
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">
            Welcome, {userData?.name || userData?.fullName || 'Employee'}
          </h1>
          <p className="text-xl text-primary-700">Here's your overview for today</p>
        </div>
        <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-md ${
          attendance.todayStatus?.toLowerCase() === 'present' ? 'bg-success-500' : 'bg-danger-500'
        } text-white`}>
          <i className="fas fa-user-clock text-lg"></i>
          <span className="font-semibold">{attendance.todayStatus}</span>
        </div>
      </header>

      {/* Attendance */}
      <section className="mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-2xl font-semibold text-primary-900 mb-6 flex items-center gap-2">
            <i className="fas fa-clock text-accent-600"></i>
            Today's Attendance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
              <label className="block text-sm text-primary-700 font-medium mb-2">Clock In</label>
              <span className="text-3xl font-bold text-primary-900">{attendance.clockIn}</span>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl">
              <label className="block text-sm text-accent-700 font-medium mb-2">Clock Out</label>
              <span className="text-3xl font-bold text-accent-900">{attendance.clockOut}</span>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-xl">
              <label className="block text-sm text-success-700 font-medium mb-2">Hours Worked</label>
              <span className="text-3xl font-bold text-success-900">{attendance.hoursWorked} hrs</span>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button className="flex-1 max-w-xs px-6 py-3 bg-success-600 text-white rounded-xl font-semibold hover:bg-success-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <i className="fas fa-sign-in-alt mr-2"></i>Clock In
            </button>
            <button className="flex-1 max-w-xs px-6 py-3 bg-danger-600 text-white rounded-xl font-semibold hover:bg-danger-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <i className="fas fa-sign-out-alt mr-2"></i>Clock Out
            </button>
          </div>
        </div>
      </section>

      {/* Leave Balance */}
      <section className="mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-2xl font-semibold text-primary-900 mb-6 flex items-center gap-2">
            <i className="fas fa-calendar-check text-accent-600"></i>
            Leave Balance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 border border-accent-200">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white text-2xl mb-4 shadow-md">
                <i className="fas fa-umbrella-beach"></i>
              </div>
              <span className="text-4xl font-bold text-accent-900">{leaveBalance.casual}</span>
              <span className="text-sm text-accent-700 font-medium mt-2">Casual Leave</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-danger-50 to-danger-100 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 border border-danger-200">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-danger-500 to-danger-600 flex items-center justify-center text-white text-2xl mb-4 shadow-md">
                <i className="fas fa-heartbeat"></i>
              </div>
              <span className="text-4xl font-bold text-danger-900">{leaveBalance.sick}</span>
              <span className="text-sm text-danger-700 font-medium mt-2">Sick Leave</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 border border-primary-200">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-2xl mb-4 shadow-md">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <span className="text-4xl font-bold text-primary-900">{leaveBalance.annual}</span>
              <span className="text-sm text-primary-700 font-medium mt-2">Annual Leave</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-primary-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton icon="fas fa-fingerprint" label="Clock In/Out" variant="primary" />
          <QuickActionButton icon="fas fa-calendar-plus" label="Apply Leave" variant="secondary" />
          <QuickActionButton icon="fas fa-file-invoice" label="View Payslip" variant="success" />
          <QuickActionButton icon="fas fa-user-edit" label="Update Profile" variant="info" />
        </div>
      </section>

      {/* Payslips */}
      <section className="mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-primary-900 flex items-center gap-2">
              <i className="fas fa-receipt text-accent-600"></i>
              Recent Payslips
            </h3>
            <button className="px-4 py-2 border-2 border-primary-600 rounded-xl text-sm text-primary-700 font-semibold hover:bg-primary-50 transition-all duration-300">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentPayslips.map(payslip => (
              <div key={payslip.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl hover:shadow-md hover:scale-[1.02] transition-all duration-300 border border-gray-200">
                <div className="flex-1">
                  <h4 className="font-semibold text-primary-900">{payslip.month}</h4>
                  <p className="text-sm text-primary-700 font-medium">{payslip.amount}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-800 border border-success-200">
                    {payslip.status}
                  </span>
                  <button className="w-10 h-10 flex items-center justify-center bg-accent-600 text-white rounded-xl hover:bg-accent-700 hover:scale-110 transition-all duration-300 shadow-sm">
                    <i className="fas fa-download"></i>
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
