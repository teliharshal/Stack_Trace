import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { FaChartLine, FaCheckCircle, FaHourglassHalf, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const ProgressTracker = () => {
  const [skills, setSkills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = Number(localStorage.getItem("employeeId"));
  const authHeader = useMemo(
    () => ({
      auth: {
        username: user.email,
        password: user.password
      }
    }),
    [user.email, user.password]
  );

  const hasCredentials = Boolean(employeeId && user.email && user.password);
  const normalizeKey = (value) => (value || "").trim().toLowerCase();
  const parseTopics = (value) =>
    String(value || "")
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);
  const getEffectiveProgress = (skill) => {
    const stored = Number(skill?.progress ?? skill?.progressPercentage ?? 0);
    const topics = parseTopics(skill?.topics || skill?.subtopics?.join(", ") || "");
    const completed = parseTopics(skill?.completedTopics || "");
    if (!topics.length) return stored;
    const derived = Math.round((completed.length / topics.length) * 100);
    return Math.max(stored, derived);
  };

  const fetchSkills = useCallback(async () => {
  if (!hasCredentials) {
    setSkills([]);
    setLoading(false);
    setError("Please sign in again to load your progress data.");
    return;
  }

  try {
    const res = await axios.get(
      `http://localhost:8080/api/employee/assignments/${employeeId}`,
      authHeader
    );

    const assignments = Array.isArray(res.data) ? res.data : [];

    const mappedSkills = assignments.map((item) => ({
      id: item.id,
      skillName: item.skill?.skillName || "Unknown",
      category: item.skill?.category || "General",
      progress: item.progress || 0,
      status: item.status || "IN_PROGRESS"
    }));

    setSkills(mappedSkills);
    setError("");

  } catch (error) {
    console.error(error);
    setSkills([]);
    setError("Unable to load progress data.");
  }
}, [authHeader, employeeId, hasCredentials]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLoading(true);
    fetchSkills().finally(() => setLoading(false));
  }, [fetchSkills]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Stats Calculations
  const completedCount = skills.filter(s => getEffectiveProgress(s) === 100).length;
  const avgProgress = skills.length ? Math.round(skills.reduce((acc, s) => acc + getEffectiveProgress(s), 0) / skills.length) : 0;

  // Chart Logic
  const categoryCount = {};
  skills.forEach((s) => {
    const key = normalizeKey(s.category) || "general";
    categoryCount[key] = (categoryCount[key] || 0) + 1;
  });

  const barData = {
    labels: skills.map((s) => s.skillName),
    datasets: [{ label: "Progress %", data: skills.map((s) => getEffectiveProgress(s)), backgroundColor: "#6366f1", borderRadius: 8 }],
  };

  const pieData = {
    labels: Object.keys(categoryCount).map((key) => key.charAt(0).toUpperCase() + key.slice(1)),
    datasets: [{
      data: Object.values(categoryCount),
      backgroundColor: ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 20, font: { family: "Inter", size: 12 } } },
    },
  };

  const totalPages = Math.max(1, Math.ceil(skills.length / itemsPerPage));
  const visiblePage = Math.min(currentPage, totalPages);
  const currentSkills = skills.slice((visiblePage - 1) * itemsPerPage, visiblePage * itemsPerPage);

  return (
    <div className="p-6 md:p-10 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Progress Tracker</h1>
        <p className="text-slate-500 dark:text-slate-400">Monitor your skill acquisition and category distribution.</p>
      </header>

      {/* 1. Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Skills" value={skills.length} icon={<FaChartLine className="text-indigo-500" />} />
        <StatCard title="Completed" value={completedCount} icon={<FaCheckCircle className="text-emerald-500" />} />
        <StatCard title="Avg. Progress" value={`${avgProgress}%`} icon={<FaHourglassHalf className="text-amber-500" />} />
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400">
          Loading progress data...
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-rose-500 dark:text-rose-400">
          {error}
        </div>
      ) : (
        <>
      {/* 2. Charts Section (Now First) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">Progress Overview</h2>
          <div className="h-72">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">Category Spread</h2>
          <div className="h-72">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* 3. Detailed Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold">Skill Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest">
              <tr>
                <th className="p-4 font-semibold">Skill Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Progress</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {currentSkills.map((skill) => (
                <tr key={skill.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{skill.skillName}</td>
                  <td className="p-4 text-sm text-slate-500">{skill.category || "General"}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3 w-48">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-teal-900 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${getEffectiveProgress(skill)}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold w-8">{getEffectiveProgress(skill)}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                      getEffectiveProgress(skill) === 100 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {getEffectiveProgress(skill) === 100 ? "Completed" : "Active"}
                    </span>
                  </td>
                <td className="p-4 text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Topic based</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm text-slate-500">Page {visiblePage} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={visiblePage === 1}
              className="p-2 rounded-lg border bg-white dark:bg-slate-900 disabled:opacity-30 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FaArrowLeft size={12} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={visiblePage === totalPages}
              className="p-2 rounded-lg border bg-white dark:bg-slate-900 disabled:opacity-30 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FaArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

// Sub-component for Stats
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-black mt-1">{value}</h3>
    </div>
    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xl">
      {icon}
    </div>
  </div>
);

export default ProgressTracker;
