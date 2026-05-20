import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaClock, FaChartLine, FaMoon, FaSun } from "react-icons/fa";

const SkillDetails = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();

  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const getRemainingDays = (startDate, duration) => {
    if (!startDate || !duration) return "-";
    const start = new Date(startDate);
    const today = new Date();
    const passedDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const remaining = duration - passedDays;
    return remaining > 0 ? remaining : 0;
  };

  const loadSkill = useCallback(async () => {
    if (!employeeId || !skillId) {
      setError("Invalid request.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `http://localhost:8080/api/employee/assignments/${employeeId}`,
        authHeader
      );

      const assignments = Array.isArray(res.data) ? res.data : [];

      const selected = assignments.find(
        (item) => String(item.id) === String(skillId)
      );

      if (!selected) {
        setSkill(null);
        setError("Skill not found.");
        return;
      }

      setSkill({
        id: selected.id,
        skillName: selected.skill?.skillName || "Unknown",
        category: selected.skill?.category || "General",
        progress: selected.progress || 0,
        startDate: selected.startDate,
        duration: selected.targetDurationDays || 30,
        status: selected.status || "IN_PROGRESS"
      });

    } catch (err) {
      console.error(err);
      setError("Failed to load skill details.");
      setSkill(null);
    } finally {
      setLoading(false);
    }
  }, [employeeId, skillId, authHeader]);

  useEffect(() => {
    loadSkill();
  }, [loadSkill]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto">

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate("/MySkills")}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl shadow-sm hover:bg-gray-100 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700"
          >
            <FaArrowLeft /> Back
          </button>

          {/* <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button> */}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-10 text-gray-500">
            Loading skill details...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-10 text-red-500">
            {error}
          </div>
        )}

        {/* Skill Details */}
        {skill && !loading && (
          <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6 dark:bg-slate-800">

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{skill.skillName}</h1>
              <p className="text-gray-500 dark:text-gray-400">{skill.category}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div className="p-4 bg-gray-100 rounded-xl dark:bg-slate-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <p className="font-bold text-slate-900 dark:text-white">{skill.status}</p>
              </div>

              <div className="p-4 bg-gray-100 rounded-xl dark:bg-slate-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
                <p className="font-bold text-slate-900 dark:text-white">{skill.progress}%</p>
              </div>

              <div className="p-4 bg-gray-100 rounded-xl dark:bg-slate-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {skill.startDate || "N/A"}
                </p>
              </div>

              <div className="p-4 bg-gray-100 rounded-xl dark:bg-slate-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Days Left</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {getRemainingDays(skill.startDate, skill.duration)}
                </p>
              </div>

            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1 text-slate-700 dark:text-slate-200">
                <span>Progress</span>
                <span>{skill.progress}%</span>
              </div>

              <div className="w-full bg-gray-200 h-3 rounded-full dark:bg-slate-700">
                <div
                  className="bg-teal-600 h-3 rounded-full"
                  style={{ width: `${skill.progress}%` }}
                />
              </div>
            </div>

            {/* Attempt Test Button */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/test/${skill.id}`)}
                className="rounded-xl bg-indigo-600 text-white px-5 py-3 transition hover:bg-indigo-700"
              >
                Attempt Test
              </button>
            </div>

            {/* Info */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <FaClock className="inline mr-2" />
              Complete this skill before deadline.
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default SkillDetails;
