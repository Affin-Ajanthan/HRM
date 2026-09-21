import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Search,
  X,
  Trash2,
  Edit3,
  Eye,
  Users,
  BriefcaseBusiness,
  ChevronRight,
  DollarSign,
  MoreVertical,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { PageLayout } from "../../components/PageLayout";
import NotificationPopup from "../../components/NotificationPopup.jsx";
import { hrApi } from "../../services/api";

const Department = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [editingDepartment, setEditingDepartment] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [deleteDepartment, setDeleteDepartment] = useState(null);

  const [openMenu, setOpenMenu] = useState(null);

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    shortCode: "",
    description: "",
    jobRoles: [
      {
        jobTitle: "",
        basicSalary: "",
      },
    ],
  });

  // ---------------------------------------------------------
  // AUTHENTICATION
  // ---------------------------------------------------------

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (
          parsedUser.role !== "HR_MANAGER" &&
          parsedUser.role !== "ADMIN"
        ) {
          navigate("/unauthorized");
          return;
        }

        setUser(parsedUser);
      } catch (error) {
        console.error("Invalid user data:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // ---------------------------------------------------------
  // FETCH DEPARTMENTS
  // ---------------------------------------------------------

  const fetchDepartments = async () => {
    setLoading(true);

    try {
      const response = await hrApi.getDepartments();

      setDepartments(response.data || []);
    } catch (error) {
      console.error("Failed to load departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchDepartments();
  }, [user]);

  // ---------------------------------------------------------
  // FORM HELPERS
  // ---------------------------------------------------------

  const resetForm = () => {
    setFormData({
      name: "",
      shortCode: "",
      description: "",
      jobRoles: [
        {
          jobTitle: "",
          basicSalary: "",
        },
      ],
    });

    setEditingDepartment(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    resetForm();
    setShowAddForm(false);
  };

  const handleDepartmentChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ---------------------------------------------------------
  // JOB ROLE FUNCTIONS
  // ---------------------------------------------------------

  const addJobRole = () => {
    setFormData((prev) => ({
      ...prev,
      jobRoles: [
        ...prev.jobRoles,
        {
          jobTitle: "",
          basicSalary: "",
        },
      ],
    }));
  };

  const removeJobRole = (index) => {
    if (formData.jobRoles.length === 1) return;

    setFormData((prev) => ({
      ...prev,
      jobRoles: prev.jobRoles.filter((_, i) => i !== index),
    }));
  };

  const updateJobRole = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      jobRoles: prev.jobRoles.map((role, i) =>
        i === index
          ? {
            ...role,
            [field]: value,
          }
          : role
      ),
    }));
  };

  // ---------------------------------------------------------
  // CREATE / UPDATE DEPARTMENT
  // ---------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    if (!formData.shortCode.trim()) {
      return;
    }

    const validJobRoles = formData.jobRoles.filter(
      (role) => role.jobTitle.trim() && role.basicSalary !== ""
    );

    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        shortCode: formData.shortCode.trim().toUpperCase(),
        description: formData.description.trim() || null,

        jobRoles: validJobRoles.map((role) => ({
          jobTitle: role.jobTitle.trim(),
          basicSalary: Number(role.basicSalary),
        })),
      };

      if (editingDepartment) {
        const response = await hrApi.updateDepartment(
          editingDepartment.id,
          payload
        );

        if (response?.data) {
          setDepartments((prev) =>
            prev.map((department) =>
              department.id === editingDepartment.id
                ? response.data
                : department
            )
          );
        }
      } else {
        const response = await hrApi.createDepartment(payload);

        if (response?.data) {
          setDepartments((prev) => [...prev, response.data]);
        }
      }

      await fetchDepartments();
      closeForm();
    } catch (error) {
      console.error("Failed to save department:", error);
      alert(error.message || "Failed to save department to database. Please check your backend connection.");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // EDIT DEPARTMENT
  // ---------------------------------------------------------

  const handleEdit = (department) => {
    setOpenMenu(null);

    setEditingDepartment(department);

    setFormData({
      name: department.name || "",
      shortCode:
        department.shortCode ||
        department.code ||
        "",
      description: department.description || "",
      jobRoles:
        department.jobRoles?.length > 0
          ? department.jobRoles.map((role) => ({
            jobTitle:
              role.jobTitle ||
              role.title ||
              "",
            basicSalary:
              role.basicSalary ??
              "",
          }))
          : [
            {
              jobTitle: "",
              basicSalary: "",
            },
          ],
    });

    setShowAddForm(true);
  };

  // ---------------------------------------------------------
  // DELETE DEPARTMENT
  // ---------------------------------------------------------

  const handleDelete = async () => {
    if (!deleteDepartment) return;

    try {
      await hrApi.deleteDepartment(deleteDepartment.id);

      setDepartments((prev) =>
        prev.filter(
          (department) =>
            department.id !== deleteDepartment.id
        )
      );

      await fetchDepartments();
      setDeleteDepartment(null);
    } catch (error) {
      console.error("Failed to delete department:", error);
      alert(error.message || "Failed to delete department.");
    }
  };

  // ---------------------------------------------------------
  // SEARCH
  // ---------------------------------------------------------

  const filteredDepartments = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return departments;

    return departments.filter((department) => {
      const name =
        department.name?.toLowerCase() || "";

      const code =
        (
          department.shortCode ||
          department.code ||
          ""
        ).toLowerCase();

      const description =
        department.description?.toLowerCase() || "";

      return (
        name.includes(search) ||
        code.includes(search) ||
        description.includes(search)
      );
    });
  }, [departments, searchTerm]);

  // ---------------------------------------------------------
  // SUMMARY DATA
  // ---------------------------------------------------------

  const totalDepartments = departments.length;

  const totalEmployees = departments.reduce(
    (total, department) =>
      total + (department.employeeCount || 0),
    0
  );

  const totalJobRoles = departments.reduce(
    (total, department) => {
      const count =
        department.jobRoleCount ??
        department.jobRoles?.length ??
        0;

      return total + count;
    },
    0
  );


  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (!user) return null;

  return (
    <PageLayout
      role="hr"
      activePage="Departments"
      title="Departments"
      subtitle="Manage your organization's departments and job roles"
      actions={
        <button
          onClick={openCreateForm}
          className="
            inline-flex items-center gap-2
            bg-teal-500 hover:bg-teal-600
            text-white
            px-4 py-2.5
            rounded-xl
            text-sm font-semibold
            shadow-sm
            shadow-teal-600/20
            transition-all
            duration-200
          "
        >
          <Plus size={17} strokeWidth={2.5} />
          Add Department
        </button>
      }
    >
      <div className="space-y-6">

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Total Departments */}
          <SummaryCard
              title="Total Departments"
              value={totalDepartments}
              className="bg-gradient-to-br from-green-400 to-emerald-500 text-white" />

          {/* Total Job Roles */}
          <SummaryCard
              title="Total Job Roles"
              value={totalJobRoles}
              className="bg-gradient-to-br from-orange-400 to-amber-500 text-white" />

          {/* Total Employees */}
          <SummaryCard
              title="Total Employees"
              value={totalEmployees}
              className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white" />

        </div>

        {/* =====================================================
            SEARCH / FILTER BAR
        ====================================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

          <div className="p-4 sm:p-5">

            <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">

              <div className="relative flex-1 max-w-xl">

                <Search
                  size={18}
                  className="
                    absolute left-3.5
                    top-1/2
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
                  placeholder="Search by department name or code..."
                  className="
                    w-full
                    pl-10 pr-10
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
                    transition-all
                  "
                />

                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="
                      absolute right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                      hover:text-slate-600
                    "
                  >
                    <X size={16} />
                  </button>
                )}

              </div>

              <div className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredDepartments.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {departments.length}
                </span>{" "}
                departments
              </div>

            </div>

          </div>
        </div>

        {/* =====================================================
            DEPARTMENT TABLE
        ====================================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-[2.2fr_1fr_1fr_1fr_140px] gap-4 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-b border-slate-200 rounded-t-2xl">

            <TableHeader>Department</TableHeader>
            <TableHeader>Code</TableHeader>
            <TableHeader>Job Roles</TableHeader>
            <TableHeader>Employees</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">

              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Loader2
                  size={22}
                  className="animate-spin"
                />
              </div>

              <p className="text-sm font-medium text-slate-700">
                Loading departments...
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Please wait a moment
              </p>

            </div>
          ) : filteredDepartments.length === 0 ? (

            /* Empty State */
            <div className="py-20 px-6 flex flex-col items-center justify-center text-center">

              <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-5">
                {searchTerm ? (
                  <Search size={28} />
                ) : (
                  <Building2 size={28} />
                )}
              </div>

              <h3 className="text-base font-bold text-slate-800">
                {searchTerm
                  ? "No departments found"
                  : "No departments yet"}
              </h3>

              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                {searchTerm
                  ? "Try changing your search term and search again."
                  : "Create your first department to start organizing your company."}
              </p>

              {!searchTerm && (
                <button
                  onClick={openCreateForm}
                  className="
                    mt-5
                    inline-flex items-center gap-2
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    px-4 py-2.5
                    rounded-xl
                    text-sm font-semibold
                    transition-colors
                  "
                >
                  <Plus size={16} />
                  Add Department
                </button>
              )}

            </div>
          ) : (

            /* Department Rows */
            <div className="divide-y divide-slate-100">

              {filteredDepartments.map((department, index) => {

                const code =
                  department.shortCode ||
                  department.code ||
                  `DPT-${department.id}`;

                const roleCount =
                  department.jobRoleCount ??
                  department.jobRoles?.length ??
                  0;

                const employeeCount =
                  department.employeeCount || 0;

                return (
                  <div
                    key={department.id}
                    className={`
                      group relative
                      px-4 sm:px-6
                      py-4
                      hover:bg-blue-50/40
                      transition-colors
                      ${openMenu === department.id ? "z-30" : "z-10"}
                    `}
                  >

                    {/* Desktop */}
                    <div className="hidden md:grid grid-cols-[2.2fr_1fr_1fr_1fr_140px] gap-4 items-center">

                      {/* Department */}
                      <div className="flex items-center gap-3 min-w-0">

                        <div className="
                          h-10 w-10
                          flex-shrink-0
                          rounded-xl
                          bg-blue-50
                          text-blue-600
                          flex items-center justify-center
                        ">
                          <Building2 size={19} />
                        </div>

                        <div className="min-w-0">

                          <button
                            onClick={() =>
                              setSelectedDepartment(department)
                            }
                            className="
                              text-sm font-semibold
                              text-slate-800
                              hover:text-blue-600
                              truncate
                              text-left
                              transition-colors
                            "
                          >
                            {department.name}
                          </button>

                          {department.description && (
                            <p className="
                              text-xs text-slate-400
                              mt-0.5
                              truncate
                              max-w-md
                            ">
                              {department.description}
                            </p>
                          )}

                        </div>

                      </div>

                      {/* Code */}
                      <div>
                        <span className="
                          inline-flex
                          px-2.5 py-1
                          rounded-lg
                          bg-slate-100
                          text-slate-600
                          text-xs
                          font-semibold
                        ">
                          {code}
                        </span>
                      </div>

                      {/* Job Roles */}
                      <div className="flex items-center gap-2">

                        <div className="
                          h-8 w-8
                          rounded-lg
                          bg-blue-50
                          text-blue-600
                          flex items-center justify-center
                        ">
                          <BriefcaseBusiness size={15} />
                        </div>

                        <span className="text-sm font-semibold text-slate-700">
                          {roleCount}
                        </span>

                      </div>

                      {/* Employees */}
                      <div className="flex items-center gap-2">

                        <div className="
                          h-8 w-8
                          rounded-lg
                          bg-slate-100
                          text-slate-500
                          flex items-center justify-center
                        ">
                          <Users size={15} />
                        </div>

                        <span className="text-sm font-semibold text-slate-700">
                          {employeeCount}
                        </span>

                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1 relative">

                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedDepartment(department)
                          }
                          title="View Details"
                          aria-label="View Details"
                          className="
                            h-8 w-8
                            rounded-lg
                            flex items-center justify-center
                            text-slate-400
                            hover:text-blue-600
                            hover:bg-blue-50
                            transition-colors
                          "
                        >
                          <Eye size={16} />
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(department)
                          }
                          title="Edit Department"
                          aria-label="Edit Department"
                          className="
                            h-8 w-8
                            rounded-lg
                            flex items-center justify-center
                            text-slate-400
                            hover:text-amber-600
                            hover:bg-amber-50
                            transition-colors
                          "
                        >
                          <Edit3 size={16} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteDepartment(department)
                          }
                          title="Delete Department"
                          aria-label="Delete Department"
                          className="
                            h-8 w-8
                            rounded-lg
                            flex items-center justify-center
                            text-slate-400
                            hover:text-red-600
                            hover:bg-red-50
                            transition-colors
                          "
                        >
                          <Trash2 size={16} />
                        </button>

                        {/* Side Menu Button Dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenu(
                                openMenu === department.id
                                  ? null
                                  : department.id
                              )
                            }
                            title="More Options"
                            aria-label="More Options"
                            className={`
                              h-8 w-8
                              rounded-lg
                              flex items-center justify-center
                              transition-colors
                              ${
                                openMenu === department.id
                                  ? "text-blue-600 bg-blue-50"
                                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              }
                            `}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {openMenu === department.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenMenu(null)}
                              />
                              <DepartmentMenu
                                openUpwards={
                                  filteredDepartments.length > 2 &&
                                  index >= filteredDepartments.length - 2
                                }
                                onView={() => {
                                  setSelectedDepartment(department);
                                  setOpenMenu(null);
                                }}
                                onEdit={() => {
                                  handleEdit(department);
                                  setOpenMenu(null);
                                }}
                                onDelete={() => {
                                  setDeleteDepartment(department);
                                  setOpenMenu(null);
                                }}
                              />
                            </>
                          )}
                        </div>

                      </div>

                    </div>

                    {/* Mobile */}
                    <div className="md:hidden">

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex items-center gap-3 min-w-0">

                          <div className="
                            h-11 w-11
                            flex-shrink-0
                            rounded-xl
                            bg-blue-50
                            text-blue-600
                            flex items-center justify-center
                          ">
                            <Building2 size={20} />
                          </div>

                          <div className="min-w-0">

                            <button
                              onClick={() =>
                                setSelectedDepartment(
                                  department
                                )
                              }
                              className="
                                font-semibold
                                text-slate-800
                                text-sm
                                truncate
                                text-left
                              "
                            >
                              {department.name}
                            </button>

                            <p className="text-xs text-slate-400 mt-0.5">
                              {code}
                            </p>

                          </div>

                        </div>

                        {/* Mobile Side Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenu(
                                openMenu === department.id
                                  ? null
                                  : department.id
                              )
                            }
                            className={`
                              h-9 w-9
                              flex-shrink-0
                              rounded-lg
                              flex items-center justify-center
                              transition-colors
                              ${
                                openMenu === department.id
                                  ? "text-blue-600 bg-blue-50"
                                  : "text-slate-400 hover:bg-slate-100"
                              }
                            `}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openMenu === department.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenMenu(null)}
                              />
                              <DepartmentMenu
                                mobile
                                onView={() => {
                                  setSelectedDepartment(
                                    department
                                  );
                                  setOpenMenu(null);
                                }}
                                onEdit={() => {
                                  handleEdit(department);
                                  setOpenMenu(null);
                                }}
                                onDelete={() => {
                                  setDeleteDepartment(
                                    department
                                  );
                                  setOpenMenu(null);
                                }}
                              />
                            </>
                          )}
                        </div>

                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">

                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-400">
                            Job Roles
                          </p>
                          <p className="text-base font-bold text-slate-800 mt-1">
                            {roleCount}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-400">
                            Employees
                          </p>
                          <p className="text-base font-bold text-slate-800 mt-1">
                            {employeeCount}
                          </p>
                        </div>

                      </div>

                      {/* Mobile Visible Action Buttons */}
                      <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-slate-100">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedDepartment(department)
                          }
                          className="
                            flex-1 py-2 px-2.5
                            rounded-xl
                            bg-slate-50 hover:bg-blue-50
                            text-slate-600 hover:text-blue-600
                            border border-slate-200
                            text-xs font-semibold
                            flex items-center justify-center gap-1.5
                            transition-colors
                          "
                        >
                          <Eye size={14} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(department)
                          }
                          className="
                            flex-1 py-2 px-2.5
                            rounded-xl
                            bg-slate-50 hover:bg-amber-50
                            text-slate-600 hover:text-amber-600
                            border border-slate-200
                            text-xs font-semibold
                            flex items-center justify-center gap-1.5
                            transition-colors
                          "
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteDepartment(department)
                          }
                          className="
                            flex-1 py-2 px-2.5
                            rounded-xl
                            bg-slate-50 hover:bg-red-50
                            text-slate-600 hover:text-red-600
                            border border-slate-200
                            text-xs font-semibold
                            flex items-center justify-center gap-1.5
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
          ADD / EDIT DEPARTMENT MODAL
      ====================================================== */}

      {showAddForm && (
        <div className="
          fixed inset-0 z-50
          bg-slate-900/40
          backdrop-blur-sm
          flex items-center justify-center
          p-4
        ">

          <div className="
            bg-white
            w-full max-w-3xl
            max-h-[92vh]
            overflow-hidden
            rounded-2xl
            shadow-2xl
            flex flex-col
          ">

            {/* Modal Header */}
            <div className="
              px-6 py-5
              border-b border-slate-200
              flex items-center justify-between
            ">

              <h2 className="text-lg font-bold text-slate-900">
                {editingDepartment
                  ? "Edit Department"
                  : "Add Department"}
              </h2>

              <button
                onClick={closeForm}
                className="
                  h-9 w-9
                  rounded-lg
                  flex items-center justify-center
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
              className="flex flex-col min-h-0"
            >

              <div className="
                overflow-y-auto
                p-6
                space-y-7
              ">

                {/* Department Information */}
                <section>

                  <SectionTitle
                    number="01"
                    title="Department Information"
                    description="Basic information about the department"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

                    {/* Name */}
                    <div className="md:col-span-2">

                      <label className="form-label">
                        Department Name
                        <span className="text-red-500 ml-1">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleDepartmentChange(
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Software Engineering"
                        required
                        className="form-input"
                      />

                    </div>

                    {/* Code */}
                    <div>

                      <label className="form-label">
                        Department Code
                        <span className="text-red-500 ml-1">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        value={formData.shortCode}
                        onChange={(e) =>
                          handleDepartmentChange(
                            "shortCode",
                            e.target.value
                          )
                        }
                        placeholder="e.g. SE"
                        required
                        maxLength={10}
                        className="form-input uppercase"
                      />

                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">

                      <label className="form-label">
                        Description
                        <span className="
                          text-slate-400
                          font-normal
                          normal-case
                          ml-2
                        ">
                          Optional
                        </span>
                      </label>

                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleDepartmentChange(
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Briefly describe the purpose of this department..."
                        rows={3}
                        className="
                          form-input
                          resize-none
                        "
                      />

                    </div>

                  </div>

                </section>

                {/* Job Roles */}
                <section>

                  <div className="
                    flex flex-col sm:flex-row
                    sm:items-end
                    sm:justify-between
                    gap-3
                  ">

                    <SectionTitle
                      number="02"
                      title="Job Roles"
                    />

                    <span className="
                      inline-flex
                      items-center
                      w-fit
                      px-2.5 py-1
                      rounded-lg
                      bg-blue-50
                      text-blue-600
                      text-xs
                      font-semibold
                    ">
                      {formData.jobRoles.length}{" "}
                      {formData.jobRoles.length === 1
                        ? "Role"
                        : "Roles"}
                    </span>

                  </div>

                  <div className="space-y-4 mt-5">

                    {formData.jobRoles.map(
                      (role, index) => (
                        <div
                          key={index}
                          className="
                            rounded-2xl
                            border border-slate-200
                            bg-slate-50/60
                            p-5
                          "
                        >

                          <div className="
                            flex items-center
                            justify-between
                            mb-4
                          ">

                            <div className="flex items-center gap-2.5">

                              <div className="
                                h-8 w-8
                                rounded-lg
                                bg-white
                                border border-slate-200
                                text-blue-600
                                flex items-center justify-center
                              ">
                                <BriefcaseBusiness
                                  size={15}
                                />
                              </div>

                              <span className="
                                text-sm
                                font-semibold
                                text-slate-700
                              ">
                                Job Role {index + 1}
                              </span>

                            </div>

                            {formData.jobRoles.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeJobRole(index)
                                }
                                className="
                                  inline-flex
                                  items-center gap-1.5
                                  text-xs
                                  font-semibold
                                  text-red-500
                                  hover:text-red-600
                                  hover:bg-red-50
                                  px-2.5 py-1.5
                                  rounded-lg
                                  transition-colors
                                "
                              >
                                <Trash2 size={13} />
                                Remove
                              </button>
                            )}

                          </div>

                          <div className="
                            grid grid-cols-1
                            md:grid-cols-2
                            gap-4
                          ">

                            {/* Job Title */}
                            <div>

                              <label className="form-label">
                                Job Title
                                <span className="text-red-500 ml-1">
                                  *
                                </span>
                              </label>

                              <input
                                type="text"
                                value={role.jobTitle}
                                onChange={(e) =>
                                  updateJobRole(
                                    index,
                                    "jobTitle",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. Software Engineer"
                                className="form-input bg-white"
                              />

                            </div>

                            {/* Basic Salary */}
                            <div>

                              <label className="form-label">
                                Basic Salary
                                <span className="text-red-500 ml-1">
                                  *
                                </span>
                              </label>

                              <div className="relative">

                                <span className="
                                  absolute
                                  left-3.5
                                  top-1/2
                                  -translate-y-1/2
                                  text-xs
                                  font-semibold
                                  text-slate-400
                                ">
                                  Rs.
                                </span>

                                <input
                                  type="number"
                                  min="0"
                                  value={role.basicSalary}
                                  onChange={(e) =>
                                    updateJobRole(
                                      index,
                                      "basicSalary",
                                      e.target.value
                                    )
                                  }
                                  placeholder="150000"
                                  className="
                                    form-input
                                    bg-white
                                    pl-11
                                  "
                                />

                              </div>

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                  {/* Add Role */}
                  <button
                    type="button"
                    onClick={addJobRole}
                    className="
                      mt-4
                      w-full
                      border-2
                      border-dashed
                      border-blue-200
                      hover:border-blue-400
                      hover:bg-blue-50/50
                      text-blue-600
                      py-3
                      rounded-xl
                      text-sm
                      font-semibold
                      flex items-center
                      justify-center gap-2
                      transition-all
                    "
                  >
                    <Plus size={17} />
                    Add Another Job Role
                  </button>

                </section>

              </div>

              {/* Modal Footer */}
              <div className="
                px-6 py-4
                border-t border-slate-200
                bg-slate-50/70
                flex flex-col-reverse
                sm:flex-row
                sm:justify-end
                gap-3
              ">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="
                    px-5 py-2.5
                    rounded-xl
                    bg-white
                    border border-slate-200
                    text-slate-700
                    text-sm
                    font-semibold
                    hover:bg-slate-100
                    disabled:opacity-50
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
                    shadow-sm
                    shadow-blue-600/20
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    flex items-center
                    justify-center gap-2
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
                      {editingDepartment
                        ? "Update Department"
                        : "Save Department"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* =====================================================
          DEPARTMENT DETAILS MODAL
      ====================================================== */}

      {selectedDepartment && (
        <DepartmentDetailsModal
          department={selectedDepartment}
          onClose={() =>
            setSelectedDepartment(null)
          }
          onEdit={() => {
            setSelectedDepartment(null);
            handleEdit(selectedDepartment);
          }}
        />
      )}

      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {deleteDepartment && (
        <div className="
          fixed inset-0 z-[60]
          bg-slate-900/40
          backdrop-blur-sm
          flex items-center justify-center
          p-4
        ">

          <div className="
            bg-white
            w-full max-w-md
            rounded-2xl
            shadow-2xl
            p-6
          ">

            <div className="flex items-start gap-4">

              <div className="
                h-11 w-11
                flex-shrink-0
                rounded-xl
                bg-red-50
                text-red-600
                flex items-center justify-center
              ">
                <AlertCircle size={21} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Department?
                </h3>

                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-700">
                    {deleteDepartment.name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

            </div>

            <div className="
              flex flex-col-reverse
              sm:flex-row
              sm:justify-end
              gap-3
              mt-6
            ">

              <button
                onClick={() =>
                  setDeleteDepartment(null)
                }
                className="
                  px-4 py-2.5
                  rounded-xl
                  bg-slate-100
                  hover:bg-slate-200
                  text-slate-700
                  text-sm font-semibold
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
                  text-sm font-semibold
                  flex items-center
                  justify-center gap-2
                "
              >
                <Trash2 size={15} />
                Delete Department
              </button>

            </div>

          </div>
        </div>
      )}

      <NotificationPopup
        isOpen={showNotifications}
        onClose={() =>
          setShowNotifications(false)
        }
      />

    </PageLayout>
  );
};

// =============================================================
// SUMMARY CARD
// =============================================================

const SummaryCard = ({
  icon,
  title,
  value,
  description,
}) => {
  return (
    <div className="
        bg-gradient-to-br from-teal-400 to-emerald-500
        rounded-2xl
        border border-slate-200
        p-5
        shadow-sm
        hover:shadow-md
        transition-shadow
        text-white
      ">

      <div className={icon ? "flex items-start justify-between" : ""}>

        <div>

          <p className="
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-slate-500
          ">
            {title}
          </p>

          <p className="
            mt-2
            text-2xl
            font-bold
            text-slate-900
          ">
            {value}
          </p>

          {description && (
            <p className="
              mt-1
              text-xs
              text-slate-400
            ">
              {description}
            </p>
          )}

        </div>

        {icon && (
          <div className="
            h-10 w-10
            rounded-xl
            bg-blue-50
            text-blue-600
            flex items-center
            justify-center
          ">
            {icon}
          </div>
        )}

      </div>

    </div>
  );
};

// =============================================================
// TABLE HEADER
// =============================================================

const TableHeader = ({ children, className = "" }) => {
  return (
    <div className={`
      text-[11px]
      font-bold
      uppercase
      tracking-wider
      text-slate-500
      ${className}
    `}>
      {children}
    </div>
  );
};

// =============================================================
// SECTION TITLE
// =============================================================

const SectionTitle = ({
  number,
  title,
  description,
}) => {
  return (
    <div className="flex items-start gap-3">

      <div className="
        h-8 w-8
        flex-shrink-0
        rounded-lg
        bg-blue-600
        text-white
        flex items-center
        justify-center
        text-[10px]
        font-bold
      ">
        {number}
      </div>

      <div>

        <h3 className="
          text-sm
          font-bold
          text-slate-800
        ">
          {title}
        </h3>

        <p className="
          text-xs
          text-slate-400
          mt-0.5
        ">
          {description}
        </p>

      </div>

    </div>
  );
};

// =============================================================
// DEPARTMENT MENU
// =============================================================

const DepartmentMenu = ({
  onView,
  onEdit,
  onDelete,
  mobile = false,
  openUpwards = false,
}) => {
  return (
    <div className={`
      ${
        mobile
          ? "absolute right-0 top-11 w-48"
          : `absolute right-0 ${openUpwards ? "bottom-10" : "top-10"} w-48`
      }
      z-50
      bg-white
      rounded-xl
      border border-slate-200
      shadow-xl
      py-1
    `}>

      <button
        type="button"
        onClick={onView}
        className="
          w-full
          px-4 py-2.5
          flex items-center gap-2.5
          text-sm
          text-slate-700
          hover:bg-blue-50
          hover:text-blue-600
          text-left
          transition-colors
        "
      >
        <Eye size={15} />
        View Department
      </button>

      <button
        type="button"
        onClick={onEdit}
        className="
          w-full
          px-4 py-2.5
          flex items-center gap-2.5
          text-sm
          text-slate-700
          hover:bg-amber-50
          hover:text-amber-600
          text-left
          transition-colors
        "
      >
        <Edit3 size={15} />
        Edit Department
      </button>

      <div className="border-t border-slate-100 my-1" />

      <button
        type="button"
        onClick={onDelete}
        className="
          w-full
          px-4 py-2.5
          flex items-center gap-2.5
          text-sm
          text-red-600
          hover:bg-red-50
          text-left
          transition-colors
        "
      >
        <Trash2 size={15} />
        Delete Department
      </button>

    </div>
  );
};

// =============================================================
// DEPARTMENT DETAILS MODAL
// =============================================================

const DepartmentDetailsModal = ({
  department,
  onClose,
  onEdit,
}) => {
  const jobRoles = department.jobRoles || [];

  const roleCount =
    department.jobRoleCount ??
    jobRoles.length ??
    0;

  const employeeCount =
    department.employeeCount || 0;

  return (
    <div className="
      fixed inset-0 z-50
      bg-slate-900/40
      backdrop-blur-sm
      flex items-center justify-center
      p-4
    ">

      <div className="
        bg-white
        w-full max-w-3xl
        max-h-[90vh]
        rounded-2xl
        shadow-2xl
        overflow-hidden
        flex flex-col
      ">

        {/* Header */}
        <div className="
          p-6
          bg-gradient-to-br
          from-blue-600
          to-blue-700
          text-white
        ">

          <div className="
            flex items-start
            justify-between
          ">

            <div className="flex items-center gap-4">

              <div className="
                h-14 w-14
                rounded-2xl
                bg-white/15
                border border-white/20
                flex items-center
                justify-center
              ">
                <Building2 size={27} />
              </div>

              <div>

                <h2 className="
                  text-xl
                  font-bold
                ">
                  {department.name}
                </h2>

                <p className="
                  text-blue-100
                  text-sm
                  mt-0.5
                ">
                  {department.shortCode ||
                    department.code ||
                    `DPT-${department.id}`}
                </p>

              </div>

            </div>

            <button
              onClick={onClose}
              className="
                h-9 w-9
                rounded-lg
                bg-white/10
                hover:bg-white/20
                flex items-center
                justify-center
              "
            >
              <X size={18} />
            </button>

          </div>

          {department.description && (
            <p className="
              text-sm
              text-blue-100
              mt-5
              max-w-2xl
              leading-relaxed
            ">
              {department.description}
            </p>
          )}

        </div>

        {/* Content */}
        <div className="
          overflow-y-auto
          p-6
          space-y-6
        ">

          {/* Statistics */}
          <div className="
            grid grid-cols-2
            md:grid-cols-3
            gap-3
          ">

            <DetailStat
              icon={<BriefcaseBusiness size={17} />}
              label="Job Roles"
              value={roleCount}
            />

            <DetailStat
              icon={<Users size={17} />}
              label="Employees"
              value={employeeCount}
            />

            <DetailStat
              icon={<DollarSign size={17} />}
              label="Department"
              value={
                department.shortCode ||
                department.code ||
                "—"
              }
            />

          </div>

          {/* Job Roles */}
          <div>

            <div className="
              flex items-center
              justify-between
              mb-4
            ">

              <div>
                <h3 className="
                  text-base
                  font-bold
                  text-slate-800
                ">
                  Job Roles
                </h3>

                <p className="
                  text-xs
                  text-slate-400
                  mt-0.5
                ">
                  Roles defined under this department
                </p>
              </div>

            </div>

            {jobRoles.length > 0 ? (
              <div className="
                border border-slate-200
                rounded-xl
                overflow-hidden
              ">

                {jobRoles.map((role, index) => (
                  <div
                    key={role.id || index}
                    className="
                      flex items-center
                      justify-between
                      gap-4
                      px-4 py-4
                      border-b
                      last:border-b-0
                      border-slate-100
                    "
                  >

                    <div className="flex items-center gap-3">

                      <div className="
                        h-9 w-9
                        rounded-lg
                        bg-blue-50
                        text-blue-600
                        flex items-center
                        justify-center
                      ">
                        <BriefcaseBusiness
                          size={16}
                        />
                      </div>

                      <div>

                        <p className="
                          text-sm
                          font-semibold
                          text-slate-800
                        ">
                          {role.jobTitle ||
                            role.title}
                        </p>

                        <p className="
                          text-xs
                          text-slate-400
                          mt-0.5
                        ">
                          Job Role {index + 1}
                        </p>

                      </div>

                    </div>

                    <div className="text-right">

                      <p className="
                        text-xs
                        text-slate-400
                      ">
                        Basic Salary
                      </p>

                      <p className="
                        text-sm
                        font-bold
                        text-slate-800
                        mt-0.5
                      ">
                        Rs.{" "}
                        {Number(
                          role.basicSalary || 0
                        ).toLocaleString()}
                      </p>

                    </div>

                  </div>
                ))}

              </div>
            ) : (
              <div className="
                py-10
                rounded-xl
                bg-slate-50
                border border-slate-200
                text-center
              ">
                <BriefcaseBusiness
                  size={24}
                  className="
                    mx-auto
                    text-slate-300
                    mb-2
                  "
                />

                <p className="
                  text-sm
                  font-medium
                  text-slate-600
                ">
                  No job roles defined
                </p>

              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="
          px-6 py-4
          border-t border-slate-200
          bg-slate-50
          flex justify-end gap-3
        ">

          <button
            onClick={onClose}
            className="
              px-4 py-2.5
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
            onClick={onEdit}
            className="
              px-4 py-2.5
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              text-sm
              font-semibold
              flex items-center
              gap-2
            "
          >
            <Edit3 size={15} />
            Edit Department
          </button>

        </div>

      </div>

    </div>
  );
};

// =============================================================
// DETAIL STAT
// =============================================================

const DetailStat = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="
      bg-slate-50
      border border-slate-200
      rounded-xl
      p-4
    ">

      <div className="
        flex items-center
        gap-2
        text-slate-400
      ">
        {icon}

        <span className="
          text-xs
          font-medium
        ">
          {label}
        </span>
      </div>

      <p className="
        mt-2
        text-lg
        font-bold
        text-slate-800
      ">
        {value}
      </p>

    </div>
  );
};

export default Department;