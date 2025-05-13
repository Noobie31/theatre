"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const columnLabels = [
  "Class",
  "No. of Tickets",
  "Gross",
  "Dis. Gross",
  "Nett",
  "GST 18%",
  "GST 12%",
  "Online",
];

const SHOWS = [
  "Noon Show",
  "Matinee Show",
  "First Show",
  "Second Show",
  "Special Show",
  "Special Show",
];

export default function ReportDetailPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, name, movie, running_day, sections")
        .eq("id", params?.id)
        .single();

      if (error) {
        alert("Failed to fetch report: " + error.message);
        router.push("/");
      } else {
        setReport(data);
      }
    };

    if (params?.id) {
      fetchReport();
    }
  }, [params?.id]);

  if (!report) return <p>Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">📋 {report.name} - Report</h1>

      {/* Display Name, Movie, and Running Day */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="p-2 border rounded">
          <strong>Name:</strong> {report.name}
        </div>
        <div className="p-2 border rounded">
          <strong>Movie:</strong> {report.movie}
        </div>
        <div className="p-2 border rounded">
          <strong>Running Day:</strong> {report.running_day}
        </div>
      </div>

      {/* Check if sections data is available */}
      {report.sections && report.sections.length > 0 ? (
        report.sections.map((section: any, sectionIndex: number) => (
          <div key={sectionIndex} className="mb-12">
            <h2 className="text-lg font-bold mb-2">{SHOWS[sectionIndex]}</h2>
            <div className="overflow-x-auto">
              <table className="table-auto border border-collapse w-full text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    {columnLabels.map((label) => (
                      <th key={label} className="border p-2">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Check if rows and calculated data are available */}
                  {section.rows && section.rows.length > 0 ? (
                    section.rows.map((row: any, rowIndex: number) => (
                      <tr key={rowIndex}>
                        <td className="border p-1">{row.class || "N/A"}</td>
                        <td className="border p-1">{row.tickets || "N/A"}</td>
                        <td className="border p-1">
                          {section.calculated && section.calculated[rowIndex]
                            ? section.calculated[rowIndex].gross.toFixed(2)
                            : "N/A"}
                        </td>
                        <td className="border p-1">
                          {section.calculated && section.calculated[rowIndex]
                            ? section.calculated[rowIndex].disGross.toFixed(2)
                            : "N/A"}
                        </td>
                        <td className="border p-1">{row.nett || "N/A"}</td>
                        <td className="border p-1">
                          {section.calculated && section.calculated[rowIndex]
                            ? section.calculated[rowIndex].gst18.toFixed(2)
                            : "N/A"}
                        </td>
                        <td className="border p-1">
                          {section.calculated && section.calculated[rowIndex]
                            ? section.calculated[rowIndex].gst12.toFixed(2)
                            : "N/A"}
                        </td>
                        <td className="border p-1">{row.online || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="border p-2 text-center">
                        No rows available
                      </td>
                    </tr>
                  )}
                  {/* Totals Row */}
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border p-2">Total</td>
                    <td className="border p-2">{section.totals.tickets}</td>
                    <td className="border p-2">
                      {section.totals.gross.toFixed(2)}
                    </td>
                    <td className="border p-2">
                      {section.totals.disGross.toFixed(2)}
                    </td>
                    <td className="border p-2">{section.totals.nett.toFixed(2)}</td>
                    <td className="border p-2">{section.totals.gst18.toFixed(2)}</td>
                    <td className="border p-2">{section.totals.gst12.toFixed(2)}</td>
                    <td className="border p-2">
                      {section.totals.online.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <p>No sections available</p>
      )}
    </div>
  );
}
