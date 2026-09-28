import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Save, X, Camera, Lock, Award, User, Mail, Phone, MapPin, Calendar, Briefcase, Building2, ShieldCheck, KeyRound, UserCheck, Heart } from "lucide-react";
import { PageLayout } from "../../components/PageLayout";
import { EmpButton, SummaryCard } from "../../components/EmployeeUI";
import { EMP_GRADIENT, CARD_TONES } from "../../components/employeeTheme";
import { employeeApi } from "../../services/api";

// Fields the employee may change themselves; everything else is managed by HR
const EDITABLE = ["phone", "address", "dob", "gender", "emergencyContactName", "emergencyContactPhone", "emergencyContactRelation"];

const GENDERS = [["", "Not specified"], ["MALE", "Male"], ["FEMALE", "Female"], ["OTHER", "Other"]];

// API profile (Employee_Backend EmployeeProfileDTO) -> form values; nulls become "" so inputs stay controlled
const toForm = (p) => ({
  fullName: p.fullName || "", email: p.email || "", phone: p.phone || "", address: p.address || "",
  dob: p.dob || "", gender: p.gender || "", nic: p.nic || "",
  employeeId: p.employeeId || "", department: p.departmentName || "", designation: p.designation || "",
  joiningDate: p.joiningDate || "", employmentType: p.employmentType || "", reportingManager: p.reportingManagerName || "",
  emergencyContactName: p.emergencyContactName || "", emergencyContactPhone: p.emergencyContactPhone || "",
  emergencyContactRelation: p.emergencyContactRelation || "",
});

// Declared outside the page so inputs keep focus while typing (a component defined inside would remount on every keystroke)
const Field = ({ data, editing, onChange, label, name, type = "text", readOnly = false, icon: Icon, tone = "text-slate-400", options }) => {
  const locked = !editing || readOnly;
  const cls = `w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 border rounded-lg text-sm text-slate-800 ${!locked ? "border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-employee-500 focus:border-employee-500" : "border-employee-100 bg-white/70"}`;
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${tone}`} />}
        {options ? (
          <select value={data[name] || ""} disabled={locked} onChange={e => onChange(name, e.target.value)} className={cls}>
            {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ) : (
          <input type={type} value={data[name] || ""} disabled={locked} placeholder={locked ? "—" : ""}
            max={type === "date" ? new Date().toISOString().split("T")[0] : undefined}
            onChange={e => onChange(name, e.target.value)} className={cls} />
        )}
      </div>
    </div>
  );
};


const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [profileData, setProfileData] = useState(toForm({}));
  const [savedData, setSavedData] = useState(toForm({}));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const flash = (text) => { setMessage(text); setTimeout(() => setMessage(""), 3500); };
  // Server errors come back as "400: <reason>"; show just the reason
  const errorText = (e, fallback) => (e?.message || fallback).replace(/^\d{3}:\s*/, "");

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (!s) { navigate("/login"); return; }
    setUser(JSON.parse(s));
    (async () => {
      try {
        const res = await employeeApi.getProfile();
        const form = toForm(res.data || {});
        setProfileData(form);
        setSavedData(form);
      } catch (e) {
        flash("✗ " + errorText(e, "Failed to load your profile"));
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const setField = (name, value) => setProfileData(p => ({ ...p, [name]: value }));

  const handleCancel = () => { setProfileData(savedData); setIsEditing(false); };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = Object.fromEntries(EDITABLE.map(k => [k, profileData[k] || null]));
      const res = await employeeApi.updateProfile(payload);
      const form = toForm(res.data || {});
      setProfileData(form);
      setSavedData(form);
      setIsEditing(false);
      flash("✓ Profile updated");
    } catch (e) {
      flash("✗ " + errorText(e, "Failed to save your profile"));
    } finally {
      setSaving(false);
    }
  };


  // Small coloured icon badge in front of each section heading
  const SectionTitle = ({ icon: Icon, tone, children }) => (
    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
      <span className={`${tone} p-1.5 rounded-md`}><Icon size={16} /></span> {children}
    </h3>
  );

  const quickInfo = [
    { label: "Department",        value: profileData.department,       icon: Building2, tone: CARD_TONES.blue },
    { label: "Employment Type",   value: profileData.employmentType,   icon: Briefcase, tone: CARD_TONES.green },
    { label: "Joined",            value: profileData.joiningDate,      icon: Calendar,  tone: CARD_TONES.yellow },
    { label: "Reporting Manager", value: profileData.reportingManager, icon: UserCheck, tone: CARD_TONES.purple },
  ];

  if (!user) return null;
  const initials = (profileData.fullName || "?").split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <PageLayout role="employee" activePage="Profile" title="My Profile" subtitle="Manage your personal information"
      actions={
        !isEditing
          ? <EmpButton onClick={() => setIsEditing(true)} disabled={loading}><Edit size={16} /> Edit Profile</EmpButton>
          : <div className="flex gap-2">
              <EmpButton onClick={handleSave} disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save"}</EmpButton>
              <EmpButton variant="secondary" onClick={handleCancel} disabled={saving}><X size={16} /> Cancel</EmpButton>
            </div>
      }
    >
      <div className="space-y-6">
        {message && (
          <div className={`p-4 rounded-lg text-white ${message.startsWith("✓") ? "bg-green-500" : "bg-red-500"}`}>{message}</div>
        )}

        {/* Header card */}
        <div className="bg-gradient-to-br from-white to-employee-50 rounded-xl border border-employee-100 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-employee-900 via-employee-700 to-employee-500 relative overflow-hidden">
            <div className="absolute -top-10 right-24 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 right-0 w-56 h-56 rounded-full bg-white/5" />
            <div className="absolute top-6 left-1/2 w-24 h-24 rounded-full bg-sky-300/10" />
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-end gap-5 -mt-12">
              <div className="relative flex-shrink-0">
                <div className={`w-24 h-24 rounded-xl ${EMP_GRADIENT} shadow-md flex items-center justify-center text-3xl font-bold text-white border-4 border-white`}>{initials}</div>
                <button className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition shadow"><Camera size={14} /></button>
              </div>
              <div className="mb-2">
                <h2 className="text-xl font-bold text-slate-900">{loading ? "Loading profile..." : profileData.fullName}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="flex items-center gap-1.5 bg-employee-50 text-employee-700 ring-1 ring-employee-100 px-2.5 py-1 rounded-md text-xs font-medium"><Briefcase size={13} /> {profileData.designation || "—"}</span>
                  <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 ring-1 ring-slate-200 px-2.5 py-1 rounded-md text-xs font-medium"><User size={13} /> {profileData.employeeId || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickInfo.map(q => (
            <SummaryCard key={q.label} icon={<q.icon size={20} />} title={q.label} value={q.value || "—"} className={q.tone} />
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
                  <Field data={profileData} editing={isEditing} onChange={setField} label="Full Name" name="fullName" readOnly icon={User} tone="text-teal-500" />
                  <Field data={profileData} editing={isEditing} onChange={setField} label="Email" name="email" type="email" readOnly icon={Mail} tone="text-indigo-500" />
                  <Field data={profileData} editing={isEditing} onChange={setField} label="Phone" name="phone" type="tel" icon={Phone} tone="text-emerald-500" />
                  <Field data={profileData} editing={isEditing} onChange={setField} label="Date of Birth" name="dob" type="date" icon={Calendar} tone="text-amber-500" />
                  <Field data={profileData} editing={isEditing} onChange={setField} label="Gender" name="gender" options={GENDERS} icon={User} tone="text-violet-500" />
                  <Field data={profileData} editing={isEditing} onChange={setField} label="NIC" name="nic" readOnly icon={ShieldCheck} tone="text-slate-500" />
                  <div className="md:col-span-2"><Field data={profileData} editing={isEditing} onChange={setField} label="Address" name="address" icon={MapPin} tone="text-rose-500" /></div>
                </div>
                <div className="bg-sky-50/50 border border-sky-100 rounded-lg p-5">
                  <SectionTitle icon={Phone} tone="bg-amber-100 text-amber-700">Emergency Contact</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field data={profileData} editing={isEditing} onChange={setField} label="Contact Name" name="emergencyContactName" icon={User} tone="text-amber-600" />
                    <Field data={profileData} editing={isEditing} onChange={setField} label="Phone" name="emergencyContactPhone" type="tel" icon={Phone} tone="text-amber-600" />
                    <Field data={profileData} editing={isEditing} onChange={setField} label="Relationship" name="emergencyContactRelation" icon={Heart} tone="text-rose-500" />
                  </div>
                </div>
              </div>
            )}
            {activeTab === "employment" && (
              <div className="space-y-5">
                <SectionTitle icon={Briefcase} tone="bg-emerald-50 text-emerald-600">Employment Details</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field data={profileData} editing={isEditing} onChange={setField} label="Employee ID" name="employeeId" readOnly icon={User} tone="text-slate-500" />
                  <Field data={profileData} editing={isEditing} onChange={setField} label="Department" name="department" readOnly icon={Building2} tone="text-emerald-500" />
                  <Field data={profileData} editing={isEditing} onChange={setField} label="Designation" name="designation" readOnly icon={Briefcase} tone="text-teal-500" />
                  <Field data={profileData} editing={isEditing} onChange={setField} label="Joining Date" name="joiningDate" readOnly icon={Calendar} tone="text-amber-500" />
                  <Field data={profileData} editing={isEditing} onChange={setField} label="Employment Type" name="employmentType" readOnly icon={Briefcase} tone="text-blue-500" />
                  <Field data={profileData} editing={isEditing} onChange={setField} label="Reporting Manager" name="reportingManager" readOnly icon={UserCheck} tone="text-violet-500" />
                </div>
                <div className="bg-employee-50 border-l-4 border-employee-500 rounded-lg p-4 text-sm text-slate-700">
                  <strong>Note:</strong> Your name, email, NIC and employment details are managed by HR. Contact HR for any changes.
                </div>
              </div>
            )}
            {activeTab === "skills" && (
              <div className="text-center py-10">
                <div className="bg-amber-50 text-amber-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"><Award size={22} /></div>
                <p className="text-sm font-semibold text-slate-700">No skills or awards recorded yet</p>
                <p className="text-xs text-slate-500 mt-1">They will appear here once HR adds them to your record.</p>
              </div>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="bg-gradient-to-br from-white to-employee-50 rounded-xl border border-employee-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3 mb-4"><span className="bg-rose-50 text-rose-500 p-2 rounded-lg"><Lock size={20} /></span> Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-employee-50/60 border border-employee-100 rounded-lg p-4 flex items-center gap-4">
              <div className="bg-rose-100 text-rose-600 p-2.5 rounded-lg"><KeyRound size={20} /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Password</p>
                <p className="text-xs text-slate-500">Change your login password regularly</p>
              </div>
              <EmpButton>Change Password</EmpButton>
            </div>
            <div className="bg-employee-50/60 border border-employee-100 rounded-lg p-4 flex items-center gap-4">
              <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-lg"><ShieldCheck size={20} /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Add an extra layer of security</p>
              </div>
              <EmpButton>Enable 2FA</EmpButton>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
export default Profile;
