import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  X,
  Trash2,
  Edit3,
  Eye,
  Building2,
  BriefcaseBusiness,
  Mail,
  Phone,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Filter,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { PageLayout } from "../../components/PageLayout";
import { hrApi } from "../../services/api";

const Employee = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dob: "",
    phone: "",
    departmentId: "",
    departmentName: "",
    designation: "",
    employeeId: "",
    joiningDate: new Date().toISOString().split("T")[0],
    status: "ACTIVE",
    gender: "",
    address: "",
    password: "Welcome@123",
  });

  // ---------------------------------------------------------
  // AUTHENTICATION
  // ---------------------------------------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);

        if (
          parsed.role !== "HR_MANAGER" &&
          parsed.role !== "ADMIN"
        ) {
          navigate("/unauthorized");
          return;
        }

        setUser(parsed);
      } catch (err) {
        console.error("Invalid user data:", err);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // ---------------------------------------------------------
  // FETCH DATA
  // ---------------------------------------------------------
  const fetchEmployees = async () => {
    try {
      const res = await hrApi.getEmployees();
      const list = res?.data || res || [];

      setEmployees(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await hrApi.getDepartments();
      const list = res?.data || res || [];

      setDepartments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const loadAll = async () => {
      setLoading(true);

      await Promise.all([
        fetchEmployees(),
        fetchDepartments(),
      ]);

      setLoading(false);
    };

    loadAll();
  }, [user]);

  // ---------------------------------------------------------
  // SELECTED DEPARTMENT FOR FORM
  // ---------------------------------------------------------
  const currentDeptObj = useMemo(() => {
    if (!formData.departmentId) return null;

    return departments.find(
      (d) =>
        String(d.id) === String(formData.departmentId)
    );
  }, [departments, formData.departmentId]);

  // ---------------------------------------------------------
  // AVAILABLE JOB ROLES
  // ---------------------------------------------------------
  const availableJobRoles = useMemo(() => {
    if (!currentDeptObj || !currentDeptObj.jobRoles) {
      return [];
    }

    return currentDeptObj.jobRoles
      .map((role) => {
        if (typeof role === "string") return role;

        return role.jobTitle || role.title || "";
      })
      .filter(Boolean);
  }, [currentDeptObj]);

  // ---------------------------------------------------------
  // DEPARTMENT CODE
  // ---------------------------------------------------------
  const currentDeptCode = useMemo(() => {
    if (!currentDeptObj) return "";

    return (
      currentDeptObj.shortCode ||
      currentDeptObj.code ||
      currentDeptObj.name.slice(0, 3).toUpperCase()
    )
      .trim()
      .toUpperCase();
  }, [currentDeptObj]);

  // ---------------------------------------------------------
  // DEPARTMENT SELECTION HANDLER
  // ---------------------------------------------------------
  const handleDepartmentChange = (deptId) => {
    const selectedDept = departments.find(
      (d) =>
        String(d.id) === String(deptId)
    );

    if (!selectedDept) {
      setFormData((prev) => ({
        ...prev,
        departmentId: "",
        departmentName: "",
        designation: "",
      }));

      return;
    }

    const code = (
      selectedDept.shortCode ||
      selectedDept.code ||
      selectedDept.name.slice(0, 3).toUpperCase()
    )
      .trim()
      .toUpperCase();

    // Employee ID is simply the department's short code
    // (e.g. "SE" for Software Engineering, "AI" for AI department) —
    // no running number is appended.
    const newEmployeeId = code;

    const roles = selectedDept.jobRoles || [];

    const firstRole =
      roles.length > 0
        ? roles[0].jobTitle ||
        roles[0].title ||
        ""
        : "";

    setFormData((prev) => ({
      ...prev,
      departmentId: selectedDept.id,
      departmentName: selectedDept.name,
      designation: firstRole || "",
      employeeId: newEmployeeId,
    }));
  };

  // ---------------------------------------------------------
  // FORM RESET
  // ---------------------------------------------------------
  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      dob: "",
      phone: "",
      departmentId: "",
      departmentName: "",
      designation: "",
      employeeId: "",
      joiningDate: new Date()
        .toISOString()
        .split("T")[0],
      status: "ACTIVE",
      gender: "",
      address: "",
      password: "Welcome@123",
    });

    setEditingEmployee(null);
  };

  // ---------------------------------------------------------
  // OPEN CREATE FORM
  // ---------------------------------------------------------
  const openCreateForm = () => {
    resetForm();

    if (departments.length > 0) {
      const firstDept = departments[0];

      const code = (
        firstDept.shortCode ||
        firstDept.code ||
        firstDept.name.slice(0, 3).toUpperCase()
      )
        .trim()
        .toUpperCase();

      const roles = firstDept.jobRoles || [];

      const firstRole =
        roles.length > 0
          ? roles[0].jobTitle ||
          roles[0].title ||
          ""
          : "";

      setFormData({
        fullName: "",
        email: "",
        dob: "",
        phone: "",
        departmentId: firstDept.id,
        departmentName: firstDept.name,
        designation: firstRole,
        employeeId: code,
        joiningDate: new Date()
          .toISOString()
          .split("T")[0],
        status: "ACTIVE",
        gender: "",
        address: "",
        password: "Welcome@123",
      });
    }

    setShowAddForm(true);
  };

  // ---------------------------------------------------------
  // EDIT EMPLOYEE
  // ---------------------------------------------------------
  const handleEdit = (employee) => {
    setEditingEmployee(employee);

    let matchedDept = null;

    if (employee.departmentId) {
      matchedDept = departments.find(
        (d) =>
          String(d.id) ===
          String(employee.departmentId)
      );
    }

    if (!matchedDept && employee.department) {
      matchedDept = departments.find(
        (d) =>
          d.name.toLowerCase() ===
          employee.department.toLowerCase() ||
          String(d.id) ===
          String(employee.department)
      );
    }

    if (!matchedDept && employee.departmentName) {
      matchedDept = departments.find(
        (d) =>
          d.name.toLowerCase() ===
          employee.departmentName.toLowerCase()
      );
    }

    setFormData({
      fullName: employee.fullName || "",
      email: employee.email || "",
      dob:
        employee.dob ||
        employee.birthday ||
        "",
      phone:
        employee.phone ||
        employee.phoneNumber ||
        "",
      departmentId: matchedDept
        ? matchedDept.id
        : employee.departmentId || "",
      departmentName: matchedDept
        ? matchedDept.name
        : employee.departmentName ||
        employee.department ||
        "",
      designation:
        employee.designation ||
        employee.role ||
        "",
      employeeId:
        employee.employeeId || "",
      joiningDate:
        employee.joiningDate ||
        new Date()
          .toISOString()
          .split("T")[0],
      status:
        employee.status || "ACTIVE",
      gender: employee.gender || "",
      address: employee.address || "",
      password: "Welcome@123",
    });

    setShowAddForm(true);
  };

  // ---------------------------------------------------------
  // CLOSE FORM
  // ---------------------------------------------------------
  const closeForm = () => {
    if (saving) return;

    resetForm();
    setShowAddForm(false);
  };

  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      alert(
        "Please enter the employee's full name."
      );
      return;
    }

    if (!formData.email.trim()) {
      alert(
        "Please enter a valid email address."
      );
      return;
    }

    if (!formData.employeeId.trim()) {
      alert("Please enter an employee ID.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        employeeId:
          formData.employeeId
            .trim()
            .toUpperCase(),

        fullName:
          formData.fullName.trim(),

        email:
          formData.email
            .trim()
            .toLowerCase(),

        dob: formData.dob || null,

        phone:
          formData.phone.trim() || null,

        departmentId:
          formData.departmentId
            ? Number(formData.departmentId)
            : null,

        departmentName:
          formData.departmentName || null,

        designation:
          formData.designation.trim() || null,

        joiningDate:
          formData.joiningDate ||
          new Date()
            .toISOString()
            .split("T")[0],

        status:
          formData.status || "ACTIVE",

        password:
          formData.password ||
          "Welcome@123",

        gender:
          formData.gender || null,

        address:
          formData.address || null,
      };

      if (editingEmployee) {
        await hrApi.updateEmployee(
          editingEmployee.id,
          payload
        );
      } else {
        await hrApi.createEmployee(payload);
      }

      await fetchEmployees();
      closeForm();
    } catch (error) {
      console.error(
        "Failed to save employee:",
        error
      );

      alert(
        error.message ||
        "Failed to save employee to database."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // DELETE EMPLOYEE
  // ---------------------------------------------------------
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await hrApi.deleteEmployee(
        deleteTarget.id
      );

      await fetchEmployees();

      setDeleteTarget(null);
    } catch (error) {
      console.error(
        "Failed to delete employee:",
        error
      );

      alert(
        error.message ||
        "Failed to delete employee."
      );
    }
  };

  // ---------------------------------------------------------
  // FILTERING
  // ---------------------------------------------------------
  const filteredEmployees = useMemo(() => {
    const search =
      searchTerm.toLowerCase().trim();

    return employees.filter((emp) => {
      if (selectedDeptFilter !== "ALL") {
        const empDept = (
          emp.departmentName ||
          emp.department ||
          ""
        ).toLowerCase();

        if (
          empDept !==
          selectedDeptFilter.toLowerCase()
        ) {
          return false;
        }
      }

      if (!search) return true;

      const name = (
        emp.fullName || ""
      ).toLowerCase();

      const id = (
        emp.employeeId || ""
      ).toLowerCase();

      const email = (
        emp.email || ""
      ).toLowerCase();

      const role = (
        emp.designation || ""
      ).toLowerCase();

      const phone = (
        emp.phone || ""
      ).toLowerCase();

      const dept = (
        emp.departmentName ||
        emp.department ||
        ""
      ).toLowerCase();

      return (
        name.includes(search) ||
        id.includes(search) ||
        email.includes(search) ||
        role.includes(search) ||
        phone.includes(search) ||
        dept.includes(search)
      );
    });
  }, [
    employees,
    searchTerm,
    selectedDeptFilter,
  ]);

  // ---------------------------------------------------------
  // SUMMARY COUNTS
  // ---------------------------------------------------------
  const totalEmployees =
    employees.length;

  const activeEmployees =
    employees.filter(
      (e) =>
        (e.status || "").toUpperCase() ===
        "ACTIVE"
    ).length;

  const totalDeptsRepresented =
    departments.length;

  if (!user) return null;

  return (
    <PageLayout
      role="hr"
      activePage="Employees"
      title="Employees"
      subtitle="Manage your organization's workforce, departments, and job roles"
      actions={
        <button
          onClick={openCreateForm}
          className="
            inline-flex items-center gap-2
            bg-gradient-to-br from-teal-400 to-emerald-500
            hover:from-teal-500 hover:to-emerald-600
            text-white px-4 py-2.5
            rounded-xl text-sm font-semibold
            shadow-sm shadow-teal-500/20
            transition-all duration-200
          "
        >
          <Plus
            size={17}
            strokeWidth={2.5}
          />
          Add Employee
        </button>
      }
    >
      <div className="space-y-6">

        {/* =====================================================
            SUMMARY METRICS
        ====================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* GREEN - TOTAL EMPLOYEES */}
          <SummaryCard
            icon={<Users size={20} />}
            title="Total Employees"
            value={totalEmployees}
            description="Registered in organization"
            className="
              bg-gradient-to-br
              from-emerald-400
              to-teal-500
            "
          />

          {/* ORANGE - ACTIVE EMPLOYEES */}
          <SummaryCard
            icon={<UserCheck size={20} />}
            title="Active Employees"
            value={activeEmployees}
            description="Currently in active status"
            className="
              bg-gradient-to-br
              from-amber-400
              to-orange-500
            "
          />

          {/* PURPLE - DEPARTMENTS */}
          <SummaryCard
            icon={<Building2 size={20} />}
            title="Departments"
            value={totalDeptsRepresented}
            description="Active database departments"
            className="
              bg-gradient-to-br
              from-indigo-400
              to-violet-500
            "
          />
        </div>

        {/* =====================================================
            SEARCH & FILTER CONTROLS
        ====================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">

            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search
                size={18}
                className="
                  absolute left-3.5 top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search by name, ID (e.g. SE003), email, or role..."
                className="
                  w-full
                  pl-10 pr-10
                  py-2.5
                  bg-slate-50
                  border border-slate-200
                  rounded-xl
                  text-sm text-slate-800
                  placeholder:text-slate-400
                  focus:outline-none
                  focus:bg-white
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                  transition-all
                "
              />

              {searchTerm && (
                <button
                  onClick={() =>
                    setSearchTerm("")
                  }
                  className="
                    absolute right-3 top-1/2
                    -translate-y-1/2
                    text-slate-400
                    hover:text-slate-600
                  "
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-3">

              <div className="flex items-center gap-2">
                <Filter
                  size={15}
                  className="text-slate-400"
                />

                <select
                  value={selectedDeptFilter}
                  onChange={(e) =>
                    setSelectedDeptFilter(
                      e.target.value
                    )
                  }
                  className="
                    px-3 py-2
                    bg-slate-50
                    border border-slate-200
                    rounded-xl
                    text-xs font-semibold
                    text-slate-700
                    focus:outline-none
                    focus:bg-white
                    focus:border-blue-500
                  "
                >
                  <option value="ALL">
                    All Departments
                  </option>

                  {departments.map((d) => (
                    <option
                      key={d.id}
                      value={d.name}
                    >
                      {d.name}{" "}
                      {d.shortCode
                        ? `(${d.shortCode})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <span className="
                text-xs text-slate-500
                font-medium
              ">
                Showing{" "}
                <strong className="text-slate-800">
                  {filteredEmployees.length}
                </strong>{" "}
                of {employees.length}
              </span>

            </div>
          </div>
        </div>

        {/* =====================================================
            EMPLOYEE TABLE
        ====================================================== */}
        <div className="
          bg-white
          rounded-2xl
          border border-slate-200
          shadow-sm
        ">

          {/* Desktop Table Header */}
          <div className="
            hidden lg:grid
            grid-cols-[2fr_1fr_1.2fr_1.2fr_1.1fr_1fr_110px]
            gap-4
            px-6 py-3.5
            bg-gradient-to-br
            from-teal-400
            to-emerald-500
            border-b border-slate-200
            rounded-t-2xl
            text-white
          ">
            <TableHeader>
              Employee
            </TableHeader>

            <TableHeader>
              ID
            </TableHeader>

            <TableHeader>
              Department
            </TableHeader>

            <TableHeader>
              Job Role
            </TableHeader>

            <TableHeader>
              Birthday
            </TableHeader>

            <TableHeader>
              Phone
            </TableHeader>

            <TableHeader className="text-right">
              Actions
            </TableHeader>
          </div>

          {/* Content States */}
          {loading ? (
            <div className="
              py-20
              flex flex-col
              items-center
              justify-center
              text-center
            ">
              <div className="
                h-11 w-11
                rounded-xl
                bg-blue-50
                text-blue-600
                flex items-center
                justify-center
                mb-4
              ">
                <Loader2
                  size={22}
                  className="animate-spin"
                />
              </div>

              <p className="
                text-sm
                font-medium
                text-slate-700
              ">
                Loading employee directory...
              </p>

              <p className="
                text-xs
                text-slate-400
                mt-1
              ">
                Fetching latest records from database
              </p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="
              py-16 px-6
              flex flex-col
              items-center
              justify-center
              text-center
            ">
              <div className="
                h-16 w-16
                rounded-2xl
                bg-blue-50
                text-blue-500
                flex items-center
                justify-center
                mb-4
              ">
                {searchTerm ? (
                  <Search size={28} />
                ) : (
                  <Users size={28} />
                )}
              </div>

              <h3 className="
                text-base
                font-bold
                text-slate-800
              ">
                {searchTerm
                  ? "No employees found"
                  : "No employees added yet"}
              </h3>

              <p className="
                text-sm
                text-slate-500
                mt-1
                max-w-sm
              ">
                {searchTerm
                  ? "Try clearing your search query or choosing another department."
                  : "Start onboarding by adding your first employee to the database."}
              </p>

              {!searchTerm && (
                <button
                  onClick={openCreateForm}
                  className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    px-4 py-2.5
                    rounded-xl
                    text-sm
                    font-semibold
                    transition-colors
                  "
                >
                  <Plus size={16} />
                  Add Employee
                </button>
              )}
            </div>
          ) : (
            <div className="
              divide-y
              divide-slate-100
            ">
              {filteredEmployees.map((emp) => {
                const empId =
                  emp.employeeId ||
                  `EMP-${emp.id}`;

                const deptName =
                  emp.departmentName ||
                  emp.department ||
                  "—";

                const roleTitle =
                  emp.designation ||
                  emp.role ||
                  "—";

                return (
                  <div
                    key={emp.id}
                    className="
                      group
                      px-4 sm:px-6
                      py-4
                      hover:bg-blue-50/40
                      transition-colors
                    "
                  >

                    {/* Desktop View */}
                    <div className="
                      hidden lg:grid
                      grid-cols-[2fr_1fr_1.2fr_1.2fr_1.1fr_1fr_110px]
                      gap-4
                      items-center
                    ">

                      {/* Employee */}
                      <div className="
                        flex items-center
                        gap-3 min-w-0
                      ">
                        <div className="
                          h-10 w-10
                          flex-shrink-0
                          rounded-xl
                          bg-gradient-to-br
                          from-teal-400
                          to-emerald-500
                          text-white
                          font-bold
                          text-sm
                          flex items-center
                          justify-center
                          shadow-sm
                        ">
                          {emp.fullName
                            ? emp.fullName
                              .charAt(0)
                              .toUpperCase()
                            : "E"}
                        </div>

                        <div className="min-w-0">
                          <button
                            onClick={() =>
                              setViewingEmployee(emp)
                            }
                            className="
                              text-sm
                              font-semibold
                              text-slate-800
                              hover:text-blue-600
                              truncate
                              text-left
                              block
                              transition-colors
                            "
                          >
                            {emp.fullName}
                          </button>

                          <p className="
                            text-xs
                            text-slate-400
                            truncate
                            mt-0.5
                          ">
                            {emp.email}
                          </p>
                        </div>
                      </div>

                      {/* ID */}
                      <div>
                        <span className="
                          inline-flex
                          items-center
                          px-2.5 py-1
                          rounded-lg
                          bg-slate-100
                          text-slate-700
                          font-mono
                          text-xs
                          font-bold
                          border
                          border-slate-200
                        ">
                          {empId}
                        </span>
                      </div>

                      {/* Department */}
                      <div className="
                        flex items-center
                        gap-1.5
                        min-w-0
                      ">
                        <Building2
                          size={14}
                          className="
                            text-blue-500
                            flex-shrink-0
                          "
                        />

                        <span className="
                          text-sm
                          text-slate-700
                          font-medium
                          truncate
                        ">
                          {deptName}
                        </span>
                      </div>

                      {/* Job Role */}
                      <div className="
                        flex items-center
                        gap-1.5
                        min-w-0
                      ">
                        <BriefcaseBusiness
                          size={14}
                          className="
                            text-slate-400
                            flex-shrink-0
                          "
                        />

                        <span className="
                          text-sm
                          text-slate-700
                          font-semibold
                          truncate
                        ">
                          {roleTitle}
                        </span>
                      </div>

                      {/* Birthday */}
                      <div className="
                        flex items-center
                        gap-1.5
                        text-xs
                        text-slate-600
                      ">
                        <Calendar
                          size={13}
                          className="
                            text-slate-400
                            flex-shrink-0
                          "
                        />

                        <span>
                          {emp.dob ||
                            emp.birthday ||
                            "—"}
                        </span>
                      </div>

                      {/* Phone */}
                      <div className="
                        flex items-center
                        gap-1.5
                        text-xs
                        text-slate-600
                      ">
                        <Phone
                          size={13}
                          className="
                            text-slate-400
                            flex-shrink-0
                          "
                        />

                        <span className="truncate">
                          {emp.phone ||
                            emp.phoneNumber ||
                            "—"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="
                        flex items-center
                        justify-end
                        gap-1
                      ">
                        <button
                          type="button"
                          onClick={() =>
                            setViewingEmployee(emp)
                          }
                          title="View Employee Details"
                          className="
                            h-8 w-8
                            rounded-lg
                            flex items-center
                            justify-center
                            text-slate-400
                            hover:text-blue-600
                            hover:bg-blue-50
                            transition-colors
                          "
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(emp)
                          }
                          title="Edit Employee"
                          className="
                            h-8 w-8
                            rounded-lg
                            flex items-center
                            justify-center
                            text-slate-400
                            hover:text-amber-600
                            hover:bg-amber-50
                            transition-colors
                          "
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget(emp)
                          }
                          title="Delete Employee"
                          className="
                            h-8 w-8
                            rounded-lg
                            flex items-center
                            justify-center
                            text-slate-400
                            hover:text-red-600
                            hover:bg-red-50
                            transition-colors
                          "
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="
                      lg:hidden
                      space-y-3
                    ">
                      <div className="
                        flex items-start
                        justify-between
                        gap-3
                      ">
                        <div className="
                          flex items-center
                          gap-3
                          min-w-0
                        ">
                          <div className="
                            h-11 w-11
                            flex-shrink-0
                            rounded-xl
                            bg-gradient-to-br
                            from-teal-400
                            to-emerald-500
                            text-white
                            font-bold
                            text-sm
                            flex items-center
                            justify-center
                          ">
                            {emp.fullName
                              ? emp.fullName
                                .charAt(0)
                                .toUpperCase()
                              : "E"}
                          </div>

                          <div className="min-w-0">
                            <button
                              onClick={() =>
                                setViewingEmployee(emp)
                              }
                              className="
                                font-semibold
                                text-slate-800
                                text-sm
                                truncate
                                text-left
                                block
                              "
                            >
                              {emp.fullName}
                            </button>

                            <p className="
                              text-xs
                              text-slate-400
                              truncate
                              mt-0.5
                            ">
                              {emp.email}
                            </p>
                          </div>
                        </div>

                        <span className="
                          px-2.5 py-1
                          rounded-lg
                          bg-slate-100
                          text-slate-700
                          font-mono
                          text-xs
                          font-bold
                          border
                          border-slate-200
                        ">
                          {empId}
                        </span>
                      </div>

                      <div className="
                        grid grid-cols-2
                        gap-2
                        text-xs
                        pt-2
                      ">
                        <div className="
                          bg-slate-50
                          p-2.5
                          rounded-xl
                        ">
                          <span className="
                            text-slate-400
                            block
                            text-[11px]
                          ">
                            Department
                          </span>

                          <span className="
                            font-semibold
                            text-slate-700
                            truncate
                            block
                            mt-0.5
                          ">
                            {deptName}
                          </span>
                        </div>

                        <div className="
                          bg-slate-50
                          p-2.5
                          rounded-xl
                        ">
                          <span className="
                            text-slate-400
                            block
                            text-[11px]
                          ">
                            Job Role
                          </span>

                          <span className="
                            font-semibold
                            text-slate-700
                            truncate
                            block
                            mt-0.5
                          ">
                            {roleTitle}
                          </span>
                        </div>

                        <div className="
                          bg-slate-50
                          p-2.5
                          rounded-xl
                        ">
                          <span className="
                            text-slate-400
                            block
                            text-[11px]
                          ">
                            Birthday
                          </span>

                          <span className="
                            font-medium
                            text-slate-600
                            block
                            mt-0.5
                          ">
                            {emp.dob ||
                              emp.birthday ||
                              "—"}
                          </span>
                        </div>

                        <div className="
                          bg-slate-50
                          p-2.5
                          rounded-xl
                        ">
                          <span className="
                            text-slate-400
                            block
                            text-[11px]
                          ">
                            Phone
                          </span>

                          <span className="
                            font-medium
                            text-slate-600
                            truncate
                            block
                            mt-0.5
                          ">
                            {emp.phone ||
                              emp.phoneNumber ||
                              "—"}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Actions */}
                      <div className="
                        flex items-center
                        gap-2
                        pt-2
                        border-t
                        border-slate-100
                      ">
                        <button
                          type="button"
                          onClick={() =>
                            setViewingEmployee(emp)
                          }
                          className="
                            flex-1
                            py-2 px-2.5
                            rounded-xl
                            bg-slate-50
                            hover:bg-blue-50
                            text-slate-600
                            hover:text-blue-600
                            border
                            border-slate-200
                            text-xs
                            font-semibold
                            flex items-center
                            justify-center
                            gap-1.5
                            transition-colors
                          "
                        >
                          <Eye size={14} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(emp)
                          }
                          className="
                            flex-1
                            py-2 px-2.5
                            rounded-xl
                            bg-slate-50
                            hover:bg-amber-50
                            text-slate-600
                            hover:text-amber-600
                            border
                            border-slate-200
                            text-xs
                            font-semibold
                            flex items-center
                            justify-center
                            gap-1.5
                            transition-colors
                          "
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget(emp)
                          }
                          className="
                            flex-1
                            py-2 px-2.5
                            rounded-xl
                            bg-slate-50
                            hover:bg-red-50
                            text-slate-600
                            hover:text-red-600
                            border
                            border-slate-200
                            text-xs
                            font-semibold
                            flex items-center
                            justify-center
                            gap-1.5
                            transition-colors
                          "
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          ADD / EDIT EMPLOYEE MODAL
      ====================================================== */}
      {showAddForm && (
        <div className="
          fixed inset-0
          z-50
          bg-slate-900/40
          backdrop-blur-sm
          flex items-center
          justify-center
          p-4
        ">
          <div className="
            bg-white
            w-full
            max-w-2xl
            max-h-[92vh]
            overflow-hidden
            rounded-2xl
            shadow-2xl
            flex flex-col
          ">

            {/* Modal Header */}
            <div className="
              px-6 py-5
              border-b
              border-slate-200
              flex items-center
              justify-between
            ">
              <div>
                <h2 className="
                  text-lg
                  font-bold
                  text-slate-900
                ">
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add New Employee"}
                </h2>

                <p className="
                  text-xs
                  text-slate-500
                  mt-0.5
                ">
                  Enter employee details, select department & job role
                </p>
              </div>

              <button
                onClick={closeForm}
                className="
                  h-9 w-9
                  rounded-lg
                  flex items-center
                  justify-center
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-700
                  transition-colors
                "
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmit}
              className="
                flex flex-col
                min-h-0
              "
            >
              <div className="
                overflow-y-auto
                p-6
                space-y-6
              ">

                {/* SECTION 1 */}
                <div>
                  <div className="
                    flex items-center
                    gap-2
                    mb-4
                  ">
                    <span className="
                      h-6 w-6
                      rounded-md
                      bg-blue-600
                      text-white
                      text-xs
                      font-bold
                      flex items-center
                      justify-center
                    ">
                      1
                    </span>

                    <h3 className="
                      text-sm
                      font-bold
                      text-slate-800
                    ">
                      Personal Information
                    </h3>
                  </div>

                  <div className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-4
                  ">

                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="
                        block
                        text-xs
                        font-semibold
                        text-slate-600
                        uppercase
                        tracking-wider
                        mb-1.5
                      ">
                        Full Name{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fullName:
                              e.target.value,
                          })
                        }
                        placeholder="e.g. Alex Morgan"
                        className="
                          w-full
                          px-3.5 py-2.5
                          bg-slate-50
                          border border-slate-200
                          rounded-xl
                          text-sm
                          text-slate-800
                          placeholder:text-slate-400
                          focus:outline-none
                          focus:bg-white
                          focus:border-blue-500
                          focus:ring-4
                          focus:ring-blue-500/10
                        "
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="
                        block
                        text-xs
                        font-semibold
                        text-slate-600
                        uppercase
                        tracking-wider
                        mb-1.5
                      ">
                        Email Address{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <Mail
                          size={16}
                          className="
                            absolute
                            left-3
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                          "
                        />

                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email:
                                e.target.value,
                            })
                          }
                          placeholder="alex@company.com"
                          className="
                            w-full
                            pl-9 pr-3.5
                            py-2.5
                            bg-slate-50
                            border border-slate-200
                            rounded-xl
                            text-sm
                            text-slate-800
                            placeholder:text-slate-400
                            focus:outline-none
                            focus:bg-white
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-500/10
                          "
                        />
                      </div>
                    </div>

                    {/* Birthday */}
                    <div>
                      <label className="
                        block
                        text-xs
                        font-semibold
                        text-slate-600
                        uppercase
                        tracking-wider
                        mb-1.5
                      ">
                        Birthday{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <Calendar
                          size={16}
                          className="
                            absolute
                            left-3
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                          "
                        />

                        <input
                          type="date"
                          required
                          value={formData.dob}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dob: e.target.value,
                            })
                          }
                          className="
                            w-full
                            pl-9 pr-3.5
                            py-2.5
                            bg-slate-50
                            border border-slate-200
                            rounded-xl
                            text-sm
                            text-slate-800
                            focus:outline-none
                            focus:bg-white
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-500/10
                          "
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="
                        block
                        text-xs
                        font-semibold
                        text-slate-600
                        uppercase
                        tracking-wider
                        mb-1.5
                      ">
                        Phone Number{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <Phone
                          size={16}
                          className="
                            absolute
                            left-3
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                          "
                        />

                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phone:
                                e.target.value,
                            })
                          }
                          placeholder="+1 (555) 012-3456"
                          className="
                            w-full
                            pl-9 pr-3.5
                            py-2.5
                            bg-slate-50
                            border border-slate-200
                            rounded-xl
                            text-sm
                            text-slate-800
                            placeholder:text-slate-400
                            focus:outline-none
                            focus:bg-white
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-500/10
                          "
                        />
                      </div>
                    </div>

                    {/* Joining Date */}
                    <div>
                      <label className="
                        block
                        text-xs
                        font-semibold
                        text-slate-600
                        uppercase
                        tracking-wider
                        mb-1.5
                      ">
                        Joining Date
                      </label>

                      <input
                        type="date"
                        value={formData.joiningDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            joiningDate:
                              e.target.value,
                          })
                        }
                        className="
                          w-full
                          px-3.5 py-2.5
                          bg-slate-50
                          border border-slate-200
                          rounded-xl
                          text-sm
                          text-slate-800
                          focus:outline-none
                          focus:bg-white
                          focus:border-blue-500
                        "
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2 */}
                <div className="
                  pt-4
                  border-t
                  border-slate-100
                ">
                  <div className="
                    flex items-center
                    justify-between
                    mb-4
                  ">
                    <div className="
                      flex items-center
                      gap-2
                    ">
                      <span className="
                        h-6 w-6
                        rounded-md
                        bg-blue-600
                        text-white
                        text-xs
                        font-bold
                        flex items-center
                        justify-center
                      ">
                        2
                      </span>

                      <h3 className="
                        text-sm
                        font-bold
                        text-slate-800
                      ">
                        Department & Role Assignment
                      </h3>
                    </div>

                    {currentDeptCode && (
                      <span className="
                        text-xs
                        font-mono
                        font-bold
                        text-blue-600
                        bg-blue-50
                        px-2.5 py-1
                        rounded-lg
                        border
                        border-blue-200/60
                      ">
                        Code: {currentDeptCode}
                      </span>
                    )}
                  </div>

                  <div className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-4
                  ">

                    {/* Department */}
                    <div>
                      <label className="
                        block
                        text-xs
                        font-semibold
                        text-slate-600
                        uppercase
                        tracking-wider
                        mb-1.5
                      ">
                        Department{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <select
                        required
                        value={formData.departmentId}
                        onChange={(e) =>
                          handleDepartmentChange(
                            e.target.value
                          )
                        }
                        className="
                          w-full
                          px-3.5 py-2.5
                          bg-slate-50
                          border border-slate-200
                          rounded-xl
                          text-sm
                          text-slate-800
                          focus:outline-none
                          focus:bg-white
                          focus:border-blue-500
                          focus:ring-4
                          focus:ring-blue-500/10
                        "
                      >
                        <option value="">
                          -- Select Department --
                        </option>

                        {departments.map(
                          (dept) => {
                            const code =
                              dept.shortCode ||
                              dept.code ||
                              "";

                            return (
                              <option
                                key={dept.id}
                                value={dept.id}
                              >
                                {dept.name}{" "}
                                {code
                                  ? `(${code})`
                                  : ""}
                              </option>
                            );
                          }
                        )}
                      </select>

                      {departments.length === 0 && (
                        <p className="
                          text-xs
                          text-amber-600
                          mt-1
                        ">
                          No departments in database.
                          Please create a department first.
                        </p>
                      )}
                    </div>

                    {/* Job Role */}
                    <div>
                      <label className="
                        block
                        text-xs
                        font-semibold
                        text-slate-600
                        uppercase
                        tracking-wider
                        mb-1.5
                      ">
                        Job Role (Designation){" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      {availableJobRoles.length >
                        0 ? (
                        <select
                          required
                          value={
                            formData.designation
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              designation:
                                e.target.value,
                            })
                          }
                          className="
                            w-full
                            px-3.5 py-2.5
                            bg-slate-50
                            border border-slate-200
                            rounded-xl
                            text-sm
                            text-slate-800
                            focus:outline-none
                            focus:bg-white
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-500/10
                          "
                        >
                          <option value="">
                            -- Select Job Role --
                          </option>

                          {availableJobRoles.map(
                            (
                              roleTitle,
                              idx
                            ) => (
                              <option
                                key={idx}
                                value={roleTitle}
                              >
                                {roleTitle}
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        <div>
                          <input
                            type="text"
                            required
                            value={
                              formData.designation
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                designation:
                                  e.target.value,
                              })
                            }
                            placeholder={
                              formData.departmentId
                                ? "Enter job role title..."
                                : "Select a department first"
                            }
                            className="
                              w-full
                              px-3.5 py-2.5
                              bg-slate-50
                              border border-slate-200
                              rounded-xl
                              text-sm
                              text-slate-800
                              placeholder:text-slate-400
                              focus:outline-none
                              focus:bg-white
                              focus:border-blue-500
                            "
                          />

                          {formData.departmentId && (
                            <p className="
                              text-[11px]
                              text-slate-400
                              mt-1
                            ">
                              No predefined roles in
                              this department. You can
                              type a custom role.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Employee ID */}
                    <div className="sm:col-span-2">
                      <div className="
                        flex items-center
                        justify-between
                        mb-1.5
                      ">
                        <label className="
                          block
                          text-xs
                          font-semibold
                          text-slate-600
                          uppercase
                          tracking-wider
                        ">
                          Employee ID{" "}
                          <span className="text-red-500">
                            *
                          </span>
                        </label>

                        <span className="
                          text-xs
                          text-slate-400
                        ">
                          Starts with department code:{" "}
                          <strong className="
                            text-slate-700
                          ">
                            {currentDeptCode || "—"}
                          </strong>
                        </span>
                      </div>

                      <div className="
                        relative
                        flex items-center
                      ">
                        {currentDeptCode && (
                          <div className="
                            absolute
                            left-1.5
                            px-2.5 py-1.5
                            rounded-lg
                            bg-blue-100/80
                            text-blue-700
                            font-mono
                            font-bold
                            text-xs
                            pointer-events-none
                          ">
                            {currentDeptCode}
                          </div>
                        )}

                        <input
                          type="text"
                          required
                          disabled={!currentDeptCode}
                          value={
                            formData.employeeId
                          }
                          onChange={(e) => {
                            let val =
                              e.target.value.toUpperCase();

                            // Keep the department code locked in as the
                            // prefix — HR can freely type/append the
                            // employee number after it (e.g. SE003).
                            if (
                              currentDeptCode &&
                              !val.startsWith(
                                currentDeptCode
                              )
                            ) {
                              val = `${currentDeptCode}${val.replace(
                                currentDeptCode,
                                ""
                              )}`;
                            }

                            setFormData({
                              ...formData,
                              employeeId: val,
                            });
                          }}
                          placeholder={
                            currentDeptCode
                              ? `${currentDeptCode}003`
                              : "Select a department first"
                          }
                          className={`
                            w-full
                            py-2.5 pr-3.5
                            ${currentDeptCode
                              ? "pl-16"
                              : "pl-3.5"
                            }
                            bg-slate-50
                            border border-slate-200
                            rounded-xl
                            text-sm
                            font-mono
                            font-bold
                            text-slate-800
                            placeholder:text-slate-400
                            focus:outline-none
                            focus:bg-white
                            focus:border-blue-500
                            focus:ring-4
                            focus:ring-blue-500/10
                            disabled:bg-slate-100
                            disabled:cursor-not-allowed
                          `}
                        />
                      </div>

                      <p className="
                        text-[11px]
                        text-slate-400
                        mt-1
                      ">
                        This employee's ID will be saved as{" "}
                        <strong className="
                          text-slate-600
                        ">
                          {formData.employeeId ||
                            (currentDeptCode
                              ? `${currentDeptCode}003`
                              : "ID")}
                        </strong>{" "}
                        in the database — add a number after the
                        department code (e.g. <strong>SE003</strong>).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="
                px-6 py-4
                border-t
                border-slate-200
                bg-slate-50
                flex items-center
                justify-end
                gap-3
              ">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="
                    px-4 py-2.5
                    rounded-xl
                    bg-white
                    border border-slate-200
                    text-slate-700
                    text-sm
                    font-semibold
                    hover:bg-slate-100
                    transition-colors
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    px-5 py-2.5
                    rounded-xl
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    text-sm
                    font-semibold
                    flex items-center
                    gap-2
                    shadow-sm
                    shadow-blue-600/20
                    transition-colors
                  "
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      {editingEmployee
                        ? "Update Employee"
                        : "Save Employee"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW DETAILS MODAL
      ====================================================== */}
      {viewingEmployee && (
        <div className="
          fixed inset-0
          z-50
          bg-slate-900/40
          backdrop-blur-sm
          flex items-center
          justify-center
          p-4
        ">
          <div className="
            bg-white
            w-full
            max-w-lg
            rounded-2xl
            shadow-2xl
            overflow-hidden
            flex flex-col
          ">

            {/* Modal Header */}
            <div className="
              p-6
              bg-gradient-to-br
              from-blue-600
              to-indigo-700
              text-white
              relative
            ">
              <button
                onClick={() =>
                  setViewingEmployee(null)
                }
                className="
                  absolute
                  top-4 right-4
                  h-8 w-8
                  rounded-lg
                  bg-white/10
                  hover:bg-white/20
                  flex items-center
                  justify-center
                  transition-colors
                "
              >
                <X size={17} />
              </button>

              <div className="
                flex items-center
                gap-4
              ">
                <div className="
                  h-16 w-16
                  rounded-2xl
                  bg-white/15
                  border border-white/20
                  text-white
                  font-bold
                  text-2xl
                  flex items-center
                  justify-center
                  shadow-inner
                ">
                  {viewingEmployee.fullName
                    ? viewingEmployee.fullName
                      .charAt(0)
                      .toUpperCase()
                    : "E"}
                </div>

                <div>
                  <h2 className="
                    text-xl
                    font-bold
                  ">
                    {viewingEmployee.fullName}
                  </h2>

                  <p className="
                    text-blue-100
                    text-sm
                    mt-0.5
                  ">
                    {viewingEmployee.designation ||
                      viewingEmployee.role ||
                      "Employee"}
                  </p>

                  <span className="
                    inline-block
                    mt-2
                    font-mono
                    text-xs
                    font-bold
                    px-2.5 py-0.5
                    bg-white/20
                    rounded-md
                  ">
                    {viewingEmployee.employeeId ||
                      `EMP-${viewingEmployee.id}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="
              p-6
              space-y-4
              text-sm
            ">
              <div className="
                grid
                grid-cols-2
                gap-3
              ">
                <DetailItem
                  icon={<Mail size={15} />}
                  label="Email Address"
                  value={
                    viewingEmployee.email
                  }
                />

                <DetailItem
                  icon={<Phone size={15} />}
                  label="Phone Number"
                  value={
                    viewingEmployee.phone ||
                    viewingEmployee.phoneNumber ||
                    "—"
                  }
                />

                <DetailItem
                  icon={<Calendar size={15} />}
                  label="Birthday"
                  value={
                    viewingEmployee.dob ||
                    viewingEmployee.birthday ||
                    "—"
                  }
                />

                <DetailItem
                  icon={<Building2 size={15} />}
                  label="Department"
                  value={
                    viewingEmployee.departmentName ||
                    viewingEmployee.department ||
                    "—"
                  }
                />

                <DetailItem
                  icon={
                    <BriefcaseBusiness
                      size={15}
                    />
                  }
                  label="Job Role"
                  value={
                    viewingEmployee.designation ||
                    viewingEmployee.role ||
                    "—"
                  }
                />

                <DetailItem
                  icon={<UserCheck size={15} />}
                  label="Status"
                  value={
                    viewingEmployee.status ||
                    "ACTIVE"
                  }
                />
              </div>

              {viewingEmployee.joiningDate && (
                <div className="
                  bg-slate-50
                  p-3
                  rounded-xl
                  border
                  border-slate-100
                  text-xs
                  text-slate-500
                ">
                  Joined on:{" "}
                  <strong className="
                    text-slate-700
                  ">
                    {viewingEmployee.joiningDate}
                  </strong>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="
              px-6 py-4
              border-t
              border-slate-200
              bg-slate-50
              flex items-center
              justify-end
              gap-3
            ">
              <button
                onClick={() =>
                  setViewingEmployee(null)
                }
                className="
                  px-4 py-2
                  rounded-xl
                  bg-white
                  border border-slate-200
                  text-slate-700
                  text-sm
                  font-semibold
                  hover:bg-slate-100
                "
              >
                Close
              </button>

              <button
                onClick={() => {
                  const emp =
                    viewingEmployee;

                  setViewingEmployee(null);

                  handleEdit(emp);
                }}
                className="
                  px-4 py-2
                  rounded-xl
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  text-sm
                  font-semibold
                  flex items-center
                  gap-1.5
                "
              >
                <Edit3 size={14} />
                Edit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}
      {deleteTarget && (
        <div className="
          fixed inset-0
          z-50
          bg-slate-900/40
          backdrop-blur-sm
          flex items-center
          justify-center
          p-4
        ">
          <div className="
            bg-white
            w-full
            max-w-md
            rounded-2xl
            shadow-2xl
            p-6
          ">
            <div className="
              flex items-start
              gap-4
            ">
              <div className="
                h-11 w-11
                flex-shrink-0
                rounded-xl
                bg-red-50
                text-red-600
                flex items-center
                justify-center
              ">
                <AlertCircle size={22} />
              </div>

              <div>
                <h3 className="
                  text-base
                  font-bold
                  text-slate-900
                ">
                  Delete Employee?
                </h3>

                <p className="
                  text-sm
                  text-slate-500
                  mt-1
                  leading-relaxed
                ">
                  Are you sure you want to remove{" "}
                  <strong className="
                    text-slate-800
                  ">
                    {deleteTarget.fullName}
                  </strong>{" "}
                  ({deleteTarget.employeeId})?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="
              flex
              justify-end
              gap-3
              mt-6
            ">
              <button
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="
                  px-4 py-2.5
                  rounded-xl
                  bg-slate-100
                  hover:bg-slate-200
                  text-slate-700
                  text-sm
                  font-semibold
                  transition-colors
                "
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="
                  px-4 py-2.5
                  rounded-xl
                  bg-red-600
                  hover:bg-red-700
                  text-white
                  text-sm
                  font-semibold
                  flex items-center
                  gap-2
                  transition-colors
                "
              >
                <Trash2 size={15} />
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

// ─────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────

const TableHeader = ({
  children,
  className = "",
}) => (
  <div
    className={`
      text-[11px]
      font-bold
      uppercase
      tracking-wider
      text-white
      ${className}
    `}
  >
    {children}
  </div>
);

const SummaryCard = ({
  icon,
  title,
  value,
  description,
  className = "",
}) => (
  <div
    className={`
      bg-gradient-to-br
      from-teal-400
      to-emerald-500
      rounded-2xl
      p-5
      text-white
      shadow-sm
      hover:shadow-md
      transition-shadow
      ${className}
    `}
  >
    <div className="
      flex items-start
      justify-between
    ">
      <div>
        <p className="
          text-xs
          font-semibold
          uppercase
          tracking-wider
          text-white
        ">
          {title}
        </p>

        <p className="
          mt-2
          text-2xl
          font-bold
          text-white
        ">
          {value}
        </p>

        {description && (
          <p className="
            mt-1
            text-xs
            text-white/80
          ">
            {description}
          </p>
        )}
      </div>

      <div className="
        h-10 w-10
        rounded-xl
        bg-white/15
        text-white
        flex items-center
        justify-center
      ">
        {icon}
      </div>
    </div>
  </div>
);

const DetailItem = ({
  icon,
  label,
  value,
}) => (
  <div className="
    bg-slate-50
    p-3
    rounded-xl
    border
    border-slate-100
  ">
    <div className="
      flex items-center
      gap-1.5
      text-slate-400
      text-xs
    ">
      {icon}

      <span>{label}</span>
    </div>

    <p className="
      mt-1
      font-semibold
      text-slate-800
      text-sm
      truncate
    ">
      {value}
    </p>
  </div>
);

export default Employee;