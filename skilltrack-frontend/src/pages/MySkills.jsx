import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { findCatalogSkillMatch } from "../utils/skillCatalog";
import {
  FaCode,
  FaLaptopCode,
  FaServer,
  FaDatabase,
  FaTools,
  FaPlus,
  FaSearch,
  FaFilter,
  FaClock,
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaReact,
  FaNodeJs,
  FaJava,
  FaPython,
  FaDocker,
  FaAws,
  FaGitAlt,
  FaTerminal,
  FaTags,
  FaArrowRight
} from "react-icons/fa";

const MySkills = () => {
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
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

  const fetchSkills = useCallback(async () => {
  if (!employeeId || !user.email || !user.password) {
    setSkills([]);
    setLoading(false);
    setError("Please sign in again to load your skills.");
    return;
  }

  setLoading(true);
  setError("");

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
      progressPercentage: item.progress || 0,
      startDate: item.startDate,
      targetDurationDays: item.targetDurationDays || 30
    }));

    setSkills(mappedSkills);

  } catch (error) {
    console.error(error);
    setSkills([]);
    setError("Unable to load your skills right now.");
  } finally {
    setLoading(false);
  }
}, [authHeader, employeeId, user.email, user.password]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const getSkillIcon = (category, skillName) => {
    const value = `${category || ""} ${skillName || ""}`.toLowerCase();

    if (value.includes("html")) return { icon: <FaHtml5 />, tone: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" };
    if (value.includes("css")) return { icon: <FaCss3Alt />, tone: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-500/10" };
    if (value.includes("javascript") || value.includes("js")) {
      return { icon: <FaJs />, tone: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-500/10" };
    }
    if (value.includes("react")) return { icon: <FaReact />, tone: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10" };
    if (value.includes("node")) return { icon: <FaNodeJs />, tone: "text-green-600", bg: "bg-green-50 dark:bg-green-500/10" };
    if (value.includes("java")) return { icon: <FaJava />, tone: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" };
    if (value.includes("python")) return { icon: <FaPython />, tone: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" };
    if (value.includes("docker")) return { icon: <FaDocker />, tone: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-500/10" };
    if (value.includes("aws")) return { icon: <FaAws />, tone: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" };
    if (value.includes("git")) return { icon: <FaGitAlt />, tone: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10" };
    if (value.includes("sql") || value.includes("database")) {
      return { icon: <FaDatabase />, tone: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" };
    }
    if (value.includes("devops") || value.includes("linux") || value.includes("ci") || value.includes("deploy")) {
      return { icon: <FaTerminal />, tone: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" };
    }
    if (value.includes("backend")) return { icon: <FaServer />, tone: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" };
    if (value.includes("frontend")) return { icon: <FaLaptopCode />, tone: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" };
    if (value.includes("programming")) return { icon: <FaCode />, tone: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-700/40" };

    return { icon: <FaTools />, tone: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-700/40" };
  };

  const getRemainingDays = (startDate, duration) => {
    if (!startDate || !duration) return "-";
    const start = new Date(startDate);
    const today = new Date();
    const passedDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const remaining = duration - passedDays;
    return remaining > 0 ? remaining : 0;
  };

const filteredSkills = (skills || []).filter((skill) => {
  const skillName = (skill?.skillName || "").toLowerCase();
  const category = (skill?.category || "").toLowerCase();
  const searchText = search.toLowerCase();

  const matchesSearch =
    skillName.includes(searchText) || category.includes(searchText);

  const matchesCategory =
    categoryFilter === "" || skill?.category === categoryFilter;

  return matchesSearch && matchesCategory;
});

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen font-sans">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Skill Inventory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track and manage your professional growth.
          </p>
        </div>
        {/* <button
          onClick={() => navigate("/addSkill")}
          className="flex items-center gap-2 bg-teal-900 hover:bg-teal-950 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none font-medium"
        >
          <FaPlus size={14} /> Add New Skill
        </button> */}
      </header>

      {/* Quick Stats Summary */}
      

      {/* Controls: Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Database">Database</option>
            <option value="DevOps">DevOps</option>
          </select>
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">Loading your skills...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">{error}</p>
        </div>
      ) : filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredSkills.map((s) => (
            <div
              key={s.id}
              onClick={() => navigate(`/MySkills/${s.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/MySkills/${s.id}`);
                }
              }}
              role="button"
              tabIndex={0}
              className="group self-start h-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-lg text-left"
            >
              <div className="flex justify-between items-start mb-2.5">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 shadow-sm transition-colors dark:border-slate-700 ${getSkillIcon(
                    s.category,
                    s.skillName
                  ).bg} ${getSkillIcon(s.category, s.skillName).tone}`}
                >
                  <span className="text-lg">
                    {getSkillIcon(s.category, s.skillName).icon}
                  </span>
                </div>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                  {s.level || "Beginner"}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1 leading-tight">
                {s.skillName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{s.category}</p>

              <div className="mb-3">
                <div className="mb-1.5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400">
                  <FaTags />
                  Topics Preview
                </div>
                <div className="flex flex-wrap gap-2">
                  {(s.subtopics || [])
                    .slice(0, 1)
                    .map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-700/70 dark:text-slate-300"
                      >
                        {topic}
                      </span>
                    ))}
                  {(!s.subtopics || s.subtopics.length === 0) && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Click to view topics and subtopics
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar Section */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Progress</span>
                  <span className="text-sm font-bold text-teal-900  dark:text-teal-900">{s.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-900 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                    style={{ width: `${s.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-slate-50 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <FaClock size={12} />
                  <span className="text-[11px] font-medium">
                    {getRemainingDays(s.startDate, s.targetDurationDays)} days left
                  </span>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-end text-[11px] font-bold text-teal-900 dark:text-teal-950">
                Open details <FaArrowRight className="ml-2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">No matching skills found.</p>
        </div>
      )}
    </div>
  );
};


export default MySkills;
