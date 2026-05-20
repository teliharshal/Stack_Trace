import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { FaTrophy, FaChartLine, FaChevronLeft, FaChevronRight, FaCircle } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import { findCatalogSkillMatch } from "../utils/skillCatalog";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const SkillAnalytics = () => {
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
    setError("Please sign in again to load your skill analytics.");
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
      status: item.status || "IN_PROGRESS",
      startDate: item.startDate
    }));

    setSkills(mappedSkills);
    setError("");

  } catch (error) {
    console.error(error);
    setSkills([]);
    setError("Unable to load skill analytics.");
  }
}, [authHeader, employeeId, hasCredentials]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLoading(true);
    fetchSkills().finally(() => setLoading(false));
  }, [fetchSkills]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const totalPages = Math.max(1, Math.ceil(skills.length / itemsPerPage));
  const visiblePage = Math.min(currentPage, totalPages);
  const pagedSkills = skills.slice((visiblePage - 1) * itemsPerPage, visiblePage * itemsPerPage);

  // Common SaaS Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
          font: { family: "Inter", size: 11 },
        },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { display: false }, ticks: { font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    },
  };

  // Logic for data aggregation
  const completed = skills.filter((s) => getEffectiveProgress(s) === 100).length;
  const avgProgress = skills.length ? Math.round(skills.reduce((acc, s) => acc + getEffectiveProgress(s), 0) / skills.length) : 0;

  // Chart Data Objects
  const categoryData = {
    labels: ["Programming", "Frontend", "Backend", "Database", "DevOps"],
    datasets: [{
      data: ["Programming", "Frontend", "Backend", "Database", "DevOps"].map(cat => skills.filter(s => normalizeKey(s.category) === normalizeKey(cat)).length),
      backgroundColor: ["#6366F1", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"],
      hoverOffset: 10,
    }],
  };

  const timelineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [{
        label: "Growth",
        data: new Array(12).fill(0).map((_, i) => skills.filter(s => s.startDate && new Date(s.startDate).getMonth() === i).length),
      borderColor: "#6366F1",
      backgroundColor: "rgba(99, 102, 241, 0.1)",
      fill: true,
      tension: 0.4,
    }],
  };

  return (
    <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      {/* Header & KPIs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Skill Insights</h1>
          <p className="text-slate-500 text-sm">Real-time breakdown of your professional development.</p>
        </div>
        <div className="flex gap-4">
          <KPICard label="Success Rate" value={`${Math.round((completed / skills.length) * 100 || 0)}%`} icon={<FaTrophy className="text-amber-500" />} />
          <KPICard label="Avg. Progress" value={`${avgProgress}%`} icon={<FaChartLine className="text-indigo-500" />} />
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400">
          Loading skill analytics...
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-rose-500 dark:text-rose-400">
          {error}
        </div>
      ) : (
      <>
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-8">
        {/* Category Breakdown */}
        <div className="md:col-span-3 lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Categories</h2>
          <div className="h-60">
            <Pie data={categoryData} options={chartOptions} />
          </div>
        </div>

        {/* Growth Timeline */}
        <div className="md:col-span-3 lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Growth Timeline</h2>
          <div className="h-60">
            <Line data={timelineData} options={chartOptions} />
          </div>
        </div>

        {/* Skill Level - Horizontal Bar */}
        <div className="md:col-span-6 lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Expertise Levels</h2>
          <div className="space-y-4">
            {["Beginner", "Intermediate", "Advanced"].map((lvl) => {
              const count = skills.filter(s => (s.level || "").toLowerCase() === lvl.toLowerCase()).length;
              const perc = (count / skills.length) * 100;
              return (
                <div key={lvl}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>{lvl}</span>
                    <span className="text-slate-400">{count} Skills</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-900 rounded-full" style={{ width: `${perc}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Table */}
        <div className="md:col-span-6 lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Inventory</h2>
          <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30"><FaChevronLeft size={12}/></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30"><FaChevronRight size={12}/></button>
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30">
              <tr className="text-[10px] uppercase font-black text-slate-400">
                <th className="px-6 py-3">Skill</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pagedSkills.map((skill) => (
                <tr key={skill.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold">{skill.skillName}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{skill.category}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-1 rounded-md ${getEffectiveProgress(skill) === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      <FaCircle size={6} /> {getEffectiveProgress(skill) === 100 ? 'Mastered' : 'Growing'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-black text-teal-900 dark:text-teal-900">{getEffectiveProgress(skill)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

const KPICard = ({ label, value, icon }) => (
  <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 min-w-[160px]">
    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-lg">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
      <p className="text-xl font-black">{value}</p>
    </div>
  </div>
);

export default SkillAnalytics;
