import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToasterClient } from "@/components/ToasterClient";

const inter = Inter({
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "MPMS",
  description: "Minimal Project Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body
        className="bg-slate-100"
      >
        <AuthProvider>
          {children}
          <ToasterClient/>
        </AuthProvider>
      </body>
    </html>
  );
}
