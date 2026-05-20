import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaCopy, FaTrash, FaRedo, FaEnvelope, FaList } from "react-icons/fa";
import { getRoleLabel, INVITE_ROLES } from "../utils/roles";

const InviteEmployee = () => {
  const [form, setForm] = useState({
    email: "",
    name: "",
    mobileNumber: "",
    designation: "",
    role: "EMPLOYEE",
    department: "",
    supervisorId: ""
  });
  const [invites, setInvites] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // ✅ Get user from localStorage for Auth headers
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const authHeader = useMemo(
    () => ({
      auth: {
        username: user.email,
        password: user.password
      }
    }),
    [user.email, user.password]
  );

  const normalizeRole = (role) => String(role || "").trim().toUpperCase().replace(/\s+/g, "_");

  const getSupervisorRole = (role) => {
    const normalized = normalizeRole(role);
    if (normalized === "EMPLOYEE") return "TEAM_LEAD";
    if (normalized === "TEAM_LEAD") return "MANAGER";
    return null;
  };

  const getSupervisorLabel = (role) => {
    const normalized = normalizeRole(role);
    if (normalized === "EMPLOYEE") return "Team Lead";
    if (normalized === "TEAM_LEAD") return "Manager";
    return "Supervisor";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
      ...(name === "role" ? { supervisorId: "" } : {})
    });
  };

  const fetchSupervisors = useCallback(async () => {
    const supervisorRole = getSupervisorRole(form.role);
    if (!supervisorRole) {
      setSupervisors([]);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8080/api/employee/supervisors?role=${supervisorRole}`,
        authHeader
      );
      setSupervisors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch supervisors", err);
      setSupervisors([]);
    }
  }, [authHeader, form.role]);

  // 🔄 Fetch All Invites
  const fetchInvites = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/invites", authHeader);
      setInvites(Array.isArray(res.data) ? res.data : []);
    } catch {
      console.error("Failed to fetch invites");
      // Don't toast error on first load if it's just a 401/empty
    }
  }, [authHeader]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  useEffect(() => {
    fetchSupervisors();
  }, [fetchSupervisors]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const totalPages = Math.max(1, Math.ceil(invites.length / itemsPerPage));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedInvites = invites.slice(
    (visiblePage - 1) * itemsPerPage,
    visiblePage * itemsPerPage
  );

  // 📩 Send New Invite
  const handleInvite = async () => {
    // const requireSupervisor = form.role === "EMPLOYEE" || form.role === "TEAM_LEAD";

    // if (!form.email || !form.name || !form.mobileNumber || !form.designation || !form.role || !form.department || (requireSupervisor && !form.supervisorId)) {
    //   return toast.error("Please fill all invite details");
    // }

    if (!form.email || !form.name || !form.mobileNumber || !form.designation || !form.role || !form.department) {
  return toast.error("Please fill all invite details");
}

    try {
      await axios.post(
        "http://localhost:8080/api/admin/invite",
        {
          ...form,
          supervisorId: form.supervisorId ? Number(form.supervisorId) : null
        },
        authHeader
      );
      toast.success("Invite sent!");
      setForm({
        email: "",
        name: "",
        mobileNumber: "",
        designation: "",
        role: "EMPLOYEE",
        department: "",
        supervisorId: ""
      });
      setCurrentPage(1);
      fetchInvites();
    } catch {
      toast.error("Failed to send invite. Check admin permissions.");
    }
  };

  // 📋 Copy Link to Clipboard
  const copyLink = (token) => {
    if (!token) return toast.error("No token available");
    const link = `http://localhost:5173/register?token=${token}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link)
        .then(() => toast.success("Link copied!"))
        .catch(() => toast.error("Failed to copy link"));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Link copied!");
      } catch {
        toast.error("Manual copy required");
      }
      document.body.removeChild(textArea);
    }
  };

  // 🗑️ Delete Invite
  const deleteInvite = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this invite?")) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/admin/invite/${id}`, authHeader);
      toast.success("Invite deleted");
      fetchInvites();
    } catch {
      toast.error("Delete failed");
    }
  };

  // 🔄 Resend Invite
  const resendInvite = async (id) => {
    try {
      await axios.post(`http://localhost:8080/api/admin/invite/resend/${id}`, {}, authHeader);
      toast.success("Invite resent successfully!");
      fetchInvites();
    } catch {
      toast.error("Resend failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] p-4 md:p-10 transition-colors duration-300">
      <Toaster position="top-right" />

      {/* Header Area */}
      <div className="mb-8 ml-2 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
           <p className="text-gray-500 dark:text-gray-400">Manage employee invitations</p>
        </div>
        <button 
          onClick={fetchInvites}
          className="p-2 text-gray-500 hover:text-indigo-500 transition-colors"
        >
          <FaRedo size={20} className="hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      <div className="flex flex-col gap-8 w-full">
        {/* 1. Invite Form */}
        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-3">
            <FaEnvelope className="text-indigo-500" /> Invite New Employee
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="w-full">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl dark:bg-[#0f172a] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="w-full">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl dark:bg-[#0f172a] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="w-full">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                placeholder="9876543210"
                value={form.mobileNumber}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl dark:bg-[#0f172a] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="w-full">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Designation</label>
              <input
                type="text"
                name="designation"
                placeholder="Software Engineer"
                value={form.designation}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl dark:bg-[#0f172a] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="w-full">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl dark:bg-[#0f172a] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                {INVITE_ROLES.map((role) => (
                  <option key={role} value={role}>{getRoleLabel(role)}</option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Department</label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl dark:bg-[#0f172a] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="">Select Dept</option>
                <option value="Engineering">Engineering</option>
                <option value="IT">IT</option>
              </select>
            </div>

            {/* {(form.role === "EMPLOYEE" || form.role === "TEAM_LEAD") && (
              <div className="w-full">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">{getSupervisorLabel(form.role)}</label>
                <select
                  name="supervisorId"
                  value={form.supervisorId}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-xl dark:bg-[#0f172a] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">Select {getSupervisorLabel(form.role)}</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.id || supervisor.employeeId} value={supervisor.id || supervisor.employeeId}>
                      {supervisor.name} ({getRoleLabel(supervisor.role)})
                    </option>
                  ))}
                </select>
              </div>
            )} */}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleInvite}
              className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg"
            >
              Send Invitation
            </button>
          </div>
        </div>

        {/* 2. Table */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-3">
              <FaList className="text-indigo-500" /> Recent Invites
            </h2>
              <span className="text-xs font-bold px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
              {invites.length} Total
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#1e293b]/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">
                  <th className="px-8 py-5">Employee Email</th>
                  <th className="px-8 py-5">Name</th>
                  <th className="px-8 py-5">Mobile</th>
                  <th className="px-8 py-5">Designation</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5">Reports To</th>
                  <th className="px-8 py-5">Department</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedInvites.length > 0 ? (
                  paginatedInvites.map((invite, index) => (
                    <tr key={invite.id || invite._id || index} className="hover:bg-gray-50 dark:hover:bg-[#2d3a4f] transition-colors">
                      <td className="px-8 py-5 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {invite.email || "No Email Provided"}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600 dark:text-gray-300">
                        {invite.name || "Not assigned"}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600 dark:text-gray-300">
                        {invite.mobileNumber || "Not assigned"}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600 dark:text-gray-300">
                        {invite.designation || "Not assigned"}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600 dark:text-gray-300">
                        {getRoleLabel(invite.role)}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600 dark:text-gray-300">
                        {invite.supervisorId || "Top level"}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600 dark:text-gray-300">
                        {invite.department || "Not assigned"}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-4 py-1.5 text-xs font-bold rounded-full ${
                          invite.used 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                          {invite.used ? "Joined" : "Pending"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-6">
                          <button onClick={() => copyLink(invite.token)} className="text-gray-400 hover:text-indigo-500"><FaCopy size={18} /></button>
                          {!invite.used && (
                            <button onClick={() => resendInvite(invite.id || invite._id)} className="text-gray-400 hover:text-blue-500"><FaRedo size={18} /></button>
                          )}
                          <button onClick={() => deleteInvite(invite.id || invite._id)} className="text-gray-400 hover:text-red-500"><FaTrash size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-8 py-10 text-center text-gray-400 italic">No invitations sent yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {invites.length > itemsPerPage && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-[#0f172a]/40">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Page {visiblePage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={visiblePage === 1}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={visiblePage === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteEmployee;
