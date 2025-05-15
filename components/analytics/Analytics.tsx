'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Bar,
  Line,
  Pie
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

// Use unique show types
const showTypes = [
  'Noon Show',
  'Matinee Show',
  'First Show',
  'Second Show',
  'Special Show',
  'Late Night Show',
];

export default function AnalyticsDashboard() {
  const supabase = createClient();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      // Get current user ID
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Fetch only reports for the current user
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        setError(error.message);
      } else {
        setReports(data || []);
      }

      setLoading(false);
    };

    fetchReports();
  }, [supabase]);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!reports.length) return <p>No reports found.</p>;

  // Aggregate data
  const totalReports = reports.length;
  const ticketsByShowType = Array(showTypes.length).fill(0);
  const revenueByDay: Record<string, number> = {};
  const movieTickets: Record<string, number> = {};
  let grossTotal = 0;
  let nettTotal = 0;
  let onlineTotal = 0;

  reports.forEach((report) => {
    report.sections.forEach((section: any, index: number) => {
      ticketsByShowType[index] += section.totals.tickets || 0;
      grossTotal += section.totals.gross || 0;
      nettTotal += section.totals.nett || 0;
      onlineTotal += section.totals.online || 0;
    });

    const day = report.running_day || 'Unknown';
    revenueByDay[day] = (revenueByDay[day] || 0) + report.sections.reduce((acc: number, s: any) => acc + (s.totals.gross || 0), 0);

    movieTickets[report.movie] = (movieTickets[report.movie] || 0) +
      report.sections.reduce((acc: number, s: any) => acc + (s.totals.tickets || 0), 0);
  });

  const revenueData = {
    labels: Object.keys(revenueByDay),
    datasets: [
      {
        label: 'Gross Revenue per Day',
        data: Object.values(revenueByDay),
        fill: false,
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        tension: 0.3,
      },
    ],
  };

  const barData = {
    labels: showTypes,
    datasets: [
      {
        label: 'Tickets Sold',
        data: ticketsByShowType,
        backgroundColor: '#10b981',
      },
    ],
  };

  const pieData = {
    labels: ['Gross', 'Nett', 'Online'],
    datasets: [
      {
        data: [grossTotal, nettTotal, onlineTotal],
        backgroundColor: ['#6366f1', '#f59e0b', '#ef4444'],
        hoverOffset: 4,
      },
    ],
  };

  const topMovies = Object.entries(movieTickets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="w-full p-6 space-y-8 bg-gray-50">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white border rounded p-4 shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Split</h3>
          <Pie data={pieData} />
        </div>

        <div className="bg-white border rounded p-4 shadow md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Tickets Sold by Show Type</h3>
          <Bar data={barData} />
        </div>

        <div className="bg-white border rounded p-4 shadow md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Daily Revenue Trend</h3>
          <Line data={revenueData} />
        </div>

        <div className="bg-white border rounded p-4 shadow flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold mb-2">Total Reports</h3>
          <p className="text-4xl font-bold">{totalReports}</p>
        </div>

      </div>

      <div className="bg-white border rounded p-4 shadow">
        <h3 className="text-lg font-semibold mb-4">🎬 Top Movies by Ticket Sales</h3>
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-3">Movie</th>
              <th className="text-right p-3">Tickets</th>
            </tr>
          </thead>
          <tbody>
            {topMovies.map(([movie, tickets], i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{movie}</td>
                <td className="p-3 text-right">{tickets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
