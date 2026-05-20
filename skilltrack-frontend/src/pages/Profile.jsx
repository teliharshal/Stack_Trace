import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaChartLine,
  FaClock,
  FaLayerGroup,
  FaUser,
  FaBookOpen,
  FaArrowRight,
  FaSignal
} from "react-icons/fa";

const Profile = () => {

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [employee, setEmployee] = useState(null);
  const [skills, setSkills] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const employeeId = localStorage.getItem("employeeId");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const avatarStorageKey = employeeId ? `profileAvatar:${employeeId}` : "profileAvatar";
  const buildKey = (skillName, category) =>
    `${(skillName || "").trim().toLowerCase()}|${(category || "general").trim().toLowerCase()}`;
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
    fetchProfile();
  }, [employeeId, authHeader]);

  useEffect(() => {
    if (!employeeId) {
      setAvatarUrl("");
      return;
    }

    const storedAvatar = localStorage.getItem(avatarStorageKey);
    setAvatarUrl(storedAvatar || "");
  }, [employeeId, avatarStorageKey]);

const fetchProfile = async () => {
  if (!employeeId || !user.email || !user.password) {
    setEmployee(null);
    setSkills([]);
    setError("Please sign in again to view your profile.");
    setLoading(false);
    return;
  }

  setLoading(true);
  setError("");

  try {
    const [employeeRes, assignmentRes] = await Promise.all([
      axios.get(`http://localhost:8080/api/employee/${employeeId}`, authHeader),
      axios.get(`http://localhost:8080/api/employee/assignments/${employeeId}`, authHeader)
    ]);

    const assignments = Array.isArray(assignmentRes.data) ? assignmentRes.data : [];

    const mappedSkills = assignments.map((item) => ({
      id: item.id,
      skillName: item.skill?.skillName || "Unknown",
      category: item.skill?.category || "General",
      progressPercentage: item.progress || 0
    }));

    setEmployee(employeeRes.data);
    setSkills(mappedSkills);

  } catch (err) {
    console.error(err);
    setEmployee(null);
    setSkills([]);
    setError("Unable to load your profile right now.");
  } finally {
    setLoading(false);
  }
};

  const totalSkills = skills.length;
  const completedSkills = skills.filter((skill) => Number(skill.progressPercentage) === 100);
  const inProgressSkills = skills.filter((skill) => Number(skill.progressPercentage) > 0 && Number(skill.progressPercentage) < 100);
  const completionRate = totalSkills ? Math.round((completedSkills.length / totalSkills) * 100) : 0;

  const getSkillAccent = (skillName = "", category = "", progressPercentage = 0) => {
    const value = `${skillName} ${category}`.toLowerCase();

    if (Number(progressPercentage) === 100) {
      return {
        badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        bar: "bg-emerald-500",
        icon: <FaCheckCircle />
      };
    }

    if (value.includes("frontend") || value.includes("react") || value.includes("ui")) {
      return {
        badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
        bar: "bg-sky-500",
        icon: <FaChartLine />
      };
    }

    if (value.includes("backend") || value.includes("api") || value.includes("server")) {
      return {
        badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
        bar: "bg-indigo-500",
        icon: <FaLayerGroup />
      };
    }

    if (value.includes("devops") || value.includes("docker") || value.includes("aws")) {
      return {
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        bar: "bg-amber-500",
        icon: <FaSignal />
      };
    }

    return {
      badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      bar: "bg-teal-500",
      icon: <FaBookOpen />
    };
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

 const handleAvatarChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setError("Please select a valid image file.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    // 🔥 STEP 1: Upload file
    const uploadRes = await axios.post(
      "http://localhost:8080/api/employee/upload-avatar",
      formData
    );

    const imageUrl = uploadRes.data; // ✅ THIS IS URL

    // 🔥 STEP 2: Set UI
    setAvatarUrl(imageUrl);

    // 🔥 STEP 3: Save to backend
    await axios.put(
      `http://localhost:8080/api/employee/${employeeId}/avatar`,
      { avatarUrl: imageUrl },
      authHeader
    );

    setError("");

  } catch (err) {
    console.error(err);
    setError("Failed to upload image");
  }
};

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    localStorage.removeItem(avatarStorageKey);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    axios.put(
      `http://localhost:8080/api/employee/${employeeId}/avatar`,
      { avatarUrl: "" },
      authHeader
    ).catch((err) => {
      console.error(err);
      setError("Photo removed locally, but the server update failed.");
    });
  };

  const BASE_URL = "http://localhost:8080";
  if (loading) return <p className="text-gray-900 dark:text-gray-100">Loading profile...</p>;

  if (error) return <p className="text-red-600 dark:text-red-400">{error}</p>;

  if (!employee) return <p className="text-gray-900 dark:text-gray-100">No profile data found.</p>;

  return (

    <div className="min-h-screen bg-slate-50 px-4 py-6 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.16),_transparent_35%),linear-gradient(135deg,_#0f172a_0%,_#111827_45%,_#134e4a_100%)] px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white/80 backdrop-blur">
                  <FaUser className="text-[10px]" />
                  Profile Overview
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {employee.name}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                  A quick view of your identity, learning progress, completed milestones, and what you are actively working on right now.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => navigate("/MySkills")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-teal-900 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-teal-50"
                >
                  My Skills <FaArrowRight className="text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/completed")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-600"
                >
                  Completed <FaArrowRight className="text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/progress")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  In Progress <FaArrowRight className="text-xs" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/60">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative h-24 w-24 shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl ? `${BASE_URL}${avatarUrl}` : ""}
                      alt={`${employee.name} profile`}
                      className="h-24 w-24 rounded-3xl object-cover ring-4 ring-white shadow-lg shadow-slate-200 dark:ring-slate-900"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-teal-900 text-4xl font-black text-white shadow-lg shadow-teal-900/20">
                      {employee.name?.charAt(0)}
                    </div>
                  )}

                </div>

                <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-extrabold">{employee.name}</h2>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-teal-900 dark:bg-teal-900/30 dark:text-teal-300">
                    Employee
                  </span>
                </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>{employee.designation || "Designation not assigned"}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span>{employee.department || "Department not assigned"}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="rounded-xl bg-teal-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-950"
                    >
                      {avatarUrl ? "Change Photo" : "Upload Photo"}
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <MetricCard title="Total Skills" value={totalSkills} accent="teal" icon={<FaBookOpen />} />
                <MetricCard title="Completed" value={completedSkills.length} accent="emerald" icon={<FaCheckCircle />} />
                <MetricCard title="In Progress" value={inProgressSkills.length} accent="amber" icon={<FaClock />} />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Email</p>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {employee.email}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Designation</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {employee.designation || "Not Assigned"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Completion Rate</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {completionRate}%
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Learning Status</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">Progress Snapshot</h3>
                </div>
                <div className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-900 dark:bg-teal-900/20 dark:text-teal-300">
                  {completionRate}% Done
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <ProgressBar label="Completed" value={completedSkills.length} total={totalSkills} tone="emerald" />
                <ProgressBar label="In Progress" value={inProgressSkills.length} total={totalSkills} tone="amber" />
                <ProgressBar label="Remaining" value={Math.max(totalSkills - completedSkills.length - inProgressSkills.length, 0)} total={totalSkills} tone="teal" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <SkillPanel
            title="My Skills"
            description="All skills currently associated with your account."
            count={totalSkills}
            tone="teal"
            buttonText="Open My Skills"
            onClick={() => navigate("/MySkills")}
            skills={skills.slice(0, 4)}
          />

          <SkillPanel
            title="Completed Skills"
            description="Skills you have already finished."
            count={completedSkills.length}
            tone="emerald"
            buttonText="Open Completed Skills"
            onClick={() => navigate("/completed")}
            skills={completedSkills.slice(0, 4)}
          />
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Work</p>
              <h3 className="mt-1 text-2xl font-black">In Progress Skills</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Keep track of what you are actively improving right now.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/progress")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal-900"
            >
              View Progress Tracker <FaArrowRight className="text-xs" />
            </button>
          </div>

          <div className="mt-6">
            {inProgressSkills.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {inProgressSkills.slice(0, 6).map((skill) => {
                  const accent = getSkillAccent(skill.skillName, skill.category, skill.progressPercentage);

                  return (
                    <div
                      key={skill.id}
                      className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-900/10 dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent.badge}`}>
                          {accent.icon}
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm dark:bg-slate-900">
                          {skill.category || "General"}
                        </span>
                      </div>

                      <h4 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                        {skill.skillName}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {skill.level || "Beginner"}
                      </p>

                      <div className="mt-5 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                          <span>Progress</span>
                          <span>{skill.progressPercentage || 0}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full ${accent.bar} transition-all duration-500`}
                            style={{ width: `${Math.max(Number(skill.progressPercentage) || 0, 0)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                No in-progress skills found yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>

  );

};

const MetricCard = ({ title, value, icon, accent }) => {
  const styles = {
    teal: "bg-teal-50 text-teal-900 ring-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:ring-teal-900/40",
    emerald: "bg-emerald-50 text-emerald-900 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-900/40",
    amber: "bg-amber-50 text-amber-900 ring-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-900/40"
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ring-1 ${styles[accent] || styles.teal}`}>
        <span className="text-sm">{icon}</span>
        {title}
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
    </div>
  );
};

const ProgressBar = ({ label, value, total, tone }) => {
  const colors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    teal: "bg-teal-900"
  };

  const percent = total ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="font-bold text-slate-500 dark:text-slate-400">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${colors[tone] || colors.teal}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const SkillPanel = ({ title, description, count, tone, buttonText, onClick, skills }) => {
  const tones = {
    teal: "from-teal-900/10 to-cyan-500/10 text-teal-900 dark:text-teal-300",
    emerald: "from-emerald-900/10 to-green-500/10 text-emerald-900 dark:text-emerald-300"
  };

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
      <div className={`rounded-3xl bg-gradient-to-br p-5 ${tones[tone] || tones.teal}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Overview</p>
            <h3 className="mt-1 text-2xl font-black">{title}</h3>
          </div>
          <div className="rounded-2xl bg-white/80 px-3 py-2 text-lg font-black text-slate-900 shadow-sm dark:bg-slate-950/70 dark:text-white">
            {count}
          </div>
        </div>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
          {description}
        </p>
        <button
          type="button"
          onClick={onClick}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal-900"
        >
          {buttonText} <FaArrowRight className="text-xs" />
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {skills.length > 0 ? (
          skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/50"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{skill.skillName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{skill.category || "General"}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                {skill.progressPercentage ?? 0}%
              </span>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No items to show.
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
