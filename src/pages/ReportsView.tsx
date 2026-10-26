import React from 'react';
import { Student, IDCard, CollegeSettings } from '../types';
import { BarChart3, Download, Printer, Users, CreditCard, ShieldCheck, PieChart, FileText } from 'lucide-react';
import Papa from 'papaparse';

interface ReportsViewProps {
  students: Student[];
  cards: IDCard[];
  college: CollegeSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  cards,
  college,
}) => {
  const totalStudents = students.length;
  const totalCards = cards.length;
  const activeCards = cards.filter(c => c.status === 'Active').length;
  const revokedCards = cards.filter(c => c.status === 'Revoked').length;
  const pendingCards = Math.max(0, totalStudents - totalCards);

  // Branch statistics
  const branches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'OTHER'];
  const branchStats = branches.map(b => {
    const branchStudents = students.filter(s => s.branch === b);
    const branchCards = branchStudents.filter(s => cards.some(c => c.studentId === s.id));
    const count = branchStudents.length;
    const cardsCount = branchCards.length;
    const pct = totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(1) : '0';
    return {
      branch: b,
      studentsCount: count,
      cardsIssued: cardsCount,
      percentage: pct,
    };
  });

  const handleExportCSVReport = () => {
    const reportData = branchStats.map(bs => ({
      'Branch / Department': bs.branch,
      'Total Students Enrolled': bs.studentsCount,
      'ID Cards Issued': bs.cardsIssued,
      'Issuance Percentage': `${bs.percentage}%`,
      'College': college.collegeName,
    }));

    const csv = Papa.unparse(reportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Institutional_ID_Card_Report_${college.academicYear.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Institutional Reports & ID Audits
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Departmental distribution, credential fulfillment metrics, and official audit exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSVReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export CSV Audit</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Students</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalStudents}</p>
          <span className="text-[11px] text-blue-600 font-medium">100% database enrolled</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Cards Issued</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{totalCards}</p>
          <span className="text-[11px] text-emerald-700 font-medium">
            {totalStudents > 0 ? ((totalCards / totalStudents) * 100).toFixed(0) : 0}% coverage
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pending IDs</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingCards}</p>
          <span className="text-[11px] text-amber-700 font-medium">Awaiting card creation</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Revoked Cards</span>
          <p className="text-2xl font-black text-red-600 mt-1">{revokedCards}</p>
          <span className="text-[11px] text-red-600 font-medium">Deactivated for security</span>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Departmental Credential Issuance Summary</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            AY {college.academicYear}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Department / Branch</th>
                <th className="py-3 px-4">Students Enrolled</th>
                <th className="py-3 px-4">Cards Issued</th>
                <th className="py-3 px-4">Pending Cards</th>
                <th className="py-3 px-4">Issuance Rate</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {branchStats.map((bs) => {
                const pending = Math.max(0, bs.studentsCount - bs.cardsIssued);
                const rate = bs.studentsCount > 0 ? (bs.cardsIssued / bs.studentsCount) * 100 : 0;
                return (
                  <tr key={bs.branch} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{bs.branch}</td>
                    <td className="py-3 px-4 font-semibold">{bs.studentsCount}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">{bs.cardsIssued}</td>
                    <td className="py-3 px-4 font-semibold text-amber-700">{pending}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            style={{ width: `${rate}%` }}
                            className="bg-blue-600 h-full rounded-full"
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold">{rate.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {rate >= 75 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Complete
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
