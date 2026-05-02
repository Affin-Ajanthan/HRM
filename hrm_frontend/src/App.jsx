import { Routes, Route } from "react-router-dom";
import Login from "./Pages/login.jsx";
import Hero from "./Pages/hero.jsx";
import About from "./Pages/about.jsx";
import Services from "./Pages/services.jsx";
import Blog from "./Pages/blog.jsx";
import Contact from "./Pages/contact.jsx";
import CreateAccount from "./Pages/createaccount.jsx";
import EmployeeDashboard from "./Pages/employee/Dashboard.jsx";
import HRDashboard from "./Pages/hr/Dashboard.jsx";
import AdminDashboard from "./Pages/admin/Dashboard.jsx";
import Attendance from "./Pages/employee/Attendance.jsx";
import Leave from "./Pages/employee/Leave.jsx";
import Payslip from "./Pages/employee/Payslip.jsx";
import Profile from "./Pages/employee/Profile.jsx";
import HRAttendance from "./Pages/hr/Attendance.jsx";
import HRLeave from "./Pages/hr/Leave.jsx";
import HRPayslip from "./Pages/hr/Payslip.jsx";
import HRProfile from "./Pages/hr/Profile.jsx";
import AdminAttendance from "./Pages/admin/Attendance.jsx";
import AdminLeave from "./Pages/admin/Leave.jsx";
import AdminPayslip from "./Pages/admin/Payslip.jsx";
import AdminProfile from "./Pages/admin/Profile.jsx";
import Companies from "./Pages/admin/Companies.jsx";
import AdminSystemUsers from "./Pages/admin/SystemUser.jsx";
import AdminSystemConfig from "./Pages/admin/SystemConfig.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/createaccount" element={<CreateAccount />} />
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      <Route path="/employee/attendance" element={<Attendance />} />
      <Route path="/employee/leave" element={<Leave />} />
      <Route path="/employee/payslip" element={<Payslip />} />
      <Route path="/employee/profile" element={<Profile />} />
      <Route path="/hr/dashboard" element={<HRDashboard />} />
      <Route path="/hr/attendance" element={<HRAttendance />} />
      <Route path="/hr/leave" element={<HRLeave />} />
      <Route path="/hr/payslip" element={<HRPayslip />} />
      <Route path="/hr/profile" element={<HRProfile />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/attendance" element={<AdminAttendance />} />
      <Route path="/admin/leave" element={<AdminLeave />} />
      <Route path="/admin/payslip" element={<AdminPayslip />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
      <Route path="/admin/companies" element={<Companies />} />
      <Route path="/admin/system-users" element={<AdminSystemUsers />} />
      <Route path="/admin/system-config" element={<AdminSystemConfig />} />
    </Routes>
  );
}

export default App;
