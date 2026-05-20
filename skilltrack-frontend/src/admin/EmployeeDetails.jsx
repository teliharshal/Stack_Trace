import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FaArrowLeft,
  FaEnvelope,
  FaCheckCircle,
  FaChartLine,
  FaLayerGroup,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { getRoleLabel } from "../utils/roles";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [inProgressPage, setInProgressPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [pendingRejectCertificateId, setPendingRejectCertificateId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const inProgressPageSize = 4;
  const completedPageSize = 5;
  const authHeader = useMemo(
    () => ({
      auth: {
        username: user.email,
        password: user.password
      }
    }),
    [user.email, user.password]
  );

  const BACKEND_BASE_URL = "http://localhost:8080";
  const getAvatarUrl = (url) => {
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : `${BACKEND_BASE_URL}${url}`;
  };

  const fetchDetails = useCallback(async () => {
    if (!user.email || !user.password) {
      setData(null);
      setLoading(false);
      setError("Please sign in again to view employee details.");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8080/api/admin/employee/${id}`,
        authHeader
      );
      setData(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setData(null);
      setError("Unable to load employee details.");
    } finally {
      setLoading(false);
    }
  }, [authHeader, id, user.email, user.password]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const approveCertificate = async (id) => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin/certificates/approve/${id}`,
        {},
        authHeader
      );

      toast.success("Certificate approved ✅");
      fetchDetails(); // refresh UI
    } catch (err) {
      console.error(err);
      toast.error("Approval failed ❌");
    }
  };

  const openRejectModal = (certificateId) => {
    setPendingRejectCertificateId(certificateId);
    setRejectReason("");
    setReasonModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/admin/certificates/reject/${pendingRejectCertificateId}`,
        { reason: rejectReason },
        authHeader
      );

      toast.success("Certificate rejected and reason sent ✅");
      setReasonModalOpen(false);
      setPendingRejectCertificateId(null);
      setRejectReason("");
      fetchDetails();
    } catch (err) {
      console.error(err);
      toast.error("Rejection failed ❌");
    }
  };



const assignTest = async (id, link) => {
  try {
    await axios.put(
      `http://localhost:8080/api/admin/assign-test/${id}`,
      { testLink: link },
      authHeader
    );

    toast.success("Test assigned ✅");
    fetchDetails();
  } catch (err) {
    console.error(err);
    toast.error("Failed ❌");
  }
};


const verifyTest = async (id, approved, reason = "") => {
  try {
    await axios.put(
      `http://localhost:8080/api/admin/verify-test/${id}?approved=${approved}&reason=${encodeURIComponent(reason)}`,
      {},
      authHeader
    );

    alert(approved ? "Approved ✅" : "Rejected ❌");

    fetchDetails();

  } catch (err) {
    console.error(err);
    alert("Failed ❌");
  }
};

  const rejectCertificate = (id) => {
    openRejectModal(id);
  };

  useEffect(() => {
    setInProgressPage(1);
    setCompletedPage(1);
  }, [id, data?.inProgressSkills?.length, data?.completedSkills?.length]);

  const inProgressSkills = Array.isArray(data?.inProgressSkills) ? data.inProgressSkills : [];
  const completedSkills = Array.isArray(data?.completedSkills) ? data.completedSkills : [];

  const inProgressTotalPages = Math.max(1, Math.ceil(inProgressSkills.length / inProgressPageSize));
  const completedTotalPages = Math.max(1, Math.ceil(completedSkills.length / completedPageSize));

  const activeInProgressPage = Math.min(inProgressPage, inProgressTotalPages);
  const activeCompletedPage = Math.min(completedPage, completedTotalPages);

  const paginatedInProgressSkills = inProgressSkills.slice(
    (activeInProgressPage - 1) * inProgressPageSize,
    activeInProgressPage * inProgressPageSize
  );

  const paginatedCompletedSkills = completedSkills.slice(
    (activeCompletedPage - 1) * completedPageSize,
    activeCompletedPage * completedPageSize
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm dark:border-red-900/40 dark:bg-gray-800">
          <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
          <button
            onClick={() => navigate("/admin/employees")}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.name) {
    return null;
  }

  return (
    <div className="p-6 md:p-10 font-sans min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Toaster position="top-right" />
      
      {/* Back Button */}
      <button 
        onClick={() => navigate("/admin/employees")}
        className="flex items-center gap-2 mb-8 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
      >
        <FaArrowLeft /> Back to Employees
      </button>

      {/* Header Profile */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
        {data?.avatarUrl ? (
          <img
            src={getAvatarUrl(data.avatarUrl)}
            alt={data.name || "Employee"}
            className="w-20 h-20 rounded-full object-cover shadow-lg ring-4 ring-white dark:ring-gray-800"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-teal-900 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
            {data?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">{data.name}</h1>
          <div className="flex flex-col gap-2 text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <FaEnvelope />
              <span>{data.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaLayerGroup />
              <span>{getRoleLabel(data.role)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reason Modal */}
      {reasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-700">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reject Certificate</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Provide a clear reason so the employee understands why the certificate was rejected.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReasonModalOpen(false)}
                className="rounded-full border border-gray-200 bg-gray-100 p-2 text-gray-700 transition hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                ✕
              </button>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="min-h-[140px] w-full rounded-3xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
            />
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setReasonModalOpen(false)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Send Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatsCard 
          label="Total Skills" 
          value={data.totalSkills || 0} 
          icon={<FaLayerGroup />} 
          color="blue" 
        />
        <StatsCard 
          label="Completed" 
          value={data.completed || 0} 
          icon={<FaCheckCircle />} 
          color="green" 
        />
        <StatsCard 
          label="In Progress" 
          value={data.inProgress || 0} 
          icon={<FaChartLine />} 
          color="yellow" 
        />
      </div>

      {/* Skills Sections */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        
        {/* In Progress Column */}
        <div className="flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
              In Progress
            </h2>
            <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
              {inProgressSkills.length} skills
            </span>
          </div>

          <div className="flex min-h-[320px] flex-1 flex-col">
            <div className="space-y-4">
              {paginatedInProgressSkills.length > 0 ? (
                paginatedInProgressSkills.map((skill, index) => (
                  <div
                    key={`${skill.skillName || "skill"}-${index}`}
                    className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-200 hover:bg-blue-50/40 dark:border-gray-700 dark:bg-gray-900/30 dark:hover:border-blue-900/60 dark:hover:bg-blue-900/10"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="truncate font-semibold text-gray-700 dark:text-gray-200">
                        {skill.skillName}
                      </span>
                      <span className="shrink-0 text-sm font-bold text-blue-600 dark:text-blue-400">
                        {skill.progressPercentage}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                      <div
                        className="h-2.5 rounded-full bg-blue-600 transition-all duration-500 group-hover:bg-blue-500"
                        style={{ width: `${skill.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-center italic text-gray-400 dark:border-gray-700">
                  No skills in progress.
                </p>
              )}
            </div>

            {inProgressSkills.length > inProgressPageSize && (
              <SectionPager
                currentPage={activeInProgressPage}
                totalPages={inProgressTotalPages}
                totalItems={inProgressSkills.length}
                pageSize={inProgressPageSize}
                itemLabel="skills"
                onPrevious={() => setInProgressPage((page) => Math.max(1, page - 1))}
                onNext={() => setInProgressPage((page) => Math.min(inProgressTotalPages, page + 1))}
              />
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <span className="h-3 w-3 rounded-full bg-green-500"></span>
              Completed
            </h2>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-300">
              {completedSkills.length} skills
            </span>
          </div>

          <div className="flex min-h-[320px] flex-1 flex-col">
            <div className="space-y-3">
              {paginatedCompletedSkills.length > 0 ? (
                paginatedCompletedSkills.map((skill, index) => (
                  <div
                    key={`${skill.skillName || "completed"}-${index}`}
                    className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50/80 p-3.5 transition hover:border-green-200 hover:bg-green-50 dark:border-green-900/30 dark:bg-green-900/15 dark:hover:border-green-800/60 dark:hover:bg-green-900/20"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-300">
                      <FaCheckCircle className="text-base" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-gray-700 dark:text-gray-200">
                        {skill.skillName}
                      </span>
                      {skill.certificateUploaded && (
  <div className="flex gap-2 mt-2">

    {/* View Certificate */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        window.open(`http://localhost:8080${skill.certificateUrl}`, "_blank");
      }}
      className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
    >
      View Certificate
    </button>

    {/* Approve */}
    {!skill.certificateVerified && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          approveCertificate(skill.id);
        }}
        className="text-xs bg-green-600 text-white px-2 py-1 rounded"
      >
        Approve
      </button>
    )}

    {/* Reject */}
    {!skill.certificateVerified && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          rejectCertificate(skill.id);
        }}
        className="text-xs bg-red-600 text-white px-2 py-1 rounded"
      >
        Reject
      </button>
    )}

    {/* Verified Badge */}
    {skill.certificateVerified && (
      <span className="text-xs text-green-700 font-bold">
        ✔ Verified
      </span>
    )}

  </div>
)}

{/* ================= TEST SECTION ================= */}
{skill.progressPercentage === 100 && (
  <div className="flex gap-2 mt-2 flex-wrap">

    {/* Assign Test */}
    {!skill.testLink && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          const link = prompt("Enter Test Link:");
          if (link) assignTest(skill.id, link);
        }}
        className="text-xs bg-purple-600 text-white px-2 py-1 rounded"
      >
        Assign Test
      </button>
    )}

    {/* Reassign Test */}
    {skill.testStatus === "REJECTED" && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          const link = prompt("Enter New Test Link:");
          if (link) assignTest(skill.id, link);
        }}
        className="text-xs bg-purple-700 text-white px-2 py-1 rounded"
      >
        Reassign Test
      </button>
    )}

    {/* View Result */}
    {skill.resultLink && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          window.open(skill.resultLink, "_blank");
        }}
        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded"
      >
        View Result
      </button>
    )}

    {/* Approve / Reject */}
    {skill.testStatus === "SUBMITTED" && (
      <>
        <button
          onClick={(e) => {
            e.stopPropagation();
            verifyTest(skill.id, true);
          }}
          className="text-xs bg-green-600 text-white px-2 py-1 rounded"
        >
          Approve Test
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            const reason = prompt("Enter rejection reason:");
            if (!reason) return;

            verifyTest(skill.id, false, reason);
          }}
          className="text-xs bg-red-600 text-white px-2 py-1 rounded"
        >
          Reject Test
        </button>
      </>
    )}

    {/* Status */}
    {skill.testStatus === "VERIFIED" && (
      <span className="text-xs text-green-700 font-bold">
        ✔ Test Verified
      </span>
    )}

    {skill.testStatus === "REJECTED" && (
      <span className="text-xs text-red-700 font-bold">
        ❌ Rejected: {skill.rejectReason || "Try again"}
      </span>
    )}

  </div>
)}


                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Completed skill
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-center italic text-gray-400 dark:border-gray-700">
                  No completed skills yet.
                </p>
              )}
            </div>

            {completedSkills.length > completedPageSize && (
              <SectionPager
                currentPage={activeCompletedPage}
                totalPages={completedTotalPages}
                totalItems={completedSkills.length}
                pageSize={completedPageSize}
                itemLabel="skills"
                onPrevious={() => setCompletedPage((page) => Math.max(1, page - 1))}
                onNext={() => setCompletedPage((page) => Math.min(completedTotalPages, page + 1))}
              />
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

const SectionPager = ({ currentPage, totalPages, totalItems, pageSize, itemLabel, onPrevious, onNext }) => {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Showing <span className="font-semibold text-slate-900 dark:text-white">{start}</span> to{" "}
        <span className="font-semibold text-slate-900 dark:text-white">{end}</span> of{" "}
        <span className="font-semibold text-slate-900 dark:text-white">{totalItems}</span>{" "}
        {itemLabel}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
        >
          <FaChevronLeft className="text-xs" />
          Prev
        </button>
        <span className="min-w-20 rounded-xl bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
        >
          Next
          <FaChevronRight className="text-xs" />
        </button>
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, icon, color }) => {
  const styles = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    yellow: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
      <div className={`p-4 rounded-xl text-xl ${styles[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default EmployeeDetails;
