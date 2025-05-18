'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

const NUM_ROWS = 5;
const SHOWS = [
  'Noon Show',
  'Matinee Show',
  'First Show',
  'Second Show',
  'Special Show',
];

const createEmptySection = () => ({
  rows: Array(NUM_ROWS).fill(null).map(() => ({
    class: '',
    tickets: '',
    nett: '',
    online: '',
  })),
  calculated: Array(NUM_ROWS).fill(null).map(() => ({
    disGross: 0,
    gross: 0,
    gst18: 0,
    gst12: 0,
    nett: 0,
  })),
  totals: {
    tickets: 0,
    gross: 0,
    disGross: 0,
    nett: 0,
    gst18: 0,
    gst12: 0,
    online: 0,
  },
});

export default function NewReportPage() {
  const [name, setName] = useState('');
  const [movie, setMovie] = useState('');
  const [runningDay, setRunningDay] = useState('');
  const [sections, setSections] = useState(SHOWS.map(() => createEmptySection()));

  const router = useRouter();
  const supabase = createClient();

  const calculateAllTotal = () => {
    const total = {
      tickets: 0,
      gross: 0,
      disGross: 0,
      nett: 0,
      gst18: 0,
      gst12: 0,
      online: 0,
    };
    for (const section of sections) {
      total.tickets += section.totals.tickets;
      total.gross += section.totals.gross;
      total.disGross += section.totals.disGross;
      total.nett += section.totals.nett;
      total.gst18 += section.totals.gst18;
      total.gst12 += section.totals.gst12;
      total.online += section.totals.online;
    }
    return total;
  };

  const handleInputChange = (sectionIndex: number, rowIndex: number, field: string, value: string) => {
    const newSections = [...sections];
    const section = newSections[sectionIndex];

    section.rows[rowIndex] = {
      ...section.rows[rowIndex],
      [field]: value,
    };

    const classVal = parseFloat(section.rows[rowIndex].class) || 0;
    const ticketsVal = parseFloat(section.rows[rowIndex].tickets) || 0;

    const disGross = classVal * ticketsVal;
    const gross = disGross + ticketsVal * 5;

    const gstRate = classVal > 100 ? 18 : 12;
    const gstBase = gstRate === 18 ? 118 : 112;
    const gstValue = disGross * (gstRate / gstBase);

    const gst18 = gstRate === 18 ? gstValue : 0;
    const gst12 = gstRate === 12 ? gstValue : 0;

    const nett = disGross - gstValue;

    section.calculated[rowIndex] = { disGross, gross, gst18, gst12, nett };

    const totals = {
      tickets: 0,
      gross: 0,
      disGross: 0,
      nett: 0,
      gst18: 0,
      gst12: 0,
      online: 0,
    };

    for (let i = 0; i < NUM_ROWS; i++) {
      const row = section.rows[i];
      totals.tickets += parseFloat(row.tickets) || 0;
      totals.online += parseFloat(row.online) || 0;

      totals.disGross += section.calculated[i].disGross;
      totals.gross += section.calculated[i].gross;
      totals.gst18 += section.calculated[i].gst18;
      totals.gst12 += section.calculated[i].gst12;
      totals.nett += section.calculated[i].nett;
    }

    section.totals = totals;
    setSections(newSections);
  };

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const finalData = sections.map((section, index) => ({
      title: SHOWS[index],
      rows: section.rows.map((row, i) => ({
        ...row,
        ...section.calculated[i],
      })),
      totals: section.totals,
    }));

    const allTotal = calculateAllTotal();

    const { error } = await supabase.from('reports').insert([{
      user_id: user?.id,
      name,
      movie,
      running_day: runningDay,
      sections: finalData,
      all_total: allTotal,
    }]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Report saved!');
      router.push('/');
    }
  };

  const allTotal = calculateAllTotal();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">➕ New Report</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <input type="text" placeholder="Name" className="p-2 border rounded" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Movie" className="p-2 border rounded" value={movie} onChange={(e) => setMovie(e.target.value)} />
        <input type="text" placeholder="Running Day" className="p-2 border rounded" value={runningDay} onChange={(e) => setRunningDay(e.target.value)} />
      </div>

      {sections.map((section, sectionIndex) => (
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
                {section.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={row.class && row.class.trim() !== '' ? 'bg-green-100' : 'bg-red-100'}
                  >
                    <td className="border p-1">
                      <input
                        type="number"
                        value={row.class}
                        onChange={(e) => handleInputChange(sectionIndex, rowIndex, 'class', e.target.value)}
                        className="w-full p-1 border"
                      />
                    </td>
                    <td className="border p-1">
                      <input
                        type="number"
                        value={row.tickets}
                        onChange={(e) => handleInputChange(sectionIndex, rowIndex, 'tickets', e.target.value)}
                        className="w-full p-1 border"
                      />
                    </td>
                    <td className="border p-1">{section.calculated[rowIndex].gross.toFixed(2) || 'N/A'}</td>
                    <td className="border p-1">{section.calculated[rowIndex].disGross.toFixed(2) || 'N/A'}</td>
                    <td className="border p-1">{section.calculated[rowIndex].nett.toFixed(2) || 'N/A'}</td>
                    <td className="border p-1">{section.calculated[rowIndex].gst18.toFixed(2) || 'N/A'}</td>
                    <td className="border p-1">{section.calculated[rowIndex].gst12.toFixed(2) || 'N/A'}</td>
                    <td className="border p-1">
                      <input
                        type="number"
                        value={row.online}
                        onChange={(e) => handleInputChange(sectionIndex, rowIndex, 'online', e.target.value)}
                        className="w-full p-1 border"
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-semibold">
                  <td className="border p-2">Total</td>
                  <td className="border p-2">{section.totals.tickets}</td>
                  <td className="border p-2">{section.totals.gross.toFixed(2)}</td>
                  <td className="border p-2">{section.totals.disGross.toFixed(2)}</td>
                  <td className="border p-2">{section.totals.nett.toFixed(2)}</td>
                  <td className="border p-2">{section.totals.gst18.toFixed(2)}</td>
                  <td className="border p-2">{section.totals.gst12.toFixed(2)}</td>
                  <td className="border p-2">{section.totals.online.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* All Total Row */}
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
              <td className="border p-2">{allTotal.tickets}</td>
              <td className="border p-2">{allTotal.gross.toFixed(2)}</td>
              <td className="border p-2">{allTotal.disGross.toFixed(2)}</td>
              <td className="border p-2">{allTotal.nett.toFixed(2)}</td>
              <td className="border p-2">{allTotal.gst18.toFixed(2)}</td>
              <td className="border p-2">{allTotal.gst12.toFixed(2)}</td>
              <td className="border p-2">{allTotal.online.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button onClick={handleSubmit} className="mt-6 bg-blue-600 text-white px-4 py-2 rounded">
        ✅ Save Full Report
      </button>
    </div>
  );
}
