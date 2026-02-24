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
  CalendarCheck,
  ShieldCheck,
  Server,
  Database,
  Cpu,
  HardDrive,
  Clock,
  CheckCircle,
  AlertCircle,
  Save,
} from "lucide-react";
import logo from "../../assets/logo.jpg";

const AdminSystemConfig = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("settings");
  const [saved, setSaved] = useState(false);

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Companies", icon: Building2, path: "/admin/companies" },
    { name: "System Users", icon: Users, path: "/admin/system-users" },
    { name: "Attendance", icon: CalendarCheck, path: "/admin/attendance" },
    { name: "Leave", icon: FileText, path: "/admin/leave" },
    { name: "Payroll", icon: Activity, path: "/admin/payslip" },
    { name: "System Config", icon: Settings, path: "/admin/system-config" },
  ];

  // ── Global Settings State ──────────────────────────────────────────────────
  const [leaveSettings, setLeaveSettings] = useState({
    annualLeaveDays: 14,
    sickLeaveDays: 7,
    casualLeaveDays: 5,
    emergencyLeaveDays: 3,
    carryForwardAllowed: true,
    maxCarryForwardDays: 5,
  });

  const [payrollSettings, setPayrollSettings] = useState({
    basicSalaryPercent: 60,
    hraPercent: 20,
    pfPercent: 12,
    taxPercent: 10,
    overtimeMultiplier: 1.5,
    payrollCycleDay: 28,
  });

  // ── Audit Logs State ───────────────────────────────────────────────────────
  const [auditLogs] = useState([
    { id: 1, user: "Alice Johnson", action: "Approved leave request", module: "Leave", timestamp: "2026-02-24 09:15:00", severity: "info" },
    { id: 2, user: "Admin (David Lee)", action: "Created new company: Tech Solutions Ltd", module: "Companies", timestamp: "2026-02-24 08:45:00", severity: "info" },
    { id: 3, user: "Admin (Frank Brown)", action: "Updated payroll formula", module: "System Config", timestamp: "2026-02-23 17:30:00", severity: "warning" },
    { id: 4, user: "Bob Williams", action: "Failed login attempt", module: "Authentication", timestamp: "2026-02-23 14:10:00", severity: "error" },
    { id: 5, user: "Carol Smith", action: "Rejected company application: Blue Sky Retail", module: "Companies", timestamp: "2026-02-23 11:00:00", severity: "info" },
    { id: 6, user: "Admin (David Lee)", action: "Assigned HR Manager role to Alice Johnson", module: "System Users", timestamp: "2026-02-22 16:20:00", severity: "info" },
    { id: 7, user: "System", action: "Automated payroll run completed", module: "Payroll", timestamp: "2026-02-22 00:00:00", severity: "info" },
    { id: 8, user: "Admin (Frank Brown)", action: "Modified default leave policy", module: "System Config", timestamp: "2026-02-21 10:05:00", severity: "warning" },
  ]);

  // ── System Health ──────────────────────────────────────────────────────────
  const health = {
    serverUptime: 99.9,
    databaseLoad: 45,
    apiResponse: 78,
    storage: 62,
    activeConnections: 124,
    errorRate: 0.3,
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role !== "ADMIN") {
        navigate("/unauthorized");
        return;
      }
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

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const severityStyle = (s) => {
    if (s === "error") return "bg-red-100 text-red-700";
    if (s === "warning") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  const barColor = (val) => {
    if (val >= 90) return "bg-green-500";
    if (val >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-10 w-10 rounded" />
            <div>
              <h1 className="font-bold text-lg">HRM System</h1>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.fullName?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                item.name === "System Config"
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-6 border-b">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Settings className="text-purple-600" size={32} />
              </div>
              System Configuration & Monitoring
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage global settings, monitor system health, and review audit logs
            </p>
          </div>
        </header>

        <div className="p-6">
          {/* Tab Bar */}
          <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm w-fit">
            {[
              { key: "settings", label: "Global Settings", icon: Settings },
              { key: "health", label: "System Health", icon: Activity },
              { key: "audit", label: "Audit Logs", icon: ShieldCheck },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── GLOBAL SETTINGS TAB ─────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leave Policy */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <FileText className="text-purple-600" size={20} />
                  </div>
                  Default Leave Policy
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Annual Leave (days)", key: "annualLeaveDays" },
                    { label: "Sick Leave (days)", key: "sickLeaveDays" },
                    { label: "Casual Leave (days)", key: "casualLeaveDays" },
                    { label: "Emergency Leave (days)", key: "emergencyLeaveDays" },
                    { label: "Max Carry-Forward Days", key: "maxCarryForwardDays" },
                  ].map(({ label, key }) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <label className="text-sm text-gray-600 w-48">{label}</label>
                      <input
                        type="number"
                        min={0}
                        value={leaveSettings[key]}
                        onChange={(e) =>
                          setLeaveSettings({ ...leaveSettings, [key]: Number(e.target.value) })
                        }
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                      />
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-sm text-gray-600 w-48">Allow Carry-Forward</label>
                    <button
                      onClick={() =>
                        setLeaveSettings({
                          ...leaveSettings,
                          carryForwardAllowed: !leaveSettings.carryForwardAllowed,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        leaveSettings.carryForwardAllowed ? "bg-purple-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          leaveSettings.carryForwardAllowed ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Payroll Formula */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <Activity className="text-pink-600" size={20} />
                  </div>
                  Payroll Formula
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Basic Salary (%)", key: "basicSalaryPercent" },
                    { label: "HRA (%)", key: "hraPercent" },
                    { label: "PF Deduction (%)", key: "pfPercent" },
                    { label: "Tax Deduction (%)", key: "taxPercent" },
                    { label: "Overtime Multiplier (x)", key: "overtimeMultiplier", step: 0.1 },
                    { label: "Payroll Cycle Day", key: "payrollCycleDay" },
                  ].map(({ label, key, step }) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <label className="text-sm text-gray-600 w-48">{label}</label>
                      <input
                        type="number"
                        min={0}
                        step={step || 1}
                        value={payrollSettings[key]}
                        onChange={(e) =>
                          setPayrollSettings({ ...payrollSettings, [key]: Number(e.target.value) })
                        }
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="lg:col-span-2 flex items-center gap-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold shadow-lg"
                >
                  <Save size={18} />
                  Save Settings
                </button>
                {saved && (
                  <span className="flex items-center gap-2 text-green-600 font-semibold animate-pulse">
                    <CheckCircle size={18} /> Settings saved successfully!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── SYSTEM HEALTH TAB ───────────────────────────────────────────── */}
          {activeTab === "health" && (
            <div className="space-y-6">
              {/* Health Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-purple-100 text-sm">Server Uptime</p>
                    <Server size={24} />
                  </div>
                  <p className="text-4xl font-bold">{health.serverUptime}%</p>
                  <p className="text-sm text-purple-100 mt-1">Last 30 days</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-green-100 text-sm">Active Connections</p>
                    <Users size={24} />
                  </div>
                  <p className="text-4xl font-bold">{health.activeConnections}</p>
                  <p className="text-sm text-green-100 mt-1">Right now</p>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-pink-100 text-sm">Error Rate</p>
                    <AlertCircle size={24} />
                  </div>
                  <p className="text-4xl font-bold">{health.errorRate}%</p>
                  <p className="text-sm text-pink-100 mt-1">Last 24 hours</p>
                </div>
              </div>

              {/* Performance Bars */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Activity className="text-purple-600" size={20} />
                  </div>
                  Performance Metrics
                </h3>
                <div className="space-y-5">
                  {[
                    { label: "Server Uptime", value: health.serverUptime, icon: Server },
                    { label: "Database Load", value: health.databaseLoad, icon: Database },
                    { label: "API Response Rate", value: health.apiResponse, icon: Cpu },
                    { label: "Storage Used", value: health.storage, icon: HardDrive },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-sm text-gray-600">
                          <Icon size={16} className="text-purple-500" />
                          {label}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">{value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`${barColor(value)} h-2.5 rounded-full transition-all duration-500`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── AUDIT LOGS TAB ──────────────────────────────────────────────── */}
          {activeTab === "audit" && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <ShieldCheck className="text-purple-600" size={22} />
                  System-Wide Audit Logs
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {auditLogs.length} entries
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Module</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Timestamp</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {auditLogs.map((log, index) => (
                      <tr
                        key={log.id}
                        className={`hover:bg-purple-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{log.user}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{log.action}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                            {log.module}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={14} className="text-gray-400" />
                          {log.timestamp}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${severityStyle(log.severity)}`}>
                            {log.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminSystemConfig;