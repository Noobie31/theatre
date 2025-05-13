import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import SignOutButton from "@/components/auth/signout-button";
import ReportList from "@/app/report/ReportList";
import Analytics from "@/components/analytics/Analytics"; // Assuming you will create this component
import Link from "next/link";

export default async function Home() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/signin");
  }

  return (
    <main className="min-h-screen flex flex-col gap-4 items-center justify-start">
      {/* Navbar */}
      <nav className="w-full p-4 bg-gray-800 text-white flex justify-between items-center">
        <div className="flex items-center gap-6">
          {/* Report Link */}
          <Link href="/reports" className="text-xl font-semibold">Reports</Link>
        </div>

        <div className="flex items-center gap-4">
          {/* SignOut Button */}
          <SignOutButton />
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-col w-full border rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Analytics & Reports</h1>

        {/* Analytics Section - Graphs/Charts */}
        <Analytics />

        {/* Report List Section */}
        <div className="mt-6">
          <ReportList />
        </div>
      </div>
    </main>
  );
}
