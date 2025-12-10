"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

interface Project {
  _id: string;
  title: string;
  client?: string;
  status: "planned" | "active" | "completed" | "archived";
  startDate?: string;
  endDate?: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "planned" | "active" | "completed" | "archived"
  >("all");

  const [clientFilter, setClientFilter] = useState<string>("all");

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    client: "",
    status: "planned" as "planned" | "active" | "completed" | "archived",
  });

  // protect route: not logged in → /login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // fetch projects from backend
  useEffect(() => {
    if (!user) return;

    async function loadProjects() {
      try {
        setLoadingProjects(true);
        setError("");
        const res = await api.get("/api/projects");
        setProjects(res.data);
      } catch (err) {
        console.error("Fetch projects error:", err);
        setError("Failed to load projects");
      } finally {
        setLoadingProjects(false);
      }
    }

    loadProjects();
  }, [user]);

  // 🔄 Loading state (auth load হচ্ছে)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500 text-sm">Checking authentication...</p>
      </div>
    );
  }

  // যদি user না থাকে
  if (!user) {
    return null;
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      setCreating(true);
      setError("");

      const res = await api.post("/api/projects", {
        title: form.title,
        client: form.client || undefined,
        status: form.status,
      });

      // নতুন project list এ সংযোজন
      setProjects((prev) => [res.data, ...prev]);

      // form reset + modal close
      setForm({
        title: "",
        client: "",
        status: "planned",
      });
      setIsModalOpen(false);

      toast.success("Project created");
    } catch (err) {
      console.error("Create project error:", err);
      setError("Failed to create project");
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  const filteredProjects = projects.filter((p) => {
    const statusOk = statusFilter === "all" ? true : p.status === statusFilter;
    const clientOk = clientFilter === "all" ? true : p.client === clientFilter;
    return statusOk && clientOk;
  });

  const uniqueClients = Array.from(
    new Set(projects.map((p) => p.client).filter(Boolean))
  ) as string[];

  

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Projects</h1>
            <p className="text-xs text-slate-500">
              Logged in as {user.name} ({user.role})
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <select
              className="border border-slate-300 rounded px-2 py-1 text-xs cursor-pointer"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "all"
                    | "planned"
                    | "active"
                    | "completed"
                    | "archived"
                )
              }
            >
              <option value="all">All statuses</option>
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            {/* client filter */}
            <select
              className="border border-slate-300 rounded px-2 py-1 text-xs cursor-pointer"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            >
              <option value="all">All clients</option>
              {uniqueClients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>

            <Link
              href="/"
              className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-100"
            >
              Home
            </Link>

            {user.role === "Admin" || user.role === "Manager" ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 cursor-pointer"
              >
                + New Project
              </button>
            ) : (
              <button
                className="px-3 py-1 border border-slate-300 text-sm rounded text-slate-400 cursor-not-allowed"
                disabled
              >
                + New Project
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {loadingProjects && (
          <p className="text-sm text-slate-500 mb-3">Loading projects...</p>
        )}

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        {projects.length === 0 && !loadingProjects ? (
          <div className="bg-white rounded-lg p-6 text-center text-sm text-slate-500 border border-dashed border-slate-300">
            No projects yet. Click{" "}
            <span className="font-semibold">New Project</span> to create one.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project._id}`}
                className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition"
              >
                <h2 className="font-semibold mb-1">{project.title}</h2>
                {project.client && (
                  <p className="text-xs text-slate-500 mb-1">
                    Client: {project.client}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  Status:{" "}
                  <span className="capitalize font-medium">
                    {project.status}
                  </span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">New Project</h2>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Project title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Client</label>
                <input
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.client}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, client: e.target.value }))
                  }
                  placeholder="Client name (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value as Project["status"],
                    }))
                  }
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm border border-slate-300 rounded hover:bg-slate-100"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
