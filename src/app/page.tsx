"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 flex flex-col">
      {/* Simple navbar */}
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-slate-800">MPMS</span>
          <nav className="flex gap-3 text-sm">
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
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-xl mx-auto bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-3">
            Minimal Project Management System
          </h1>
          <p className="text-slate-600 mb-6 text-sm">
            Track projects, sprints, and tasks in a simple, production-minded
            dashboard.
          </p>
          <div className="flex gap-3">
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
        </div>
      </section>
    </main>
  );
}
