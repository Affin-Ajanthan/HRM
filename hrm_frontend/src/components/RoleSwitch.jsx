/**
 * RoleSwitch — toggle that lets an HR manager jump between the HR dashboard
 * and their own Employee dashboard without logging out.
 * Renders nothing for anyone who isn't an HR manager.
 *
 * Props:
 *   mode : 'hr' | 'employee'  — which side is currently being viewed
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, UserRound } from "lucide-react";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

export const RoleSwitch = ({ mode = "hr" }) => {
  const navigate = useNavigate();
  if (getStoredUser()?.role !== "HR_MANAGER") return null;

  const options = [
    { key: "hr", label: "HR", icon: Briefcase, path: "/hr/dashboard", active: "bg-teal-500 text-white shadow" },
    { key: "employee", label: "Employee", icon: UserRound, path: "/employee/dashboard", active: "bg-indigo-500 text-white shadow" },
  ];

  return (
    <div
      className="flex items-center bg-gray-100 rounded-xl p-1 gap-1"
      role="group"
      aria-label="Switch dashboard"
    >
      {options.map(({ key, label, icon: Icon, path, active }) => {
        const isActive = mode === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => !isActive && navigate(path)}
            aria-pressed={isActive}
            title={`Switch to ${label} dashboard`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive ? active : "text-gray-500 hover:text-gray-800 hover:bg-white"
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSwitch;
