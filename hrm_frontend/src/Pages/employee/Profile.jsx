import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Save, X, Camera, Lock, Award, Target, User, Mail, Phone, MapPin, Calendar, Briefcase, Building2 } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [profileData, setProfileData] = useState({
    fullName: "John Doe", email: "john.doe@company.com", phone: "+1 234 567 8900",
    address: "123 Main Street, New York, NY 10001", dateOfBirth: "1990-05-15",
    employeeId: "EMP-12345", department: "Engineering", designation: "Senior Developer",
    joiningDate: "2020-01-15", employmentType: "Full-time", reportingManager: "Jane Smith",
    emergencyContact: "+1 234 567 8901", emergencyContactName: "Jane Doe", emergencyContactRelation: "Spouse",
  });

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) { const u = JSON.parse(s); setUser(u); setProfileData(p => ({ ...p, fullName: u.fullName || p.fullName, email: u.email || p.email })); }
    else navigate("/login");
  }, [navigate]);

  const skills = [
    { name: "React.js", level: 90 }, { name: "Node.js", level: 85 },
    { name: "JavaScript", level: 95 }, { name: "TypeScript", level: 80 }, { name: "SQL", level: 75 },
  ];
  const achievements = [
    { title: "Employee of the Month", date: "December 2025", icon: "🏆" },
    { title: "Project Excellence Award", date: "October 2025", icon: "⭐" },
    { title: "Innovation Award", date: "June 2025", icon: "💡" },
  ];

  const Field = ({ label, name, type = "text", readOnly = false }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</label>
      <input type={type} value={profileData[name] || ""} disabled={!isEditing || readOnly}
        onChange={e => setProfileData({ ...profileData, [name]: e.target.value })}
        className={`w-full px-4 py-3 border rounded-xl text-sm ${isEditing && !readOnly ? "border-sky-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500" : "border-gray-100 bg-gray-50"}`} />
    </div>
  );

  if (!user) return null;
  const initials = profileData.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <PageLayout role="employee" activePage="Profile" title="My Profile" subtitle="Manage your personal information"
      actions={
        !isEditing
          ? <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"><Edit size={16} /> Edit Profile</button>
          : <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"><Save size={16} /> Save</button>
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"><X size={16} /> Cancel</button>
            </div>
      }
    >
      <div className="space-y-6">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-sky-400 to-blue-500" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-5 -mt-14">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center text-3xl font-bold text-sky-600 border-4 border-white">{initials}</div>
                <button className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-1.5 rounded-lg hover:bg-sky-600 transition shadow"><Camera size={14} /></button>
              </div>
              <div className="mb-2">
                <h2 className="text-xl font-bold text-gray-900">{profileData.fullName}</h2>
                <p className="text-gray-500 text-sm">{profileData.designation} · {profileData.department}</p>
                <p className="text-xs text-gray-400">ID: {profileData.employeeId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100">
            {[["personal","Personal Info"],["employment","Employment"],["skills","Skills & Awards"]].map(([tab,label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === tab ? "text-sky-600 border-b-2 border-sky-500" : "text-gray-500 hover:text-gray-800"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === "personal" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Full Name" name="fullName" />
                  <Field label="Email" name="email" type="email" />
                  <Field label="Phone" name="phone" type="tel" />
                  <Field label="Date of Birth" name="dateOfBirth" type="date" />
                  <div className="md:col-span-2"><Field label="Address" name="address" /></div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Contact Name" name="emergencyContactName" />
                    <Field label="Phone" name="emergencyContact" type="tel" />
                    <Field label="Relationship" name="emergencyContactRelation" />
                  </div>
                </div>
              </div>
            )}
            {activeTab === "employment" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Employee ID" name="employeeId" readOnly />
                  <Field label="Department" name="department" readOnly />
                  <Field label="Designation" name="designation" readOnly />
                  <Field label="Joining Date" name="joiningDate" readOnly />
                  <Field label="Employment Type" name="employmentType" readOnly />
                  <Field label="Reporting Manager" name="reportingManager" readOnly />
                </div>
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-sky-800">
                  <strong>Note:</strong> Employment details are managed by HR. Contact HR for any changes.
                </div>
              </div>
            )}
            {activeTab === "skills" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-4">Technical Skills</h3>
                  <div className="space-y-4">
                    {skills.map(s => (
                      <div key={s.name}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-gray-700">{s.name}</span>
                          <span className="font-bold text-sky-600">{s.level}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full" style={{ width: `${s.level}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {achievements.map((a, i) => (
                      <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center hover:shadow-sm transition-all">
                        <div className="text-3xl mb-2">{a.icon}</div>
                        <h4 className="font-bold text-gray-800 text-sm mb-1">{a.title}</h4>
                        <p className="text-xs text-gray-500">{a.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4"><Lock size={16} className="text-red-500" /> Security</h3>
          <div className="flex gap-3 flex-wrap">
            <button className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition-colors">Change Password</button>
            <button className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors">Enable 2FA</button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
export default Profile;
