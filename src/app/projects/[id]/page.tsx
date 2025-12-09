"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";

interface Project {
  _id: string;
  title: string;
  client?: string;
  description?: string;
  status: "planned" | "active" | "completed" | "archived";
  startDate?: string;
  endDate?: string;
}

interface Sprint {
  _id: string;
  title: string;
  sprintNumber: number;
  startDate?: string;
  endDate?: string;
}

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [creatingSprint, setCreatingSprint] = useState(false);
  const [sprintForm, setSprintForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
  });

  // 🔒 protect route
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // 📥 load project + sprints
  useEffect(() => {
    if (!user || !id) return;

    async function loadData() {
      try {
        setLoadingData(true);
        setError("");

        // project details
        const projRes = await api.get(`/api/projects/${id}`);
        setProject(projRes.data);

        // sprints
        const sprintRes = await api.get(`/api/projects/${id}/sprints`);
        setSprints(sprintRes.data);
      } catch (err) {
        console.error("Load project details error:", err);
        setError("Failed to load project details");
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [user, id]);

  async function handleCreateSprint(e: React.FormEvent) {
    e.preventDefault();
    if (!sprintForm.title.trim()) return;
    if (!id) return;

    try {
      setCreatingSprint(true);
      setError("");

      const res = await api.post(`/api/projects/${id}/sprints`, {
        title: sprintForm.title,
        startDate: sprintForm.startDate || undefined,
        endDate: sprintForm.endDate || undefined,
      });

      // নতুন sprint list এ add
      setSprints((prev) => [...prev, res.data]);

      // reset form + close modal
      setSprintForm({
        title: "",
        startDate: "",
        endDate: "",
      });
      setIsSprintModalOpen(false);
    } catch (err) {
      console.error("Create sprint error:", err);
      setError("Failed to create sprint");
    } finally {
      setCreatingSprint(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/projects")}
              className="text-xs text-slate-500 hover:underline mb-1"
            >
              ← Back to Projects
            </button>
            <h1 className="text-lg font-semibold">
              {project ? project.title : "Project"}
            </h1>
            {project?.client && (
              <p className="text-xs text-slate-500">
                Client: {project.client}
              </p>
            )}
          </div>
          <div className="text-xs text-slate-500">
            Logged in as {user.name} ({user.role})
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {loadingData && (
          <p className="text-sm text-slate-500">Loading project...</p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Project summary box  */}
        {project && (
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-slate-500">
                  Status:{" "}
                  <span className="capitalize font-medium">
                    {project.status}
                  </span>
                </p>
                {project.description && (
                  <p className="mt-1 text-slate-600">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-slate-500">
                {project.startDate && (
                  <p>
                    Start:{" "}
                    {new Date(project.startDate).toLocaleDateString()}
                  </p>
                )}
                {project.endDate && (
                  <p>
                    End: {new Date(project.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Sprints section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Sprints / Milestones
            </h2>

            {(user.role === "Admin" || user.role === "Manager") ? (
              <button
                onClick={() => setIsSprintModalOpen(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                + Add Sprint
              </button>
            ) : (
              <button
                className="px-3 py-1 border border-slate-300 text-xs rounded text-slate-400 cursor-not-allowed"
                disabled
                title="Only Admin/Manager can create sprints"
              >
                + Add Sprint
              </button>
            )}
          </div>

          {sprints.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-lg p-4 text-xs text-slate-500 text-center">
              No sprints yet. Admin/Manager can add one.
            </div>
          ) : (
            <div className="space-y-2">
              {sprints.map((s) => (
                <div
                  key={s._id}
                  className="bg-white rounded-lg border border-slate-200 p-3 flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium">
                      Sprint {s.sprintNumber}: {s.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {s.startDate &&
                        `Start: ${new Date(
                          s.startDate
                        ).toLocaleDateString()} `}
                      {s.endDate &&
                        `• End: ${new Date(
                          s.endDate
                        ).toLocaleDateString()}`}
                    </p>
                  </div>
                  
                  <button
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => {
                      
                    }}
                  >
                    View tasks
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Sprint modal */}
      {isSprintModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Add Sprint</h2>

            <form onSubmit={handleCreateSprint} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title
                </label>
                <input
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={sprintForm.title}
                  onChange={(e) =>
                    setSprintForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Sprint title"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={sprintForm.startDate}
                    onChange={(e) =>
                      setSprintForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={sprintForm.endDate}
                    onChange={(e) =>
                      setSprintForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSprintModalOpen(false)}
                  className="px-4 py-2 text-sm border border-slate-300 rounded hover:bg-slate-100"
                  disabled={creatingSprint}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                  disabled={creatingSprint}
                >
                  {creatingSprint ? "Creating..." : "Create Sprint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
