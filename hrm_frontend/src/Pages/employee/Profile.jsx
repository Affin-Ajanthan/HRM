import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Save, X, Camera, Lock, Award, Target, User, Mail, Phone, MapPin, Calendar, Briefcase, Building2, ShieldCheck, KeyRound, UserCheck, Heart } from "lucide-react";
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
  const SKILL_BARS = ["bg-employee-500", "bg-emerald-500", "bg-amber-500", "bg-employee-700", "bg-slate-500"];
  const achievements = [
    { title: "Employee of the Month",    date: "December 2025", icon: <Award size={20} />,  tone: "bg-amber-50 text-amber-600",       edge: "border-t-amber-500" },
    { title: "Project Excellence Award", date: "October 2025",  icon: <Target size={20} />, tone: "bg-orange-50 text-orange-600", edge: "border-t-orange-500" },
    { title: "Innovation Award",         date: "June 2025",     icon: <Award size={20} />,  tone: "bg-emerald-50 text-emerald-600",   edge: "border-t-emerald-600" },
  ];

  // Small coloured icon badge in front of each section heading
  const SectionTitle = ({ icon: Icon, tone, children }) => (
    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
      <span className={`${tone} p-1.5 rounded-md`}><Icon size={16} /></span> {children}
    </h3>
  );

  const Field = ({ label, name, type = "text", readOnly = false, icon: Icon, tone = "text-slate-400" }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${tone}`} />}
        <input type={type} value={profileData[name] || ""} disabled={!isEditing || readOnly}
          onChange={e => setProfileData({ ...profileData, [name]: e.target.value })}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 border rounded-lg text-sm text-slate-800 ${isEditing && !readOnly ? "border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-employee-500 focus:border-employee-500" : "border-employee-100 bg-white/70"}`} />
      </div>
    </div>
  );

  const quickInfo = [
    { label: "Department",        value: profileData.department,       icon: Building2, tone: "bg-emerald-50 text-emerald-600",   edge: "border-l-emerald-500" },
    { label: "Employment Type",   value: profileData.employmentType,   icon: Briefcase, tone: "bg-teal-50 text-teal-600",         edge: "border-l-teal-500" },
    { label: "Joined",            value: profileData.joiningDate,      icon: Calendar,  tone: "bg-amber-50 text-amber-600",       edge: "border-l-amber-500" },
    { label: "Reporting Manager", value: profileData.reportingManager, icon: UserCheck, tone: "bg-violet-50 text-violet-600",     edge: "border-l-violet-500" },
  ];

  if (!user) return null;
  const initials = profileData.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <PageLayout role="employee" activePage="Profile" title="My Profile" subtitle="Manage your personal information"
      actions={
        !isEditing
          ? <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-employee-600 hover:bg-employee-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"><Edit size={16} /> Edit Profile</button>
          : <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-employee-600 hover:bg-employee-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"><Save size={16} /> Save</button>
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"><X size={16} /> Cancel</button>
            </div>
      }
    >
      <div className="space-y-6">
        {/* Header card */}
        <div className="bg-gradient-to-br from-white to-employee-50 rounded-xl border border-employee-100 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-employee-900 via-employee-700 to-employee-500 relative overflow-hidden">
            <div className="absolute -top-10 right-24 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 right-0 w-56 h-56 rounded-full bg-white/5" />
            <div className="absolute top-6 left-1/2 w-24 h-24 rounded-full bg-emerald-400/10" />
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-end gap-5 -mt-12">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-employee-400 to-employee-700 shadow-md flex items-center justify-center text-3xl font-bold text-white border-4 border-white">{initials}</div>
                <button className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1.5 rounded-lg hover:bg-amber-600 transition shadow"><Camera size={14} /></button>
              </div>
              <div className="mb-2">
                <h2 className="text-xl font-bold text-slate-900">{profileData.fullName}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="flex items-center gap-1.5 bg-employee-50 text-employee-700 ring-1 ring-employee-100 px-2.5 py-1 rounded-md text-xs font-medium"><Briefcase size={13} /> {profileData.designation}</span>
                  <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 ring-1 ring-slate-200 px-2.5 py-1 rounded-md text-xs font-medium"><User size={13} /> {profileData.employeeId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickInfo.map(q => (
            <div key={q.label} className={`bg-gradient-to-br from-white to-employee-50 border border-employee-100 border-l-4 ${q.edge} rounded-xl p-4 shadow-sm flex items-center gap-3`}>
              <div className={`${q.tone} p-2.5 rounded-lg`}><q.icon size={20} /></div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">{q.label}</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{q.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-gradient-to-b from-white to-employee-50 rounded-xl border border-employee-100 shadow-sm">
          <div className="flex border-b border-employee-100">
            {[["personal","Personal Info",User,"text-teal-500"],["employment","Employment",Briefcase,"text-emerald-500"],["skills","Skills & Awards",Award,"text-amber-500"]].map(([tab,label,TabIcon,tone]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === tab ? "text-employee-700 border-b-2 border-employee-600 bg-employee-50/60" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}>
                <TabIcon size={16} className={tone} /> {label}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === "personal" && (
              <div className="space-y-5">
                <SectionTitle icon={User} tone="bg-teal-50 text-teal-600">Personal Details</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Full Name" name="fullName" icon={User} tone="text-teal-500" />
                  <Field label="Email" name="email" type="email" icon={Mail} tone="text-indigo-500" />
                  <Field label="Phone" name="phone" type="tel" icon={Phone} tone="text-emerald-500" />
                  <Field label="Date of Birth" name="dateOfBirth" type="date" icon={Calendar} tone="text-amber-500" />
                  <div className="md:col-span-2"><Field label="Address" name="address" icon={MapPin} tone="text-rose-500" /></div>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-5">
                  <SectionTitle icon={Phone} tone="bg-amber-100 text-amber-700">Emergency Contact</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Contact Name" name="emergencyContactName" icon={User} tone="text-amber-600" />
                    <Field label="Phone" name="emergencyContact" type="tel" icon={Phone} tone="text-amber-600" />
                    <Field label="Relationship" name="emergencyContactRelation" icon={Heart} tone="text-amber-600" />
                  </div>
                </div>
              </div>
            )}
            {activeTab === "employment" && (
              <div className="space-y-5">
                <SectionTitle icon={Briefcase} tone="bg-emerald-50 text-emerald-600">Employment Details</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Employee ID" name="employeeId" readOnly icon={User} tone="text-slate-500" />
                  <Field label="Department" name="department" readOnly icon={Building2} tone="text-emerald-500" />
                  <Field label="Designation" name="designation" readOnly icon={Briefcase} tone="text-teal-500" />
                  <Field label="Joining Date" name="joiningDate" readOnly icon={Calendar} tone="text-amber-500" />
                  <Field label="Employment Type" name="employmentType" readOnly icon={Briefcase} tone="text-emerald-500" />
                  <Field label="Reporting Manager" name="reportingManager" readOnly icon={UserCheck} tone="text-violet-500" />
                </div>
                <div className="bg-employee-50 border-l-4 border-employee-500 rounded-lg p-4 text-sm text-slate-700">
                  <strong>Note:</strong> Employment details are managed by HR. Contact HR for any changes.
                </div>
              </div>
            )}
            {activeTab === "skills" && (
              <div className="space-y-6">
                <div>
                  <SectionTitle icon={Target} tone="bg-orange-50 text-orange-600">Technical Skills</SectionTitle>
                  <div className="space-y-4">
                    {skills.map((s, i) => (
                      <div key={s.name}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-slate-600">{s.name}</span>
                          <span className="font-semibold text-slate-800">{s.level}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${SKILL_BARS[i % SKILL_BARS.length]} rounded-full`} style={{ width: `${s.level}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-5">
                  <SectionTitle icon={Award} tone="bg-amber-50 text-amber-600">Achievements</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {achievements.map((a, i) => (
                      <div key={i} className={`bg-gradient-to-b from-white to-employee-50 border border-employee-100 border-t-4 ${a.edge} rounded-lg p-5 text-center hover:shadow-sm transition-all`}>
                        <div className={`${a.tone} w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3`}>{a.icon}</div>
                        <h4 className="font-semibold text-slate-800 text-sm mb-1">{a.title}</h4>
                        <p className="text-xs text-slate-500">{a.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="bg-gradient-to-br from-white to-employee-50 rounded-xl border border-employee-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3 mb-4"><span className="bg-rose-50 p-2 rounded-lg"><Lock size={20} className="text-rose-500" /></span> Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-employee-50/60 border border-employee-100 rounded-lg p-4 flex items-center gap-4">
              <div className="bg-rose-100 text-rose-600 p-2.5 rounded-lg"><KeyRound size={20} /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Password</p>
                <p className="text-xs text-slate-500">Change your login password regularly</p>
              </div>
              <button className="px-4 py-2 bg-employee-600 hover:bg-employee-700 text-white rounded-lg text-sm font-semibold transition-colors">Change Password</button>
            </div>
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-4 flex items-center gap-4">
              <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-lg"><ShieldCheck size={20} /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Add an extra layer of security</p>
              </div>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors">Enable 2FA</button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
export default Profile;
