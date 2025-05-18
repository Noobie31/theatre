'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const columnLabels = [
  'Class',
  'No. of Tickets',
  'Gross',
  'Dis. Gross',
  'Nett',
  'GST 18%',
  'GST 12%',
  'Online',
];

const SHOWS = [
  'Noon Show',
  'Matinee Show',
  'First Show',
  'Second Show',
  'Special Show',
  // Removed duplicate "Special Show"
];

export default function ReportDetailPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('id, name, movie, running_day, sections, all_total')  // <-- include all_total here
        .eq('id', params?.id)
        .single();

      if (error) {
        alert('Failed to fetch report: ' + error.message);
        router.push('/');
      } else {
        setReport(data);
      }
    };

    if (params?.id) {
      fetchReport();
    }
  }, [params?.id]);

  if (!report) return <p>Loading...</p>;

  const renderCell = (value: any, fixed = false) => {
    const isNA = value === undefined || value === null || value === '';
    const displayValue = isNA ? 'N/A' : fixed ? Number(value).toFixed(2) : value;
    const className = `border p-1 ${isNA ? 'bg-red-100' : ''}`;
    return <td className={className}>{displayValue}</td>;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">📋 {report.name} - Report</h1>

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

      {report.sections && report.sections.length > 0 ? (
        report.sections.map((section: any, sectionIndex: number) => (
          <div key={sectionIndex} className="mb-12">
            <h2 className="text-lg font-bold mb-2">{SHOWS[sectionIndex]}</h2>
            <div className="overflow-x-auto">
              <table className="table-auto border border-collapse w-full text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    {columnLabels.map((label) => (
                      <th key={label} className="border p-2">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows && section.rows.length > 0 ? (
                    section.rows.map((row: any, rowIndex: number) => (
                      <tr key={rowIndex}>
                        {renderCell(row.class)}
                        {renderCell(row.tickets)}
                        {renderCell(row.gross, true)}
                        {renderCell(row.disGross, true)}
                        {renderCell(row.nett)}
                        {renderCell(row.gst18, true)}
                        {renderCell(row.gst12, true)}
                        {renderCell(row.online)}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="border p-2 text-center">
                        No rows available
                      </td>
                    </tr>
                  )}

                  <tr className="bg-gray-100 font-semibold">
                    <td className="border p-2">Total</td>
                    <td className="border p-2">{section.totals?.tickets ?? 0}</td>
                    <td className="border p-2">
                      {section.totals?.gross !== undefined
                        ? Number(section.totals.gross).toFixed(2)
                        : '0.00'}
                    </td>
                    <td className="border p-2">
                      {section.totals?.disGross !== undefined
                        ? Number(section.totals.disGross).toFixed(2)
                        : '0.00'}
                    </td>
                    <td className="border p-2">
                      {section.totals?.nett !== undefined
                        ? Number(section.totals.nett).toFixed(2)
                        : '0.00'}
                    </td>
                    <td className="border p-2">
                      {section.totals?.gst18 !== undefined
                        ? Number(section.totals.gst18).toFixed(2)
                        : '0.00'}
                    </td>
                    <td className="border p-2">
                      {section.totals?.gst12 !== undefined
                        ? Number(section.totals.gst12).toFixed(2)
                        : '0.00'}
                    </td>
                    <td className="border p-2">
                      {section.totals?.online !== undefined
                        ? Number(section.totals.online).toFixed(2)
                        : '0.00'}
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

      {/* Display All Total from all_total column */}
      {report.all_total && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">All Total</h2>
          <table className="table-auto border border-collapse w-full text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Tickets</th>
                <th className="border p-2">Gross</th>
                <th className="border p-2">Dis. Gross</th>
                <th className="border p-2">Nett</th>
                <th className="border p-2">GST 18%</th>
                <th className="border p-2">GST 12%</th>
                <th className="border p-2">Online</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-blue-100 font-semibold">
                <td className="border p-2">{report.all_total.tickets ?? 0}</td>
                <td className="border p-2">{Number(report.all_total.gross ?? 0).toFixed(2)}</td>
                <td className="border p-2">{Number(report.all_total.disGross ?? 0).toFixed(2)}</td>
                <td className="border p-2">{Number(report.all_total.nett ?? 0).toFixed(2)}</td>
                <td className="border p-2">{Number(report.all_total.gst18 ?? 0).toFixed(2)}</td>
                <td className="border p-2">{Number(report.all_total.gst12 ?? 0).toFixed(2)}</td>
                <td className="border p-2">{Number(report.all_total.online ?? 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
