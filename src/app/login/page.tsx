"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-sm text-center">
        <p className="mb-4 text-sm">
          You are already logged in as{" "}
          <span className="font-semibold">{user.email}</span>.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            onClick={() => {
              window.location.href = "/projects";
            }}
          >
            Go to dashboard
          </button>
          <button
            className="px-4 py-2 border border-slate-300 text-sm rounded hover:bg-slate-100"
            onClick={() => {
              logout();
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const success = await login(email, password);

    if (!success) {
      setError("Invalid email or password");
      return;
    }

    router.push("/projects");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded">
          Login
        </button>

        <p className="mt-4 text-sm text-center text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
      </form>
      
    </div>
  );
}
