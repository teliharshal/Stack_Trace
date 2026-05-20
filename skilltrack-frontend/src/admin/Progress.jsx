import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

const Progress = () => {

  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const { search = "" } = useOutletContext() || {};
  const normalizedSearch = search.trim().toLowerCase();

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

  const fetchTopPerformers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        "http://localhost:8080/api/admin/progress/top-performers",
        authHeader
      );
      setTopPerformers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch top performers", err);
      setTopPerformers([]);
      setError("Unable to load progress data.");
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    fetchTopPerformers();
  }, [fetchTopPerformers]);

  const getMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "🏅";
  };

  const openDetails = (employee) => setSelectedEmployee(employee);
  const closeDetails = () => setSelectedEmployee(null);

  const filteredPerformers = topPerformers.filter((emp) => {
    if (!normalizedSearch) {
      return true;
    }

    const name = (emp.name || "").toLowerCase();
    return name.includes(normalizedSearch);
  });

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900">

      <h1 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-white">
        🏆 Top Performers
      </h1>
      {normalizedSearch && (
        <p className="mb-4 text-sm font-medium text-teal-700 dark:text-teal-400">
          Showing results for "{search}"
        </p>
      )}

      {loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading progress data...</div>
      ) : error ? (
        <div className="text-red-500 dark:text-red-400">{error}</div>
      ) : filteredPerformers.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">
          {normalizedSearch ? "No matching performers found." : "No performance data available yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPerformers.map((emp, index) => (
          <div
            key={emp.employeeId ?? index}
            className="group rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800"
          >

            {/* Rank */}
            <div className="text-3xl mb-2 transition-transform group-hover:scale-105">
              {getMedal(index)}
            </div>

            {/* Name */}
            <h2 className="text-lg font-semibold text-gray-800 transition-colors group-hover:text-teal-900 dark:text-white dark:group-hover:text-teal-600">
              {emp.name}
            </h2>

            {/* Progress */}
            <p className="text-sm text-gray-500 mt-2">
              Progress: {emp.progress}%
            </p>

            {/* Completed */}
            <p className="text-sm text-gray-500">
              Completed Skills: {emp.completed}
            </p>

            {/* Progress Bar */}
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-900 h-2 rounded-full"
                style={{ width: `${emp.progress}%` }}
              ></div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => openDetails(emp)}
                className="text-sm font-semibold text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-400 transition"
              >
                View details
              </button>
            </div>
          </div>

          ))}
        </div>
      )}

      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-gray-700 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Employee details</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{selectedEmployee.name}</h2>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                className="text-2xl leading-none text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-500">Employee ID</p>
                <p className="mt-1 font-semibold">{selectedEmployee.employeeId}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-500">Progress</p>
                <p className="mt-1 font-semibold">{selectedEmployee.progress}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-500">Completed Skills</p>
                <p className="mt-1 font-semibold">{selectedEmployee.completed}</p>
              </div>

              <div className="rounded-full bg-slate-100 dark:bg-slate-800 h-2 overflow-hidden">
                <div className="h-2 rounded-full bg-teal-900" style={{ width: `${selectedEmployee.progress}%` }} />
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                type="button"
                onClick={closeDetails}
                className="inline-flex items-center justify-center rounded-xl bg-teal-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Progress;
