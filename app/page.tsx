"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // use client version here

import SignOutButton from "@/components/auth/signout-button";
import ReportList from "@/app/report/ReportList";
import Analytics from "@/components/analytics/Analytics";
import Link from "next/link";

export default function Home() {
  const supabase = createClient();

  // NOTE: This code runs on client, so we can't do redirect here,
  // you should protect page on server-side or use auth context
  // For demo purpose, we skip auth check here

  // Tabs state: 'reports' or 'analytics'
  const [activeTab, setActiveTab] = useState<"reports" | "analytics">("reports");

  return (
    <main className="min-h-screen flex flex-col gap-4 items-center justify-start">
      {/* Navbar */}
      <nav className="w-full p-4 bg-gray-800 text-white flex justify-between items-center">
        <div className="flex items-center gap-6">
          {/* Instead of a single Reports link, we have tabs */}
          <button
            className={`px-4 py-2 font-semibold rounded ${
              activeTab === "reports" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("reports")}
          >
            Reports
          </button>
          <button
            className={`px-4 py-2 font-semibold rounded ${
              activeTab === "analytics" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* SignOut Button */}
          <SignOutButton />
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-col w-full max-w-6xl border rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">
          {activeTab === "reports" ? "Reports" : "Analytics"}
        </h1>

        {activeTab === "reports" && <ReportList />}
        {activeTab === "analytics" && <Analytics />}
      </div>
    </main>
  );
}
