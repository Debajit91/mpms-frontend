"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col">
      {/* Simple navbar */}
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-slate-800">MPMS</span>

          <nav className="flex items-center gap-3 text-sm">
            {!user && (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-100"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </>
            )}

            {user && (
              <>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  {user.name} ({user.role})
                </span>
                <Link
                  href="/projects"
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-100"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-3">
            Minimal Project Management System
          </h1>
          <p className="text-slate-600 mb-6 text-sm">
            Track projects, sprints, and tasks in a simple, production-minded
            dashboard.
          </p>

          {!user ? (
            <div className="flex justify-center items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded border border-slate-300 text-sm hover:bg-slate-100"
              >
                Create account
              </Link>
            </div>
          ) : (
            <div className="flex justify-center items-center gap-3">
              <Link
                href="/projects"
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Go to dashboard
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 rounded border border-slate-300 text-sm hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
