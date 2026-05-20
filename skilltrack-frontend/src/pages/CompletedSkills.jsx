import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaAward, FaCalendarAlt, FaSearch, FaFilter, FaArrowRight, FaUpload } from "react-icons/fa";

const CompletedSkills = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = Number(localStorage.getItem("employeeId"));
  const [showModal, setShowModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const authHeader = useMemo(
    () => ({
      auth: {
        username: user.email,
        password: user.password
      }
    }),
    [user.email, user.password]
  );

  const fetchCompletedSkills = useCallback(async () => {
    if (!employeeId || !user.email || !user.password) {
      setSkills([]);
      setLoading(false);
      setError("Please sign in again to load your completed skills.");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8080/api/employee/assignments/${employeeId}`,
        authHeader
      );

      const assignments = Array.isArray(res.data) ? res.data : [];

      // Filter for 100% completion
      const completed = assignments.filter((item) => item.progress === 100);

      const mapped = completed.map((item) => ({
        id: item.id,
        skillName: item.skill?.skillName || "Unknown",
        category: item.skill?.category || "General",
        progress: item.progress,
        startDate: item.startDate,
        endDate: item.endDate || item.updatedAt,
        subtopics: item.skill?.subtopics || []
      }));

      setSkills(mapped);
      setError("");
    } catch (error) {
      console.error("Error fetching completed skills:", error);
      setSkills([]);
      setError("Unable to load completed skills.");
    }
  }, [authHeader, employeeId, user.email, user.password]);

  useEffect(() => {
    setLoading(true);
    fetchCompletedSkills().finally(() => setLoading(false));
  }, [fetchCompletedSkills]);

  const filteredSkills = skills.filter(skill =>
    (skill.skillName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const handleUpload = async () => {
  if (!selectedFile) {
    alert("Please select a file");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("skillId", selectedSkill.id);

   await axios.post(
  `http://localhost:8080/api/employee/upload-certificate/${selectedSkill.id}`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data"
    },
    auth: {
      username: user.email,
      password: user.password
    }
  }
);

    alert("Certificate uploaded successfully ✅");
    setShowModal(false);
    setSelectedFile(null);

  } catch (error) {
    console.error(error);
    alert("Upload failed ❌");
  }
};

  const handleOpenUpload = (e, skill) => {
    e.stopPropagation(); // Prevents navigating to details page
    setSelectedSkill(skill);
    setShowModal(true);
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">
            <FaAward /> Achievement Unlocked
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Completed Skills
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            A comprehensive list of your mastered technologies and certifications.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search skills..."
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-64 transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl scale-in-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                <FaUpload size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Upload Certificate</h2>
                <p className="text-sm text-slate-500">{selectedSkill?.skillName}</p>
              </div>
            </div>

            <div className="group relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 transition-colors hover:border-emerald-500 text-center mb-6">
             <input
  type="file"
  onChange={(e) => setSelectedFile(e.target.files[0])}
  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
/>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-400">PDF, PNG, or JPG (max 5MB)</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                 onClick={handleUpload}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-lg font-medium">Loading completed skills...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-rose-500 dark:text-rose-400 text-center">
          <p className="text-lg font-medium">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => navigate(`/MySkills/${skill.id}`)}
              className="group cursor-pointer self-start h-fit bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <FaCheckCircle size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg">
                    {skill.category}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors">
                  {skill.skillName}
                </h2>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <FaCalendarAlt size={10} />
                  <span>Completed: {formatDate(skill.endDate)}</span>
                </div>

                {/* Progress Bar (Always 100% here) */}
                <div className="pt-3 border-t border-slate-50 dark:border-slate-800 mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Mastered</span>
                    <span className="text-[10px] font-black text-emerald-600">100%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full">
                    <div className="bg-emerald-500 h-full rounded-full w-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 mt-4">
                  <button
                    onClick={(e) => handleOpenUpload(e, skill)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20"
                  >
                    <FaUpload size={10} />
                    Certificate
                  </button>
                  <div className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <FaArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredSkills.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <FaAward size={48} className="mb-4 opacity-10" />
          <p className="text-lg font-medium">No completed skills found.</p>
        </div>
      )}
    </div>
  );
};

export default CompletedSkills;
