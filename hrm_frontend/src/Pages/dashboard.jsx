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
} from "lucide-react";
import logo from "../assets/logo.jpg"; // Assuming you have your logo here

// 1. User Context (for easy prop drilling)
const UserContext = createContext();

// 2. Main Dashboard Component
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Overview"); // To control which page is shown
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // 3. Authentication and User Loading
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // If no user, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  // 4. Logout Function
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 5. Loading State
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // 6. Main Layout
  return (
    <UserContext.Provider value={{ user, handleLogout, activeMenu, setActiveMenu }}>
      <div className="flex min-h-screen bg-gray-100">
        
        {/* --- Sidebar (Desktop) --- */}
        <Sidebar isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* --- Mobile Menu Toggle --- */}
        <button
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>

        {/* --- Sidebar (Mobile) --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="relative w-72">
              <Sidebar isOpen={true} setSidebarOpen={() => {}} isMobile={true} setMobileMenuOpen={setMobileMenuOpen} />
            </div>
          </div>
        )}

        {/* --- Main Content Area --- */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarOpen ? "md:ml-72" : "md:ml-20"
          }`}
        >
          <Header />
          
          {/* --- Content based on activeMenu --- */}
          <main className="flex-1 p-6 md:p-8 overflow-auto">
            {renderContent(activeMenu)}
          </main>
        </div>
      </div>
    </UserContext.Provider>
  );
};

// 7. Sidebar Component
const Sidebar = ({ isOpen, setSidebarOpen, isMobile = false, setMobileMenuOpen }) => {
  const { user, handleLogout, activeMenu, setActiveMenu } = useContext(UserContext);

  const navItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "My Profile", icon: User },
    { name: "My Leave", icon: CalendarDays },
    { name: "Tasks", icon: CheckSquare },
    { name: "Settings", icon: Settings },
  ];

  // Role-based links
  const adminItems = [
    { name: "Employees", icon: Users },
    { name: "Leave Mgt.", icon: CheckSquare },
  ];

  const handleMenuClick = (name) => {
    setActiveMenu(name);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed md:relative z-50 h-full bg-gray-900 text-white flex flex-col shadow-lg transition-all duration-300 ${
        isOpen ? "w-72" : "w-20"
      } ${isMobile ? "w-72" : "hidden md:flex"}`}
    >
      {/* --- Logo and Toggle --- */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700">
        <img
          src={logo}
          alt="Logo"
          className={`rounded-full transition-all ${isOpen ? "w-10 h-10" : "w-10 h-10"}`}
        />
        {isOpen && (
          <span className="text-xl font-bold text-white flex-1 ml-3">HRM Portal</span>
        )}
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!isOpen)}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-700"
          >
            {isOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
        )}
        {isMobile && (
           <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-700"
          >
            <X />
          </button>
        )}
      </div>

      {/* --- Navigation Links --- */}
      <ul className="flex-1 py-4 space-y-2">
        {navItems.map((item) => (
          <SidebarItem
            key={item.name}
            item={item}
            isActive={activeMenu === item.name}
            onClick={handleMenuClick}
            isOpen={isOpen}
          />
        ))}

        {/* --- Role-Based Section --- */}
        {(user.role === "admin" || user.role === "hr_manager") && (
          <>
            <li className={`px-4 pt-4 pb-2 text-xs uppercase text-gray-500 ${!isOpen && "text-center"}`}>
              {isOpen ? "Admin" : "---"}
            </li>
            {adminItems.map((item) => (
              <SidebarItem
                key={item.name}
                item={item}
                isActive={activeMenu === item.name}
                onClick={handleMenuClick}
                isOpen={isOpen}
              />
            ))}
          </>
        )}
      </ul>

      {/* --- Logout Section --- */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full p-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors ${!isOpen && "justify-center"}`}
        >
          <LogOut className="w-6 h-6" />
          {isOpen && <span className="ml-4 font-medium">Logout</span>}
        </button>
      </div>
    </nav>
  );
};

// 8. Sidebar Item Component
const SidebarItem = ({ item, isActive, onClick, isOpen }) => {
  return (
    <li className="px-4">
      <Link
        to="#"
        onClick={() => onClick(item.name)}
        className={`flex items-center p-3 rounded-lg transition-colors ${
          isActive
            ? "bg-blue-600 text-white shadow-md"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        } ${!isOpen && "justify-center"}`}
      >
        <item.icon className="w-6 h-6" />
        {isOpen && <span className="ml-4 font-medium">{item.name}</span>}
      </Link>
    </li>
  );
};

// 9. Header Component
const Header = () => {
  const { user, handleLogout, activeMenu } = useContext(UserContext);
  const [isProfileOpen, setProfileOpen] = useState(false);

  return (
    <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-8">
      {/* --- Page Title --- */}
      <h1 className="text-xl font-semibold text-gray-800">{activeMenu}</h1>
      
      {/* --- Header Controls --- */}
      <div className="flex items-center gap-4">
        {/* --- Search --- */}
        <div className="relative hidden md:block">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-64 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* --- Notifications --- */}
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <Bell className="w-6 h-6" />
        </button>
        
        {/* --- Profile Dropdown --- */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${user.fullName}&background=0D8ABC&color=fff&rounded=true&size=40`}
              alt="Avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="hidden md:flex flex-col items-start">
              <span className="font-semibold text-sm text-gray-800">{user.fullName}</span>
              <span className="text-xs text-gray-500">{user.role}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen && "rotate-180"}`} />
          </button>
          
          {/* --- Dropdown Menu --- */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-10">
              <Link
                to="#"
                onClick={() => setProfileOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                My Profile
              </Link>
              <Link
                to="#"
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// 10. Content Renderer Function
const renderContent = (menu) => {
  switch (menu) {
    case "Overview":
      return <OverviewContent />;
    case "My Profile":
      return <ProfileContent />;
    case "Employees":
      return <EmployeeContent />;
    // Add other cases here
    // case "My Leave":
    //   return <LeaveContent />;
    // case "Leave Mgt.":
    //   return <LeaveManagementContent />;
    default:
      return <OverviewContent />;
  }
};

// 11. Placeholder Content Components
const OverviewContent = () => {
  const { user } = useContext(UserContext);
  
  // Example data for widgets
  const stats = [
    { name: "Days Off Taken", value: 8, color: "bg-blue-500" },
    { name: "Remaining Allowance", value: 17, color: "bg-green-500" },
    { name: "Pending Tasks", value: 3, color: "bg-yellow-500" },
  ];

  const announcements = [
    { title: "End-of-Year Performance Reviews", date: "Nov 10" },
    { title: "New Holiday Policy Update", date: "Nov 5" },
    { title: "Office Thanksgiving Potluck", date: "Nov 2" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">
        Welcome back, {user.fullName.split(" ")[0]}!
      </h2>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl shadow-md">
            <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mb-4`}>
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
          </div>
        ))}
      </div>
      
      {/* --- Widgets --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- Announcements --- */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Announcements</h3>
          <ul className="space-y-3">
            {announcements.map((item) => (
              <li key={item.title} className="flex justify-between items-center">
                <span className="text-gray-700">{item.title}</span>
                <span className="text-sm text-gray-500">{item.date}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* --- Quick Actions --- */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium">
              Request Time Off
            </button>
            <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium">
              View Payslip
            </button>
            <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium">
              Update My Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileContent = () => {
  const { user } = useContext(UserContext);
  
  return (
    <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Profile</h2>
      <div className="space-y-4">
        <ProfileField label="Full Name" value={user.fullName} />
        <ProfileField label="Email" value={user.email} />
        <ProfileField label="Employee ID" value={user.employeeId} />
        <ProfileField label="Department" value={user.department} />
        <ProfileField label="Role" value={user.role} />
        <ProfileField label="Address" value={user.address} />
        <ProfileField label="Date of Birth" value={user.dob} />
      </div>
      <button className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Edit Profile
      </button>
    </div>
  );
};

const ProfileField = ({ label, value }) => (
  <div className="border-b border-gray-200 pb-2">
    <label className="block text-sm font-medium text-gray-500">{label}</label>
    <p className="text-md text-gray-900">{value}</p>
  </div>
);

const EmployeeContent = () => {
  // In a real app, you'd fetch this list from your API
  const [employees, setEmployees] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", department: "Engineering", role: "employee" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", department: "Marketing", role: "employee" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", department: "Sales", role: "employee" },
    { id: 4, name: "Admin User", email: "admin@example.com", department: "Engineering", role: "admin" },
  ]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Employee Management</h2>
        <Link 
          to="/createaccount"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add New Employee
        </Link>
      </div>
      
      {/* --- Employee Table --- */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.department}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    emp.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {emp.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-blue-600 hover:text-blue-900 mr-4">Edit</a>
                  <a href="#" className="text-red-600 hover:text-red-900">Delete</a>
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