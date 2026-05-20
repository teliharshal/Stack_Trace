import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import { FaPlus, FaTrash, FaBookOpen, FaEdit, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toSafeHttpUrl } from "../utils/skillCatalog";

const SkillCatalog = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [form, setForm] = useState({
    skillName: "",
    category: "",
    courseLink: ""
  });
  const [editForm, setEditForm] = useState({
    skillName: "",
    category: "",
    courseLink: ""
  });
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

  const fetchSkills = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/skill-catalog", authHeader);
      const nextSkills = Array.isArray(res.data) ? res.data : [];
      nextSkills.sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
      setSkills(nextSkills);
    } catch (error) {
      console.error(error);
      setSkills([]);
      toast.error("Unable to load skill catalog");
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      return data.message || data.error || data.detail || data.title || fallback;
    }
    return fallback;
  };

  const upsertSkill = (nextSkill) => {
    if (!nextSkill) return;

    setSkills((prev) => {
      const currentSkills = Array.isArray(prev) ? prev : [];
      const withoutNextSkill = currentSkills.filter((skill) => String(skill.id) !== String(nextSkill.id));
      return [nextSkill, ...withoutNextSkill];
    });
    setCurrentPage(1);
  };

  const removeSkillFromState = (id) => {
    setSkills((prev) =>
      Array.isArray(prev) ? prev.filter((skill) => String(skill.id) !== String(id)) : []
    );
    setCurrentPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.skillName || !form.category) {
      toast.error("Please fill skill name and category");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        "http://localhost:8080/api/admin/skill-catalog",
        {
          skillName: form.skillName,
          category: form.category,
          courseLink: form.courseLink || ""
        },
        authHeader
      );
      toast.success("Skill added to catalog");
      upsertSkill(res.data);
      setForm({
        skillName: "",
        category: "",
        courseLink: ""
      });
      void fetchSkills();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Unable to add skill"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this skill from catalog?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/admin/skill-catalog/${id}`, authHeader);
      toast.success("Skill removed");
      removeSkillFromState(id);
      void fetchSkills();
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete skill");
    }
  };

  const handleEdit = (skill) => {
    setEditingId(skill.id);
    setEditForm({
      skillName: skill.skillName || "",
      category: skill.category || "",
      courseLink: skill.courseLink || ""
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editForm.skillName || !editForm.category) {
      toast.error("Please fill skill name and category");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.put(
        `http://localhost:8080/api/admin/skill-catalog/${editingId}`,
        {
          skillName: editForm.skillName,
          category: editForm.category,
          courseLink: editForm.courseLink || ""
        },
        authHeader
      );
      toast.success("Skill updated");
      upsertSkill(res.data);
      setEditModalOpen(false);
      setEditingId(null);
      setEditForm({ skillName: "", category: "", courseLink: "" });
      void fetchSkills();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Unable to update skill"));
    } finally {
      setSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingId(null);
    setEditForm({ skillName: "", category: "", courseLink: "" });
  };

  const filteredSkills = skills.filter((skill) => {
    if (!normalizedSearch) {
      return true;
    }

    const skillName = (skill.skillName || "").toLowerCase();
    const category = (skill.category || "").toLowerCase();
    const courseLink = (skill.courseLink || "").toLowerCase();

    return (
      skillName.includes(normalizedSearch) ||
      category.includes(normalizedSearch) ||
      courseLink.includes(normalizedSearch)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredSkills.length / itemsPerPage));
  const visiblePage = Math.min(currentPage, totalPages);
  const pagedSkills = filteredSkills.slice((visiblePage - 1) * itemsPerPage, visiblePage * itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 font-sans dark:bg-slate-900 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="w-full max-w-2xl rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/20 dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500">Edit Skill</p>
                <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Update catalog skill</h2>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full border border-slate-200 bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Close edit modal"
              >
                <FaTimes />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Skill Name</label>
                <input
                  name="skillName"
                  value={editForm.skillName}
                  onChange={handleEditChange}
                  placeholder="e.g. React"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-700"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Category</label>
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-700"
                >
                  <option value="">Select category</option>
                  <option value="Programming">Programming</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Course Link (optional)</label>
                <input
                  name="courseLink"
                  value={editForm.courseLink}
                  onChange={handleEditChange}
                  placeholder="https://example.com/course"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-700"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">This field is optional for a supporting course or resource.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-teal-900 px-4 py-3 font-bold text-white transition hover:bg-teal-950 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <FaEdit />
                  {submitting ? "Updating..." : "Update Skill"}
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-[2rem] bg-gradient-to-br from-teal-900 via-cyan-900 to-slate-950 p-5 text-white shadow-2xl shadow-slate-300/20">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/70">Admin Tools</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Skill Catalog</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
            Add the official skills and topics here. Employees will pick from this catalog when they add a skill to their profile.
          </p>
        </section>

        <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            <div className="mb-5 flex items-center gap-2">
              <FaPlus className="text-teal-900 dark:text-teal-300" />
              <h2 className="text-base font-bold dark:text-white">Add New Skill</h2>
            </div>
            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Skill Name</label>
                <input
                  name="skillName"
                  value={form.skillName}
                  onChange={handleChange}
                  placeholder="e.g. React"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-700"
                >
                  <option value="">Select category</option>
                  <option value="Programming">Programming</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Course Link (optional)</label>
                <input
                  name="courseLink"
                  value={form.courseLink}
                  onChange={handleChange}
                  placeholder="https://example.com/course"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-700"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Optional course or resource link for this skill.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-900 px-4 py-3 font-bold text-white transition hover:bg-teal-950 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FaPlus />
                {submitting ? "Saving..." : "Save Skill"}
              </button>
            </form>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <FaBookOpen className="text-teal-900 dark:text-teal-300" />
                  <h2 className="text-base font-bold dark:text-white">Existing Skills</h2>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {filteredSkills.length} skills available for employee selection.
                </p>
                {normalizedSearch && (
                  <p className="mt-2 text-sm font-medium text-teal-700 dark:text-teal-400">
                    Showing results for "{search}"
                  </p>
                )}
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 dark:border-slate-800 dark:text-slate-400">
                Loading catalog...
              </div>
            ) : filteredSkills.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pagedSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:border-teal-900 hover:shadow-xl hover:shadow-teal-900/10 dark:border-slate-800 dark:bg-slate-950/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{skill.category}</p>
                        <h3 className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                          {skill.skillName}
                        </h3>
                      </div>
                    <button
                      type="button"
                      onClick={() => handleEdit(skill)}
                      className="rounded-full bg-white p-2 text-teal-900 shadow-sm transition hover:bg-teal-50 dark:bg-slate-900 dark:hover:bg-teal-900/20"
                      aria-label="Edit skill"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(skill.id)}
                        className="rounded-full bg-white p-2 text-rose-500 shadow-sm transition hover:bg-rose-50 dark:bg-slate-900 dark:hover:bg-rose-900/20"
                        aria-label="Delete skill"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    {skill.courseLink && (
                      <div className="mt-3.5 rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                          Course Link
                        </div>
                        {(() => {
                          const safeUrl = toSafeHttpUrl(skill.courseLink);
                          return safeUrl ? (
                            <a
                              href={safeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-teal-900 transition hover:border-teal-300 hover:bg-teal-50 dark:border-slate-800 dark:bg-slate-950/60 dark:text-teal-300 dark:hover:bg-slate-800"
                            >
                              <span className="font-semibold truncate">{skill.courseLink}</span>
                              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Open</span>
                            </a>
                          ) : (
                            <span className="inline-flex w-full items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">
                              Invalid course link
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            {!loading && filteredSkills.length > 0 && (
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Page {visiblePage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={visiblePage === 1}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    aria-label="Previous page"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={visiblePage === totalPages}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    aria-label="Next page"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            )}
            {!loading && filteredSkills.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 dark:border-slate-800 dark:text-slate-400">
                {normalizedSearch ? "No matching skills found." : "No skills added yet."}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SkillCatalog;
