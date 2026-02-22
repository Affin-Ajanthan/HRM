import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Award,
  Target,
  LayoutDashboard,
  Clock,
  CalendarDays,
  DollarSign,
  Bell,
  LogOut,
  Menu,
} from "lucide-react";
import logo from "../../assets/logo.jpg";
import { getRoleLabel } from "../../utils/roleLabel";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setProfileData(prevData => ({
        ...prevData,
        fullName: userData.fullName || prevData.fullName,
        email: userData.email || prevData.email,
      }));
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
    { name: "Overview", icon: LayoutDashboard, path: "/employee/dashboard" },
    { name: "Attendance", icon: Clock, path: "/employee/attendance" },
    { name: "Leave", icon: CalendarDays, path: "/employee/leave" },
    { name: "Payslip", icon: DollarSign, path: "/employee/payslip" },
    { name: "Profile", icon: User, path: "/employee/profile" },
  ];

  const [profileData, setProfileData] = useState({
    fullName: "John Doe",
    email: "john.doe@company.com",
    phone: "+1 234 567 8900",
    address: "123 Main Street, New York, NY 10001",
    dateOfBirth: "1990-05-15",
    gender: "Male",
    employeeId: "EMP-12345",
    department: "Engineering",
    designation: "Senior Developer",
    joiningDate: "2020-01-15",
    employmentType: "Full-time",
    reportingManager: "Jane Smith",
    emergencyContact: "+1 234 567 8901",
    emergencyContactName: "Jane Doe",
    emergencyContactRelation: "Spouse",
  });

  const handleSave = () => {
    setIsEditing(false);
    // Add API call to save profile data
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
  };

  const skills = [
    { name: "React.js", level: 90 },
    { name: "Node.js", level: 85 },
    { name: "JavaScript", level: 95 },
    { name: "TypeScript", level: 80 },
    { name: "SQL", level: 75 },
  ];

  const achievements = [
    { title: "Employee of the Month", date: "December 2025", icon: "🏆" },
    { title: "Project Excellence Award", date: "October 2025", icon: "⭐" },
    { title: "Innovation Award", date: "June 2025", icon: "💡" },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-10 w-10 rounded" />
              <div>
                <h1 className="font-bold text-lg">HRM System</h1>
                <p className="text-xs text-gray-500">Employee Portal</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.name === "Profile"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
            <p className="text-sm text-gray-500">Manage your personal information and settings</p>
          </div>
          <div className="flex items-center gap-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition shadow-lg font-semibold"
              >
                <Edit size={20} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition shadow-lg font-semibold"
                >
                  <Save size={20} />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition shadow-lg font-semibold"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            )}
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                2
              </span>
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">{user.fullName}</p>
                <p className="text-xs text-gray-500">{getRoleLabel(user.role) ?? "Employee"}</p>
              </div>
              <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.fullName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end gap-6 -mt-16">
            <div className="relative">
              <div className="h-32 w-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-blue-600">
                {profileData.fullName.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition shadow-lg">
                <Camera size={20} />
              </button>
            </div>
            <div className="flex-1 mt-4">
              <h2 className="text-2xl font-bold text-gray-800">{profileData.fullName}</h2>
              <p className="text-gray-600">{profileData.designation} • {profileData.department}</p>
              <p className="text-sm text-gray-500 mt-1">Employee ID: {profileData.employeeId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === "personal"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab("employment")}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === "employment"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Employment Details
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === "skills"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Skills & Achievements
          </button>
        </div>

        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User size={18} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg ${
                      isEditing ? "border-blue-300 focus:ring-2 focus:ring-blue-500" : "bg-gray-50"
                    } focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail size={18} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg ${
                      isEditing ? "border-blue-300 focus:ring-2 focus:ring-blue-500" : "bg-gray-50"
                    } focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone size={18} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg ${
                      isEditing ? "border-blue-300 focus:ring-2 focus:ring-blue-500" : "bg-gray-50"
                    } focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={18} />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg ${
                      isEditing ? "border-blue-300 focus:ring-2 focus:ring-blue-500" : "bg-gray-50"
                    } focus:outline-none`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={18} />
                    Address
                  </label>
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    disabled={!isEditing}
                    rows="3"
                    className={`w-full px-4 py-3 border rounded-lg ${
                      isEditing ? "border-blue-300 focus:ring-2 focus:ring-blue-500" : "bg-gray-50"
                    } focus:outline-none`}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={profileData.emergencyContactName}
                      onChange={(e) => setProfileData({ ...profileData, emergencyContactName: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        isEditing ? "border-blue-300 focus:ring-2 focus:ring-blue-500" : "bg-gray-50"
                      } focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.emergencyContact}
                      onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        isEditing ? "border-blue-300 focus:ring-2 focus:ring-blue-500" : "bg-gray-50"
                      } focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={profileData.emergencyContactRelation}
                      onChange={(e) => setProfileData({ ...profileData, emergencyContactRelation: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        isEditing ? "border-blue-300 focus:ring-2 focus:ring-blue-500" : "bg-gray-50"
                      } focus:outline-none`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employment Details Tab */}
          {activeTab === "employment" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase size={18} />
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={profileData.employeeId}
                    disabled
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Building2 size={18} />
                    Department
                  </label>
                  <input
                    type="text"
                    value={profileData.department}
                    disabled
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Target size={18} />
                    Designation
                  </label>
                  <input
                    type="text"
                    value={profileData.designation}
                    disabled
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={18} />
                    Joining Date
                  </label>
                  <input
                    type="text"
                    value={profileData.joiningDate}
                    disabled
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Employment Type
                  </label>
                  <input
                    type="text"
                    value={profileData.employmentType}
                    disabled
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User size={18} />
                    Reporting Manager
                  </label>
                  <input
                    type="text"
                    value={profileData.reportingManager}
                    disabled
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Employment details are managed by HR. Please contact HR department for any changes.
                </p>
              </div>
            </div>
          )}

          {/* Skills & Achievements Tab */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Target className="text-blue-600" size={24} />
                  Technical Skills
                </h3>
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-700">{skill.name}</span>
                        <span className="text-blue-600 font-bold">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="text-yellow-600" size={24} />
                  Achievements & Awards
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300"
                    >
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h4 className="font-bold text-gray-800 mb-2">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Lock className="text-red-600" size={24} />
          Security Settings
        </h3>
        <div className="space-y-3">
          <button className="w-full md:w-auto bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold">
            Change Password
          </button>
          <button className="w-full md:w-auto bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold ml-0 md:ml-3">
            Enable Two-Factor Authentication
          </button>
        </div>
      </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
