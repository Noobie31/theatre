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
  'Special Show',
];

export default function AnalyticsDashboard() {
  const supabase = createClient();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase.from('reports').select('*');
      if (!error) setReports(data);
    };

    fetchReports();
  }, []);

  if (!reports.length) return <p>Loading analytics...</p>;

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
      ticketsByShowType[index] += section.totals.tickets;
      grossTotal += section.totals.gross;
      nettTotal += section.totals.nett;
      onlineTotal += section.totals.online;
    });

    const key = report.running_day || 'Unknown';
    revenueByDay[key] = (revenueByDay[key] || 0) + report.sections.reduce((acc: number, s: any) => acc + s.totals.gross, 0);

    movieTickets[report.movie] = (movieTickets[report.movie] || 0) +
      report.sections.reduce((acc: number, s: any) => acc + s.totals.tickets, 0);
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
    <div className="w-full p-6 space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


        <div className="bg-white border rounded p-4 shadow">
          <h3 className="text-lg font-semibold mb-2">Revenue Split</h3>
          <Pie data={pieData} />
        </div>


        

        <div className="bg-white border rounded p-4 shadow col-span-2">
          <h3 className="text-lg font-semibold mb-2">Tickets Sold by Show Type</h3>
          <Bar data={barData} />
        </div>

        <div className="bg-white border rounded p-4 shadow col-span-2">
          <h3 className="text-lg font-semibold mb-2">Daily Revenue Trend</h3>
          <Line data={revenueData} />
        </div>

        <div className="bg-white border rounded p-4 shadow">
          <h3 className="text-lg font-semibold">Total Reports</h3>
          <p className="text-3xl">{totalReports}</p>
        </div>

        
      </div>

      <div className="bg-white border rounded p-4 shadow">
        
        <h3 className="text-lg font-semibold mb-2">🎬 Top Movies by Ticket Sales</h3>
        <table className="table-auto w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Movie</th>
              <th className="text-right p-2">Tickets</th>
            </tr>
          </thead>
          <tbody>
            {topMovies.map(([movie, tickets], i) => (
              <tr key={i}>
                <td className="p-2">{movie}</td>
                <td className="p-2 text-right">{tickets}</td>
                
              </tr>
            ))}
            
          </tbody>
          
        </table>
        
      </div>
    </div>
  );
}
