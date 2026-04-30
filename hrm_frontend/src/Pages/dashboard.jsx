import React, { useState, useEffect, createContext, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  CalendarDays,
  CheckSquare,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Briefcase,
} from "lucide-react";
import logo from "../assets/logo.jpg";
import {
  OverviewContent,
  TasksContent,
  LeaveContent,
  ProfileContent,
  SettingsContent,
  LeaveManagementContent,
} from "./DashboardPages";
import AdminDashboard    from "./AdminDashboard";
import HRDashboard       from "./HRDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

// ── Context ───────────────────────────────────────────────
export const UserContext = createContext();

// ── Role colour helpers ───────────────────────────────────
const roleGradient = (role) => {
  if (role === 'ADMIN')      return 'from-indigo-500 to-violet-600';
  if (role === 'HR_MANAGER') return 'from-teal-400   to-emerald-500';
  return                            'from-sky-400    to-blue-500';
};

const roleLabel = (role) => {
  if (role === 'ADMIN')      return 'Administrator';
  if (role === 'HR_MANAGER') return 'HR Manager';
  return 'Employee';
};

// ── Main Dashboard ────────────────────────────────────────
const Dashboard = () => {
  const [user, setUser]         = useState(null);
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    else navigate("/login");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, handleLogout, activeMenu, setActiveMenu }}>
      <div className="flex min-h-screen bg-gray-50">

        {/* Desktop Sidebar */}
        <Sidebar isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-navy-900 text-white rounded-xl shadow-lg"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-72 h-full">
              <Sidebar isOpen={true} setSidebarOpen={() => {}} isMobile setMobileMenuOpen={setMobileMenuOpen} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
          <Header />
          <main className="flex-1 p-5 md:p-7 overflow-auto">
            {renderContent(activeMenu, user, setActiveMenu)}
          </main>
        </div>
      </div>
    </UserContext.Provider>
  );
};

// ── Sidebar ───────────────────────────────────────────────
const Sidebar = ({ isOpen, setSidebarOpen, isMobile = false, setMobileMenuOpen }) => {
  const { user, handleLogout, activeMenu, setActiveMenu } = useContext(UserContext);

  const coreItems = [
    { name: "Overview",    icon: LayoutDashboard },
    { name: "My Profile",  icon: User },
    { name: "My Leave",    icon: CalendarDays },
    { name: "Tasks",       icon: CheckSquare },
    { name: "Settings",    icon: Settings },
  ];

  const adminItems = [
    { name: "Employees",  icon: Users },
    { name: "Leave Mgt.", icon: Briefcase },
  ];

  const handleClick = (name) => {
    setActiveMenu(name);
    if (isMobile) setMobileMenuOpen(false);
  };

  const initials = user?.fullName
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <nav
      className={`
        flex flex-col transition-all duration-300 shadow-2xl
        ${isMobile
          ? 'fixed top-0 left-0 z-50 h-screen w-72'
          : `fixed top-0 left-0 h-screen ${isOpen ? 'w-72' : 'w-20'} hidden md:flex`
        }
      `}
      style={{ background: 'linear-gradient(180deg, #0a1120 0%, #0f172a 100%)' }}
    >
      {/* Logo row */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <img src={logo} alt="Logo" className="w-9 h-9 rounded-xl flex-shrink-0 shadow-md" />
        {isOpen && <span className="text-white text-lg font-bold tracking-tight">HRM Portal</span>}
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!isOpen)}
            className="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        {isMobile && (
          <button onClick={() => setMobileMenuOpen(false)} className="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <ul className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
        {coreItems.map(item => (
          <SidebarItem key={item.name} item={item} isActive={activeMenu === item.name} onClick={handleClick} isOpen={isOpen} />
        ))}

        {(user.role === 'ADMIN' || user.role === 'HR_MANAGER') && (
          <>
            {isOpen && (
              <li className="pt-4 pb-1 px-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-600">Management</span>
              </li>
            )}
            {!isOpen && <li className="border-t border-white/10 mx-2 my-3" />}
            {adminItems.map(item => (
              <SidebarItem key={item.name} item={item} isActive={activeMenu === item.name} onClick={handleClick} isOpen={isOpen} />
            ))}
          </>
        )}
      </ul>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-3 space-y-2">
        {isOpen && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleGradient(user.role)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md`}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.fullName}</p>
              <p className="text-gray-500 text-xs truncate">{roleLabel(user.role)}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-red-500/20 transition-all duration-200 ${!isOpen && 'justify-center'}`}
        >
          <LogOut size={18} />
          {isOpen && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </nav>
  );
};

// ── Sidebar Item ──────────────────────────────────────────
const SidebarItem = ({ item, isActive, onClick, isOpen }) => (
  <li>
    <button
      onClick={() => onClick(item.name)}
      className={`nav-item w-full ${isActive ? 'nav-item-active' : ''} ${!isOpen ? 'justify-center px-0' : ''}`}
    >
      <item.icon size={18} className="flex-shrink-0" />
      {isOpen && <span>{item.name}</span>}
    </button>
  </li>
);

// ── Header ────────────────────────────────────────────────
const Header = () => {
  const { user, handleLogout, activeMenu, setActiveMenu } = useContext(UserContext);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const today = new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });

  return (
    <header className="flex-shrink-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-5 md:px-7 shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{activeMenu}</h1>
        <p className="text-xs text-gray-400 hidden md:block">{today}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search…"
            className="pl-9 pr-4 py-2 w-52 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleGradient(user.role)} flex items-center justify-center text-white text-xs font-bold shadow`}>
              {user.fullName?.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-800 leading-tight">{user.fullName}</span>
              <span className="text-xs text-gray-400">{roleLabel(user.role)}</span>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen && 'rotate-180'}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-fade-in">
              <button
                onClick={() => { setActiveMenu('My Profile'); setProfileOpen(false); }}
                className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                👤 My Profile
              </button>
              <button
                onClick={() => { setActiveMenu('Settings'); setProfileOpen(false); }}
                className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ⚙️ Settings
              </button>
              <hr className="border-gray-100" />
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// ── Content Router ────────────────────────────────────────
const renderContent = (menu, user, setActiveMenu) => {
  if (menu === "Overview") {
    if (user.role === "ADMIN")      return <AdminDashboard userData={user} />;
    if (user.role === "HR_MANAGER") return <HRDashboard userData={user} />;
    return <EmployeeDashboard userData={user} />;
  }
  switch (menu) {
    case "My Profile": return <ProfileContent user={user} />;
    case "My Leave":   return <LeaveContent />;
    case "Tasks":      return <TasksContent />;
    case "Settings":   return <SettingsContent />;
    case "Employees":  return <EmployeeContent />;
    case "Leave Mgt.": return <LeaveManagementContent />;
    default:
      if (user.role === "ADMIN")      return <AdminDashboard userData={user} />;
      if (user.role === "HR_MANAGER") return <HRDashboard userData={user} />;
      return <EmployeeDashboard userData={user} />;
  }
};

// ── Employee Management Table ─────────────────────────────
const EmployeeContent = () => {
  const employees = [
    { id:1, name:"Priya Sharma",  email:"priya@affin.com",  dept:"Engineering", role:"EMPLOYEE" },
    { id:2, name:"David Lim",     email:"david@affin.com",  dept:"Product",     role:"EMPLOYEE" },
    { id:3, name:"Aisha Patel",   email:"aisha@affin.com",  dept:"Design",      role:"HR_MANAGER" },
    { id:4, name:"Tom Walker",    email:"tom@affin.com",    dept:"Analytics",   role:"EMPLOYEE" },
    { id:5, name:"Chloe Martin",  email:"chloe@affin.com",  dept:"HR",          role:"ADMIN" },
  ];

  const roleColors = {
    ADMIN:      'bg-indigo-100 text-indigo-700',
    HR_MANAGER: 'bg-teal-100 text-teal-700',
    EMPLOYEE:   'bg-gray-100 text-gray-600',
  };

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title"><span>👥</span> Employee Management</h2>
        <Link to="/createaccount" className="btn-primary text-sm">+ Add Employee</Link>
      </div>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Department</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map(e => (
              <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                <td className="px-4 py-3 text-gray-500">{e.email}</td>
                <td className="px-4 py-3 text-gray-500">{e.dept}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[e.role]}`}>{e.role}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-primary-600 hover:text-primary-800 font-medium mr-4 text-xs">Edit</button>
                  <button className="text-red-500 hover:text-red-700 font-medium text-xs">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;