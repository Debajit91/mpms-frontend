"use client"
import { useEffect } from "react";

export default function HomePage() {

  useEffect(() => {
  console.log(process.env.NEXT_PUBLIC_API_BASE_URL);
}, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-2">
          MPMS Frontend
        </h1>
        <p className="text-gray-600 mb-4">
          Minimal Project Management System
        </p>
        <p className="text-sm text-gray-500">
          Login & dashboard coming up next...
        </p>
      </div>
    </main>
  );
}