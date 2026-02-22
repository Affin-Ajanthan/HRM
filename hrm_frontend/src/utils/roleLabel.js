export function getRoleLabel(role) {
  if (role == null) return null;

  const normalized = String(role).trim().toUpperCase();

  const map = {
    "1": "Employee",
    "2": "HR Manager",
    "3": "Admin",
    EMPLOYEE: "Employee",
    HR_MANAGER: "HR Manager",
    HR: "HR",
    ADMIN: "Admin",
  };

  return map[normalized] ?? String(role);
}
