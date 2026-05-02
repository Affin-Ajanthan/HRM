import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, LogIn, Shield, Users, BarChart3 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import logo from "../assets/logo.jpg";
import axios from "axios";

const Login = () => {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPwd, setShowPwd]       = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5004/api/auth/login", {
        email: email.trim(),
        password,
      });

      const { data } = response.data;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data));

      if      (data.role === "ADMIN")      navigate("/admin/dashboard");
      else if (data.role === "HR_MANAGER") navigate("/hr/dashboard");
      else if (data.role === "EMPLOYEE")   navigate("/employee/dashboard");
      else                                 navigate("/dashboard");

    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        setErrorMessage(error.response.data.message || "Invalid email or password. Please try again.");
      } else if (error.request) {
        setErrorMessage("Cannot connect to server. Please ensure the backend is running.");
      } else {
        setErrorMessage("An error occurred: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── Left Art Panel ── */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 45%, #7c3aed 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #a5b4fc, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, #c4b5fd, transparent)', transform: 'translate(-30%, 30%)' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5"
             style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-xl shadow-lg" />
          <span className="text-xl font-bold tracking-tight">HRM Portal</span>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Unlock your team's<br />full potential today.
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Effortless HR management — attendance, leave, payroll &amp; more in one place.
          </p>

          {/* Feature Cards */}
          <div className="space-y-3">
            {[
              { icon: '📊', title: 'Real-time Analytics',   desc: 'Monitor attendance & performance live' },
              { icon: '🗓', title: 'Smart Leave Management', desc: 'Automated approvals & balance tracking' },
              { icon: '💳', title: 'Payroll Made Easy',      desc: 'Accurate payslips in one click' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-indigo-300 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['PS','DL','AP','TW'].map((ini, i) => (
              <div key={i}
                   className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xs font-bold"
                   style={{ zIndex: 4 - i }}>{ini}</div>
            ))}
          </div>
          <p className="text-indigo-200 text-sm">Trusted by <strong className="text-white">500+</strong> organisations</p>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">

          {/* Logo (mobile only) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src={logo} alt="Logo" className="w-9 h-9 rounded-xl" />
            <span className="text-lg font-bold text-gray-900">HRM Portal</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-500 text-sm mb-8">
            Don't have an account?{" "}
            <Link to="/createaccount" className="text-primary-600 font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          {/* Error */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm flex items-start gap-2">
              <span className="text-base mt-0.5">⚠️</span>
              <div>
                <p className="font-semibold">Login failed</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrorMessage(''); }}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgotpassword" className="text-xs text-primary-600 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrorMessage(''); }}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span className="text-sm text-gray-600">Remember me for 30 days</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5">
            <hr className="flex-1 border-gray-200" />
            <span className="px-3 text-xs text-gray-400 font-medium">Or continue with</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <FcGoogle size={18} /> Google
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <FaApple size={18} className="text-gray-900" /> Apple
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            © {new Date().getFullYear()} HRM Web Application. All rights reserved.{" "}
            <span className="hover:underline cursor-pointer">Terms</span> ·{" "}
            <span className="hover:underline cursor-pointer">Privacy</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;