import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FaHistory,
  FaPlus,
  FaChartLine,
  FaTrashAlt,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

const ConsistencyTracker = () => {
  const [records, setRecords] = useState([]);
  const [skills, setSkills] = useState([]);
  const [hours, setHours] = useState("");
  const [progressIncrement, setProgressIncrement] = useState("");
  const [skillId, setSkillId] = useState("");
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

  // ✅ Fetch consistency logs
  const fetchConsistency = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/consistency/employee/${employeeId}`,
        authHeader
      );
      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setError("Unable to load consistency history.");
    }
  }, [authHeader, employeeId]);

  // ✅ Fetch assigned skills (IMPORTANT FIX)
  const fetchSkills = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/employee/assignments/${employeeId}`,
        authHeader
      );

      const assignments = Array.isArray(res.data) ? res.data : [];

      const mapped = assignments.map((item) => ({
        id: item.id,
        skillName: item.skill?.skillName || "Unknown",
        progress: item.progress || 0
      }));

      setSkills(mapped);
    } catch (error) {
      console.error(error);
      setSkills([]);
    }
  }, [authHeader, employeeId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchConsistency(), fetchSkills()]).finally(() =>
      setLoading(false)
    );
  }, [fetchConsistency, fetchSkills]);

  // ✅ Submit entry (NO TOPIC)
  const handleSubmit = async () => {
    const today = new Date().toISOString().split("T")[0];

    if (!skillId || !hours) {
      toast.error("Please select skill and hours");
      return;
    }

    const percentValue = progressIncrement.trim() ? Number(progressIncrement) : null;
    if (percentValue !== null && (Number.isNaN(percentValue) || percentValue < 0 || percentValue > 100)) {
      toast.error("Progress percentage must be between 0 and 100.");
      return;
    }

    const selectedSkill = skills.find(
      (s) => String(s.id) === String(skillId)
    );

    try {
      await axios.post(
        "http://localhost:8080/api/consistency/add",
        {
          employeeId,
          skillId: Number(skillId),
          date: today,
          hoursStudied: Number(hours),
          technology: selectedSkill?.skillName,
          ...(percentValue !== null ? { progressIncrement: percentValue } : {})
        },
        authHeader
      );

      toast.success("Entry added!");

      setHours("");
      setProgressIncrement("");
      setSkillId("");
      setCurrentPage(1);

      fetchConsistency();
      fetchSkills();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add entry");
    }
  };

  // ✅ Delete entry
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;

    try {
      await axios.delete(
        `http://localhost:8080/api/consistency/${id}`,
        authHeader
      );
      fetchConsistency();
      toast.success("Entry deleted");
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete entry");
    }
  };

  // ✅ Pagination
  const totalPages = Math.max(1, Math.ceil(records.length / itemsPerPage));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedRecords = records.slice(
    (visiblePage - 1) * itemsPerPage,
    visiblePage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Toaster position="top-center" />

      {/* Header */}
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaChartLine /> Consistency Tracker
      </h1>

      {/* Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <FaPlus /> Add Daily Entry
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Hours */}
          <input
            type="number"
            placeholder="Hours"
            value={hours}
            min="0"
            step="0.5"
            onChange={(e) => setHours(e.target.value)}
            className="p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />

          {/* Progress % */}
          <input
            type="number"
            placeholder="Progress %"
            value={progressIncrement}
            min="0"
            max="100"
            onChange={(e) => setProgressIncrement(e.target.value)}
            className="p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />

          {/* Skill Dropdown */}
          <select
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
            className="p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="">Select Skill</option>
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.skillName} ({skill.progress}%)
              </option>
            ))}
          </select>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="bg-teal-600 text-white rounded-lg px-4 py-2"
          >
            Add Entry
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="p-4 font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <FaHistory /> Activity History
        </h2>

        {loading ? (
          <p className="p-6 text-slate-500 dark:text-slate-400">Loading...</p>
        ) : error ? (
          <p className="p-6 text-rose-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-sm">
                  <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Date</th>
                  <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Hours</th>
                  <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Skill</th>
                  <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Progress</th>
                  <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedRecords.map((rec) => (
                <tr key={rec.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="p-3 text-left">{rec.date}</td>
                  <td className="p-3 text-left">{rec.hoursStudied}</td>
                  <td className="p-3 text-left">{rec.technology}</td>
                  <td className="p-3 text-left text-emerald-600 font-bold">
                    {rec.progressIncrement || 0}%
                  </td>
                  <td className="p-3 text-left">
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="text-red-500"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 flex justify-between">
          <button
            onClick={() =>
              setCurrentPage((p) => Math.max(1, p - 1))
            }
          >
            <FaChevronLeft />
          </button>

          <span>
            Page {visiblePage} / {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsistencyTracker;
