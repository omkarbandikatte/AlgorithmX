"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/auth") {
      router.push("/auth");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-10 h-10 border-4 border-accent-start border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && pathname !== "/auth") return null;

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
