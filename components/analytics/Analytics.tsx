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

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

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

  // Chart datasets and options

  const revenueData = {
    labels: Object.keys(revenueByDay),
    datasets: [
      {
        label: 'Gross Revenue',
        data: Object.values(revenueByDay),
        fill: false,
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 3,
      },
    ],
  };

  const revenueOptions = {
  responsive: true,
  plugins: {
    legend: { display: true, position: 'top' as const, labels: { font: { size: 14 }, color: '#374151' } },
    title: { display: true, text: 'Daily Gross Revenue Trend', font: { size: 20, weight: 'bold' }, color: '#111827' },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (ctx: any) => `₹${ctx.parsed.y.toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      title: { display: true, text: 'Day', font: { size: 14, weight: 'bold' }, color: '#374151' },
      grid: { display: false },
      ticks: { color: '#4b5563' },
    },
    y: {
      title: { display: true, text: 'Revenue (₹)', font: { size: 14, weight: 'bold' }, color: '#374151' },
      grid: { color: '#e5e7eb', borderDash: [5, 5] },
      ticks: { color: '#4b5563', beginAtZero: true },
    },
  },
} as const;

  const barData = {
    labels: showTypes,
    datasets: [
      {
        label: 'Tickets Sold',
        data: ticketsByShowType,
        backgroundColor: '#10b981',
        borderRadius: 5,
        borderSkipped: false,
        maxBarThickness: 40,
      },
    ],
  };

  const barOptions = {
  responsive: true,
  plugins: {
    legend: { display: true, position: 'top' as const, labels: { font: { size: 14 }, color: '#374151' } },
    title: { display: true, text: 'Tickets Sold by Show Type', font: { size: 20, weight: 'bold' }, color: '#111827' },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (ctx: any) => `${ctx.parsed.y.toLocaleString()} tickets`,
      },
    },
  },
  scales: {
    x: {
      title: { display: true, text: 'Show Type', font: { size: 14, weight: 'bold' }, color: '#374151' },
      grid: { display: false },
      ticks: { color: '#4b5563' },
    },
    y: {
      title: { display: true, text: 'Tickets Sold', font: { size: 14, weight: 'bold' }, color: '#374151' },
      grid: { color: '#e5e7eb', borderDash: [5, 5] },
      ticks: { color: '#4b5563', beginAtZero: true },
    },
  },
} as const;

  const pieData = {
    labels: ['Gross', 'Nett', 'Online'],
    datasets: [
      {
        data: [grossTotal, nettTotal, onlineTotal],
        backgroundColor: ['#6366f1', '#f59e0b', '#ef4444'],
        hoverOffset: 8,
        borderWidth: 1,
        borderColor: '#fff',
      },
    ],
  };

  const pieOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'right' as const, labels: { font: { size: 14 }, color: '#374151' } },
    title: { display: true, text: 'Revenue Distribution', font: { size: 20, weight: 'bold' }, color: '#111827' },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (ctx: any) => `${ctx.label}: ₹${ctx.parsed.toLocaleString()}`,
      },
    },
  },
} as const;


  const topMovies = Object.entries(movieTickets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="w-full p-6 space-y-8 bg-gray-50">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div className="bg-white border rounded p-6 shadow">
          <Pie data={pieData} options={pieOptions} />
        </div>

        <div className="bg-white border rounded p-6 shadow md:col-span-2">
          <Bar data={barData} options={barOptions} />
        </div>

        <div className="bg-white border rounded p-6 shadow md:col-span-2">
          <Line data={revenueData} options={revenueOptions} />
        </div>

        <div className="bg-white border rounded p-6 shadow flex flex-col items-center justify-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Total Reports</h3>
          <p className="text-5xl font-extrabold text-green-600">{totalReports}</p>
        </div>

      </div>

      <div className="bg-white border rounded p-6 shadow">
        <h3 className="text-xl font-bold text-gray-900 mb-5">🎬 Top Movies by Ticket Sales</h3>
        <table className="table-auto w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-4 font-semibold">Movie</th>
              <th className="text-right p-4 font-semibold">Tickets</th>
            </tr>
          </thead>
                <tbody>
        {topMovies.map(([movie, tickets], i) => (
          <tr key={i} className="border-t even:bg-gray-50 hover:bg-gray-100 transition-colors">
            <td className="p-4">{movie}</td>
            <td className="p-4 text-right font-mono">{tickets.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
);
}

