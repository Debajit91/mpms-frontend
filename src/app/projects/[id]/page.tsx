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

interface Task {
  _id: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  sprint?: Sprint | string;
}

interface ProjectSummary {
  project: Project;
  totalTasks: number;
  completedTasks: number;
  tasksInProgress: number;
  tasksInReview: number;
  tasksTodo: number;
  sprintCount: number;
  totalTimeLogged: number;
  progressPercentage: number;
}

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [isProjectEditOpen, setIsProjectEditOpen] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<ProjectSummary | null>(null);

  const [loadingData, setLoadingData] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState("");

  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [creatingSprint, setCreatingSprint] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [sprintForm, setSprintForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
  });
  const [taskForm, setTaskForm] = useState({
    title: "",
    sprintId: "",
    status: "todo" as "todo" | "in_progress" | "review" | "done",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  });

  const [projectForm, setProjectForm] = useState({
    title: "",
    client: "",
    description: "",
    status: "planned",
    startDate: "",
    endDate: "",
  });

  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // protect route
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // load project + sprints + tasks + summary
  useEffect(() => {
    if (!user || !id) return;

    async function loadData() {
      try {
        setLoadingData(true);
        setError("");

        // 🔹 summary এ project info + counts + progress আছে
        const summaryRes = await api.get(`/api/projects/${id}/summary`);
        setSummary(summaryRes.data);
        setProject(summaryRes.data.project);

        // sprints
        const sprintRes = await api.get(`/api/projects/${id}/sprints`);
        setSprints(sprintRes.data);

        // tasks (by project)
        setLoadingTasks(true);
        const taskRes = await api.get(`/api/tasks`, {
          params: { project: id },
        });
        setTasks(taskRes.data);
      } catch (err) {
        console.error("Load project details error:", err);
        setError("Failed to load project details");
      } finally {
        setLoadingData(false);
        setLoadingTasks(false);
      }
    }

    loadData();
  }, [user, id]);

  // Project Edit
  function openProjectEdit() {
    if (!project) return;

    setProjectForm({
      title: project.title || "",
      client: project.client || "",
      description: project.description || "",
      status: project.status || "planned",
      startDate: project.startDate ? project.startDate.slice(0, 10) : "",
      endDate: project.endDate ? project.endDate.slice(0, 10) : "",
    });

    setIsProjectEditOpen(true);
  }

  // Update project handler
  async function handleUpdateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    try {
      setSavingProject(true);

      const res = await api.put(`/api/projects/${id}`, {
        title: projectForm.title,
        client: projectForm.client,
        description: projectForm.description,
        status: projectForm.status,
        startDate: projectForm.startDate || undefined,
        endDate: projectForm.endDate || undefined,
      });

      // update UI
      setProject(res.data);

      setIsProjectEditOpen(false);
    } catch (err) {
      console.error("Update project error:", err);
      setError("Failed to update project");
    } finally {
      setSavingProject(false);
    }
  }

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

  async function handleDeleteSprint(sprintId: string) {
    const sure = window.confirm("Are you sure you want to delete this sprint?");
    if (!sure) return;

    try {
      await api.delete(`/api/sprints/${sprintId}`);

      setSprints((prev) => prev.filter((s) => s._id !== sprintId));

      setTasks((prev) =>
        prev.filter((t) => {
          if (typeof t.sprint === "string") {
            return t.sprint !== sprintId;
          }

          if (t.sprint && typeof t.sprint === "object" && "_id" in t.sprint) {
            return (t.sprint as Sprint)._id !== sprintId;
          }
          return true;
        })
      );
    } catch (err) {
      console.error("Delete sprint error:", err);
      setError("Failed to delete sprint");
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    if (!taskForm.sprintId) return;

    try {
      setCreatingTask(true);
      setError("");

      // Task create endpoint: POST /api/sprints/:sprintId/tasks
      const res = await api.post(`/api/sprints/${taskForm.sprintId}/tasks`, {
        title: taskForm.title,
        status: taskForm.status,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || undefined,
      });

      // নতুন task list এ add
      setTasks((prev) => [res.data, ...prev]);

      // reset form + close modal
      setTaskForm({
        title: "",
        sprintId: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
      });
      setIsTaskModalOpen(false);
    } catch (err) {
      console.error("Create task error:", err);
      setError("Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  }

  async function handleTaskStatusChange(
    taskId: string,
    status: Task["status"]
  ) {
    try {
      setUpdatingTaskId(taskId);

      await api.patch(`/api/tasks/${taskId}/status`, { status });

      // local state এও update
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId
            ? {
                ...t,
                status,
              }
            : t
        )
      );
    } catch (err) {
      console.error("Update task status error:", err);
      setError("Failed to update task status");
    } finally {
      setUpdatingTaskId(null);
    }
  }

  async function handleDeleteTask(taskId: string) {
    const sure = window.confirm("Are you sure you want to delete this task?");
    if (!sure) return;

    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error("Delete task error:", err);
      setError("Failed to delete task");
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
              <p className="text-xs text-slate-500">Client: {project.client}</p>
            )}
          </div>
          <div className="text-xs text-slate-500">
            Logged in as {user.name} ({user.role})
          </div>

          {(user.role === "Admin" || user.role === "Manager") && (
            <button
              className="text-xs text-blue-600 hover:underline ml-4"
              onClick={openProjectEdit}
            >
              Edit Project
            </button>
          )}

          {(user.role === "Admin" || user.role === "Manager") && (
            <button
              className="text-xs text-red-600 hover:underline ml-3"
              onClick={async () => {
                const sure = window.confirm(
                  "Delete this project and its data?"
                );
                if (!sure || !id) return;
                try {
                  await api.delete(`/api/projects/${id}`);
                  router.push("/projects");
                } catch (err) {
                  console.error("Delete project error:", err);
                  setError("Failed to delete project");
                }
              }}
            >
              Delete project
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {loadingData && (
          <p className="text-sm text-slate-500">Loading project...</p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {summary && (
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 text-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase text-slate-400 tracking-wide">
                  Project Progress
                </p>
                <p className="text-lg font-semibold">
                  {summary.progressPercentage}% complete
                </p>
                <p className="text-xs text-slate-500">
                  {summary.completedTasks} of {summary.totalTasks} tasks
                  completed
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Sprints: {summary.sprintCount}</p>
                <p>Time logged: {summary.totalTimeLogged}h</p>
              </div>
            </div>

            {/* progress bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${summary.progressPercentage}%` }}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
              <span>To Do: {summary.tasksTodo}</span>
              <span>In Progress: {summary.tasksInProgress}</span>
              <span>Review: {summary.tasksInReview}</span>
              <span>Done: {summary.completedTasks}</span>
            </div>
          </section>
        )}

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
                  <p className="mt-1 text-slate-600">{project.description}</p>
                )}
              </div>
              <div className="text-right text-xs text-slate-500">
                {project.startDate && (
                  <p>
                    Start: {new Date(project.startDate).toLocaleDateString()}
                  </p>
                )}
                {project.endDate && (
                  <p>End: {new Date(project.endDate).toLocaleDateString()}</p>
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

            {user.role === "Admin" || user.role === "Manager" ? (
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
                        `Start: ${new Date(s.startDate).toLocaleDateString()} `}
                      {s.endDate &&
                        `• End: ${new Date(s.endDate).toLocaleDateString()}`}
                    </p>
                  </div>

                  <button
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => {}}
                  >
                    View tasks
                  </button>
                  {(user.role === "Admin" || user.role === "Manager") && (
                    <button
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => handleDeleteSprint(s._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tasks section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">Tasks</h2>

            {(user.role === "Admin" || user.role === "Manager") &&
            sprints.length > 0 ? (
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                + Add Task
              </button>
            ) : (
              <button
                className="px-3 py-1 border border-slate-300 text-xs rounded text-slate-400 cursor-not-allowed"
                disabled
                title={
                  sprints.length === 0
                    ? "Create a sprint first"
                    : "Only Admin/Manager can create tasks"
                }
              >
                + Add Task
              </button>
            )}
          </div>

          {loadingTasks && (
            <p className="text-xs text-slate-500 mb-2">Loading tasks...</p>
          )}

          {tasks.length === 0 && !loadingTasks ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-lg p-4 text-xs text-slate-500 text-center">
              No tasks yet. Admin/Manager can add tasks to sprints.
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((t) => (
                <div
                  key={t._id}
                  className="bg-white rounded-lg border border-slate-200 p-3 flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium mb-1">{t.title}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium
    ${
      t.status === "done"
        ? "bg-green-100 text-green-700"
        : t.status === "in_progress"
        ? "bg-blue-100 text-blue-700"
        : t.status === "review"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-slate-100 text-slate-600"
    }`}
                        >
                          {t.status.replace("_", " ")}
                        </span>

                        <select
                          className="border border-slate-300 rounded px-2 py-1 text-xs bg-white"
                          value={t.status}
                          disabled={updatingTaskId === t._id}
                          onChange={(e) =>
                            handleTaskStatusChange(
                              t._id,
                              e.target.value as Task["status"]
                            )
                          }
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>

                      {t.priority && (
                        <span>
                          • Priority:{" "}
                          <span className="font-medium capitalize">
                            {t.priority}
                          </span>
                        </span>
                      )}
                      {t.dueDate && (
                        <span>
                          • Due: {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {(user.role === "Admin" || user.role === "Manager") && (
                    <button
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => handleDeleteTask(t._id)}
                    >
                      Delete
                    </button>
                  )}
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
                <label className="block text-sm font-medium mb-1">Title</label>
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

      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Add Task</h2>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sprint</label>
                <select
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={taskForm.sprintId}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      sprintId: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select sprint</option>
                  {sprints.map((s) => (
                    <option key={s._id} value={s._id}>
                      Sprint {s.sprintNumber}: {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={taskForm.status}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        status: e.target.value as typeof taskForm.status,
                      }))
                    }
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        priority: e.target.value as typeof taskForm.priority,
                      }))
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Due date
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={taskForm.dueDate}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-sm border border-slate-300 rounded hover:bg-slate-100"
                  disabled={creatingTask}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                  disabled={creatingTask}
                >
                  {creatingTask ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
