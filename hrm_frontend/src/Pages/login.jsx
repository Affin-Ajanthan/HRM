import React, { useState } from "react";
import logo from "../assets/logo.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: replace with real auth call
    // eslint-disable-next-line no-console
    console.log({ email, password, rememberMe });
  };
  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 bg-gray-900 text-white flex-col justify-center px-10">
        <div className="mb-10">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c"
            alt="Team working"
            className="rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">
            Unlock your employees’ full potential today.
          </h1>
          <p className="text-gray-300">
            Let’s make your conveyancing process effortless today.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <img
              src={logo}
              alt="HRM logo"
              className="w-10 h-10 mr-2"
              loading="lazy"
            />
            <h2 className="text-3xl font-bold">
              Log<span className="text-blue-600">In</span>
            </h2>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address<span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password<span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <a href="#" className="text-blue-600 hover:underline">
                Forgot Password
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500 text-sm">Or login with</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Social Buttons */}
          <div className="flex justify-between gap-3">
            <button className="w-1/2 border py-2 rounded-md hover:bg-gray-100">
              Google
            </button>
            <button className="w-1/2 border py-2 rounded-md hover:bg-gray-100">
              Apple
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm mt-6">
            You’re new in here?{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Create Account
            </a>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            © 2025 HRM Web & Mobile Application. All rights reserved. Terms & Conditions | Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
