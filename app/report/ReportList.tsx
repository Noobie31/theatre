"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import SignOutButton from "@/components/auth/signout-button";


// Update the type to match new DB structure
type Report = {
  id: string;
  inserted_at: string;
  name: string;
  movie: string;
  running_day: string;
  sections: {
    title: string;
    rows: {
      class: number;
      tickets: number;
      gross: number;
      dis_gross: number;
      nett: number;
      gst18: number;
      gst12: number;
      online: number;
    }[];
  }[];
};

export default function ReportList() {
  const supabase = createClient();
  const [reports, setReports] = useState<Report[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchReports = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("reports")
        .select("id, inserted_at, name, movie, running_day, sections")
        .eq("user_id", user?.id)
        .order("inserted_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch reports:", error.message);
      } else {
        setReports(data as Report[]);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="p-4 border rounded-md">
      

<button
  className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
  onClick={() => router.push("/report/new")}
>
  ➕ Add Report
</button>

      {reports.length === 0 ? (
        <p className="text-gray-600">No reports found.</p>
      ) : (
        <ul className="space-y-2">
          {reports.map((report) => (
            <li
              key={report.id}
              className="p-4 border rounded bg-gray-100 cursor-pointer hover:bg-gray-200"
              onClick={() => router.push(`/report/${report.id}`)}
            >
              <div className="font-semibold text-lg">{report.name}</div>
              <div className="text-sm text-gray-600">
                🎬 {report.movie} | 🗓 Running Day: {report.running_day}
              </div>
              <div className="text-sm text-gray-700">
                🕒 {new Date(report.inserted_at).toLocaleString()}
              </div>
              <div className="text-sm font-medium text-green-700">
                Total Gross: ₹
                {report.sections
                  ?.flatMap((section) => section.rows)
                  .reduce((sum, row) => sum + (row?.gross || 0), 0)
                  .toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
