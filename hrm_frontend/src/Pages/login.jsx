import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { Eye, EyeOff, Mail, Lock, AlertCircle, LogIn, Shield, Users, BarChart3 } from "lucide-react";
import logo from "../assets/logo.jpg";
import axios from "axios";

/* ── Floating particle (pure CSS animation via inline style) ── */
const Particle = ({ size, x, y, delay, duration }) => (
  <div
    className="absolute rounded-full opacity-20 pointer-events-none"
    style={{
      width: size, height: size,
      left: `${x}%`, top: `${y}%`,
      background: "radial-gradient(circle, rgba(99,102,241,0.8), rgba(139,92,246,0.4))",
      animation: `float ${duration}s ease-in-out ${delay}s infinite alternate`,
    }}
  />
);

const PARTICLES = [
  { size: 80,  x: 8,  y: 12, delay: 0,   duration: 6 },
  { size: 50,  x: 75, y: 5,  delay: 1,   duration: 8 },
  { size: 120, x: 60, y: 70, delay: 2,   duration: 7 },
  { size: 40,  x: 20, y: 80, delay: 0.5, duration: 9 },
  { size: 90,  x: 85, y: 40, delay: 1.5, duration: 6.5 },
  { size: 60,  x: 45, y: 25, delay: 3,   duration: 8.5 },
];

const FEATURE_CARDS = [
  { icon: Shield,   label: "Role-Based Access",  desc: "Admin, HR & Employee roles" },
  { icon: Users,    label: "Team Management",    desc: "Departments & employees" },
  { icon: BarChart3,label: "Smart Analytics",    desc: "Reports & attendance data" },
];

const Login = () => {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [mounted, setMounted]       = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    try {
      const { data: resp } = await axios.post("http://localhost:5004/api/auth/login", {
        email: email.trim(),
        password,
      });
      const { data } = resp;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      if (data.role === "ADMIN")        navigate("/admin/dashboard");
      else if (data.role === "HR_MANAGER") navigate("/hr/dashboard");
      else if (data.role === "EMPLOYEE")   navigate("/employee/dashboard");
      else navigate("/dashboard");
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
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes float {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-30px) scale(1.08); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-slide-up { animation: slideUp 0.6s ease forwards; }
        .animate-fade-in  { animation: fadeIn  0.8s ease forwards; }
        .shimmer-text {
          background: linear-gradient(90deg, #a5b4fc, #c4b5fd, #818cf8, #a5b4fc);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <div className="min-h-screen flex overflow-hidden font-sans">

        {/* ══════════════ LEFT PANEL ══════════════ */}
        <div
          className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(145deg, #050c1a 0%, #0a1628 50%, #0f1f3d 100%)" }}
        >
          {/* Animated particles */}
          {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          {/* Logo */}
          <div className={`flex items-center gap-3 relative z-10 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
            <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20">
              <img src={logo} alt="HRM" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">HRM System</p>
              <p className="text-indigo-400 text-xs">Human Resource Management</p>
            </div>
          </div>

          {/* Centre hero text */}
          <div className={`relative z-10 ${mounted ? "animate-slide-up" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                Trusted by 500+ companies
              </span>
              <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
                Unlock your team's{" "}
                <span className="shimmer-text">full potential</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                Streamline HR operations with intelligent automation, real-time analytics, and seamless collaboration.
              </p>
            </div>

            {/* Feature cards */}
            <div className="space-y-3">
              {FEATURE_CARDS.map((f, i) => (
                <div
                  key={f.label}
                  className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 hover:bg-white/8 hover:border-indigo-500/30 transition-all duration-300"
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <f.icon size={18} className="text-indigo-300" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{f.label}</p>
                    <p className="text-slate-500 text-xs">{f.desc}</p>
                  </div>
                  <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400/50" />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className={`flex gap-8 relative z-10 ${mounted ? "animate-fade-in" : "opacity-0"}`} style={{ animationDelay: "0.5s" }}>
            {[["99.9%","Uptime SLA"],["500+","Companies"],["50K+","Employees"]].map(([val, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-slate-500 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════ RIGHT PANEL (Form) ══════════════ */}
        <div
          className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative"
          style={{ background: "linear-gradient(160deg, #f8faff 0%, #f0f4ff 100%)" }}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4), transparent)" }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5), transparent)" }} />

          <div className={`w-full max-w-md relative z-10 ${mounted ? "animate-slide-up" : "opacity-0"}`}>

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-3 justify-center mb-8">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-indigo-400/30">
                <img src={logo} alt="HRM" className="w-full h-full object-cover" />
              </div>
              <p className="text-slate-800 font-bold text-xl">HRM System</p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50 p-8">

              {/* Header */}
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-300/40 mb-4">
                  <LogIn size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">Welcome back</h2>
                <p className="text-slate-500 text-sm mt-1">Sign in to your HRM account to continue</p>
              </div>

              {/* Error alert */}
              {errorMessage && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl mb-5 text-sm animate-slide-up">
                  <AlertCircle size={17} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Login Failed</p>
                    <p className="text-red-600/80 text-xs mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      disabled={isLoading}
                      placeholder="you@company.com"
                      onChange={e => { setEmail(e.target.value); setErrorMessage(""); }}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:bg-white transition-all disabled:opacity-60"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Test: hr@test.com</p>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type={showPass ? "text" : "password"}
                      required
                      value={password}
                      disabled={isLoading}
                      placeholder="••••••••"
                      onChange={e => { setPassword(e.target.value); setErrorMessage(""); }}
                      className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:bg-white transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Test: test123</p>
                </div>

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                      />
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${rememberMe ? "bg-indigo-500 border-indigo-500" : "border-slate-300 bg-white"}`}>
                        {rememberMe && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                    </div>
                    <span className="text-sm text-slate-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                    Forgot password?
                  </a>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-300/40 hover:shadow-indigo-400/50 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">or continue with</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2.5 border border-slate-200 bg-white hover:bg-slate-50 py-2.5 rounded-xl text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:shadow-sm">
                  <FcGoogle size={18} />
                  Google
                </button>
                <button className="flex items-center justify-center gap-2.5 border border-slate-200 bg-white hover:bg-slate-50 py-2.5 rounded-xl text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:shadow-sm">
                  <FaApple size={18} className="text-slate-800" />
                  Apple
                </button>
              </div>

              {/* Footer */}
              <p className="text-center text-sm text-slate-500 mt-6">
                New to HRM?{" "}
                <Link to="/createaccount" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                  Create an account
                </Link>
              </p>
            </div>

            {/* Legal */}
            <p className="text-center text-xs text-slate-400 mt-5">
              © 2026 HRM System · All rights reserved ·{" "}
              <span className="hover:text-slate-600 cursor-pointer underline underline-offset-2">Terms</span>
              {" · "}
              <span className="hover:text-slate-600 cursor-pointer underline underline-offset-2">Privacy</span>
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default Login;