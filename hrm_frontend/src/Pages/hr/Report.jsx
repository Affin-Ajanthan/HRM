import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Clock, DollarSign, FileText, Bell } from 'lucide-react';
import NotificationPopup from '../../components/NotificationPopup.jsx';

const Report = () => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [showNotifications, setShowNotifications] = useState(false);

  // Sample report data
  const reportCards = [
    {
      id: 'employees',
      title: 'Total Employees',
      value: '245',
      change: '+5.2%',
      icon: Users,
      color: 'teal'
    },
    {
      id: 'attendance',
      title: 'Attendance Rate',
      value: '94.2%',
      change: '+2.1%',
      icon: Clock,
      color: 'teal'
    },
    {
      id: 'payroll',
      title: 'Monthly Payroll',
      value: '$1.2M',
      change: '+0.5%',
      icon: DollarSign,
      color: 'teal'
    },
    {
      id: 'reports',
      title: 'Reports Generated',
      value: '28',
      change: '+8.3%',
      icon: FileText,
      color: 'teal'
    }
  ];

  const employeeReports = [
    { id: 1, name: 'Employee Headcount Report', date: '2026-02-25', status: 'Ready', downloads: 342 },
    { id: 2, name: 'Department Wise Distribution', date: '2026-02-24', status: 'Ready', downloads: 215 },
    { id: 3, name: 'Salary Analysis Report', date: '2026-02-23', status: 'Processing', downloads: 0 },
    { id: 4, name: 'Employee Performance Summary', date: '2026-02-22', status: 'Ready', downloads: 189 },
    { id: 5, name: 'Hire-to-Retire Metrics', date: '2026-02-21', status: 'Ready', downloads: 156 }
  ];

  const attendanceReports = [
    { id: 1, name: 'Monthly Attendance Summary', date: '2026-02-25', status: 'Ready', downloads: 278 },
    { id: 2, name: 'Late Coming Report', date: '2026-02-24', status: 'Ready', downloads: 145 },
    { id: 3, name: 'Absenteeism Analysis', date: '2026-02-23', status: 'Ready', downloads: 167 },
    { id: 4, name: 'Department Attendance Comparison', date: '2026-02-22', status: 'Ready', downloads: 198 },
    { id: 5, name: 'Shift Wise Attendance', date: '2026-02-21', status: 'Processing', downloads: 0 }
  ];

  const payrollReports = [
    { id: 1, name: 'Monthly Payroll Register', date: '2026-02-25', status: 'Ready', downloads: 567 },
    { id: 2, name: 'Tax Deduction Summary', date: '2026-02-24', status: 'Ready', downloads: 234 },
    { id: 3, name: 'Salary Increment Analysis', date: '2026-02-23', status: 'Ready', downloads: 189 },
    { id: 4, name: 'Benefits Summary Report', date: '2026-02-22', status: 'Ready', downloads: 201 },
    { id: 5, name: 'Overtime Compensation', date: '2026-02-21', status: 'Ready', downloads: 156 }
  ];

  const leaveReports = [
    { id: 1, name: 'Leave Balance Summary', date: '2026-02-25', status: 'Ready', downloads: 312 },
    { id: 2, name: 'Leave Utilization Report', date: '2026-02-24', status: 'Ready', downloads: 187 },
    { id: 3, name: 'Pending Approvals', date: '2026-02-23', status: 'Ready', downloads: 98 },
    { id: 4, name: 'Leave Trend Analysis', date: '2026-02-22', status: 'Ready', downloads: 143 },
    { id: 5, name: 'Department Leave Status', date: '2026-02-21', status: 'Ready', downloads: 167 }
  ];

  const departmentStats = [
    { name: 'HR', employees: 12, avgSalary: 65000, attendance: 95.2 },
    { name: 'IT', employees: 85, avgSalary: 82000, attendance: 94.8 },
    { name: 'Finance', employees: 28, avgSalary: 72000, attendance: 96.1 },
    { name: 'Marketing', employees: 45, avgSalary: 60000, attendance: 93.4 },
    { name: 'Operations', employees: 75, avgSalary: 55000, attendance: 92.9 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready':
        return 'bg-teal-100 text-teal-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-3 rounded-lg">
              <BarChart3 className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">HR Reports</h1>
              <p className="text-slate-600 mt-1">Comprehensive HR analytics and reports</p>
            </div>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-slate-100 rounded-full"
          >
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-0 right-0 h-4 w-4 bg-teal-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>

      <NotificationPopup
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-teal-100 p-3 rounded-lg">
                  <Icon className="text-teal-600" size={24} />
                </div>
                <span className="text-green-600 font-semibold text-sm">{card.change}</span>
              </div>
              <h3 className="text-slate-600 font-medium text-sm mb-2">{card.title}</h3>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setSelectedReport('overview')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              selectedReport === 'overview'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Department Statistics
          </button>
          <button
            onClick={() => setSelectedReport('employee')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              selectedReport === 'employee'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Employee Reports
          </button>
          <button
            onClick={() => setSelectedReport('attendance')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              selectedReport === 'attendance'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setSelectedReport('payroll')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              selectedReport === 'payroll'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Payroll
          </button>
          <button
            onClick={() => setSelectedReport('leave')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              selectedReport === 'leave'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Leave
          </button>
        </div>

        {/* Department Statistics */}
        {selectedReport === 'overview' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Employees</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Avg Salary</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Attendance Rate</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentStats.map((dept, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4 font-medium text-slate-800">{dept.name}</td>
                      <td className="py-4 px-4 text-slate-700">{dept.employees}</td>
                      <td className="py-4 px-4 text-slate-700">${dept.avgSalary.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-teal-500 h-2 rounded-full"
                              style={{ width: `${dept.attendance}%` }}
                            ></div>
                          </div>
                          <span className="text-slate-700 font-medium text-sm">{dept.attendance}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-medium">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Employee Reports */}
        {selectedReport === 'employee' && (
          <div className="p-6">
            <div className="space-y-3">
              {employeeReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{report.name}</h4>
                    <p className="text-sm text-slate-500">{report.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium mr-4 ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">{report.downloads} downloads</span>
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance Reports */}
        {selectedReport === 'attendance' && (
          <div className="p-6">
            <div className="space-y-3">
              {attendanceReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{report.name}</h4>
                    <p className="text-sm text-slate-500">{report.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium mr-4 ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">{report.downloads} downloads</span>
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payroll Reports */}
        {selectedReport === 'payroll' && (
          <div className="p-6">
            <div className="space-y-3">
              {payrollReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{report.name}</h4>
                    <p className="text-sm text-slate-500">{report.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium mr-4 ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">{report.downloads} downloads</span>
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leave Reports */}
        {selectedReport === 'leave' && (
          <div className="p-6">
            <div className="space-y-3">
              {leaveReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{report.name}</h4>
                    <p className="text-sm text-slate-500">{report.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium mr-4 ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">{report.downloads} downloads</span>
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
