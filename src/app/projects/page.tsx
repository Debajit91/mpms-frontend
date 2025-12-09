"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";

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
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    client: "",
    status: "planned" as "planned" | "active" | "completed" | "archived",
  });

  // 🔒 protect route: not logged in → /login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // 📥 fetch projects from backend
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

  // যদি user না থাকে (router.replace trigger হওয়ার আগের মুহূর্তেও)
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
    } catch (err) {
      console.error("Create project error:", err);
      setError("Failed to create project");
    } finally {
      setCreating(false);
    }
  }

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
          <div className="flex gap-2">
            <Link
              href="/"
              className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-100"
            >
              Home
            </Link>

            {user.role === "Admin" || user.role === "Manager" ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                + New Project
              </button>
            ) : (
              <button
                className="px-3 py-1 border border-slate-300 text-sm rounded text-slate-400 cursor-not-allowed"
                disabled
                title="Only Admin/Manager can create projects"
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
            {projects.map((project) => (
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

      
    </div>
  );
}
