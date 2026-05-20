import { startTransition, useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext, Link } from "react-router-dom";
import { FaTrash, FaDownload } from "react-icons/fa"; // Added FaDownload for mobile
import { getRoleLabel, normalizeRole, ROLES } from "../utils/roles";

const ROLE_FILTERS = [
  { value: "", label: "All Roles" },
  { value: ROLES.EMPLOYEE, label: getRoleLabel(ROLES.EMPLOYEE) },
  { value: ROLES.TEAM_LEAD, label: getRoleLabel(ROLES.TEAM_LEAD) },
  { value: ROLES.MANAGER, label: getRoleLabel(ROLES.MANAGER) },
];

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const { search = "" } = useOutletContext() || {};
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const itemsPerPage = 8;

  const BACKEND_BASE_URL = "http://localhost:8080";

  const getAvatarUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${BACKEND_BASE_URL}${url}`;
  };

  async function fetchEmployees() {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await axios.get(`${BACKEND_BASE_URL}/api/admin/employees/overview`, {
        auth: { username: user.email, password: user.password }
      });
      startTransition(() => { setEmployees(res.data); });
    } catch (error) {
      console.error("Fetch Employees Error:", error);
    }
  }

  useEffect(() => { fetchEmployees(); }, []);

  // 1. Logic Fix: This now only opens the modal
  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  // 2. Logic Fix: This actually performs the deletion
  const executeDelete = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await axios.delete(`${BACKEND_BASE_URL}/api/admin/employees/${deleteId}`, {
        auth: { username: user.email, password: user.password }
      });
      setEmployees((prev) => prev.filter((emp) => emp.employeeId !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Delete Error:", error);
      setDeleteId(null);
    }
  };

  const handleDownloadReport = async (employeeId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await axios.get(
        `${BACKEND_BASE_URL}/api/admin/reports/employee/${employeeId}`,
        {
          responseType: "blob",
          auth: { username: user.email, password: user.password }
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `employee_${employeeId}_report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const searchTerm = (search || "").toLowerCase();
    const name = (emp.name || "").toLowerCase();
    const email = (emp.email || "").toLowerCase();
    const roleValue = normalizeRole(emp.role || "");
    const roleMatches = !roleFilter || roleValue === normalizeRole(roleFilter);
    return roleValue !== ROLES.ADMIN && roleMatches && (name.includes(searchTerm) || email.includes(searchTerm));
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const paginatedEmployees = filteredEmployees.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 font-sans dark:bg-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-full flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">Employees</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage accounts and reports.</p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <label className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {ROLE_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* TABLE VIEW: Hidden on mobile, visible on medium screens+ */}
        <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400 dark:border-slate-800">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-center">Progress</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs dark:divide-slate-800">
                {paginatedEmployees.map((emp) => (
                  <tr key={emp.employeeId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/admin/employees/${emp.employeeId}`} className="font-bold text-slate-800 hover:text-blue-600 dark:text-slate-200">
                        {emp.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{emp.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] dark:bg-slate-800">{getRoleLabel(emp.role)}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold">{emp.completed || 0} / {emp.totalSkills || 0}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleDownloadReport(emp.employeeId)} className="text-blue-600 px-2 py-1 border border-blue-100 rounded-lg">Report</button>
                        <button onClick={() => handleDeleteClick(emp.employeeId)} className="text-red-500 p-1.5 border border-red-100 rounded-lg"><FaTrash size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE VIEW: Visible only on small screens */}
        <div className="space-y-4 md:hidden">
          {paginatedEmployees.map((emp) => (
            <div key={emp.employeeId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {emp.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold dark:text-white">{emp.name}</p>
                    <p className="text-xs text-slate-500">{getRoleLabel(emp.role)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Added Report Download for Mobile */}
                  <button onClick={() => handleDownloadReport(emp.employeeId)} className="p-2 bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900/30">
                    <FaDownload size={14} />
                  </button>
                  <button onClick={() => handleDeleteClick(emp.employeeId)} className="p-2 bg-red-50 text-red-500 rounded-full dark:bg-red-900/30">
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-500 border-t pt-2 dark:border-slate-700">
                Email: <span className="text-slate-900 dark:text-slate-200">{emp.email}</span>
              </div>
            </div>
          ))}
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full">
              <h2 className="text-xl font-bold mb-2 dark:text-white">Confirm Delete</h2>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                This action cannot be undone. Are you sure you want to delete this employee?
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-medium">
                  Cancel
                </button>
                <button onClick={executeDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">
                  Delete Employee
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <button 
              disabled={activePage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="text-sm disabled:opacity-50"
            >Previous</button>
            <span className="text-sm">Page {activePage} of {totalPages}</span>
            <button 
              disabled={activePage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="text-sm disabled:opacity-50"
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;
