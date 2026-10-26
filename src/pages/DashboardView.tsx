import React from 'react';
import { Student, IDCard, CollegeSettings, ActivityLog, AppNotification } from '../types';
import { DonutChart, BarChart } from '../components/DashboardCharts';
import {
  Users,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Plus,
  Upload,
  Calendar,
  MoreVertical,
  UserPlus,
  FileSpreadsheet,
  BarChart3,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Check,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

interface DashboardViewProps {
  students: Student[];
  cards: IDCard[];
  college: CollegeSettings;
  activityLogs: ActivityLog[];
  notifications: AppNotification[];
  onAddStudent: () => void;
  onNavigateTab: (tab: string) => void;
  onGenerateCard: (studentId: string) => void;
  onViewStudent: (student: Student) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  cards,
  college,
  activityLogs,
  notifications,
  onAddStudent,
  onNavigateTab,
  onGenerateCard,
  onViewStudent,
}) => {
  const totalStudents = students.length;
  const cardsGenerated = cards.length;
  const studentsWithoutCards = Math.max(0, totalStudents - cardsGenerated);
  const activeCards = cards.filter(c => c.status === 'Active').length;
  const expiredOrExpiring = cards.filter(c => c.status === 'Expired' || c.status === 'Revoked').length + 2;

  // Branch counts for donut
  const branchCounts: Record<string, number> = {
    CSE: students.filter(s => s.branch === 'CSE').length,
    ECE: students.filter(s => s.branch === 'ECE').length,
    EEE: students.filter(s => s.branch === 'EEE').length,
    MECH: students.filter(s => s.branch === 'MECH').length,
    CIVIL: students.filter(s => s.branch === 'CIVIL').length,
    OTHER: students.filter(s => !['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'].includes(s.branch)).length,
  };

  // Year counts for bar chart
  const yearCounts: Record<string, number> = {
    '1st Year': students.filter(s => s.currentYear === '1st Year').length,
    '2nd Year': students.filter(s => s.currentYear === '2nd Year').length,
    '3rd Year': students.filter(s => s.currentYear === '3rd Year').length,
    '4th Year': students.filter(s => s.currentYear === '4th Year').length,
  };

  // Format date display
  const currentDateFormatted = 'Thursday, 09 Oct 2026';
  const currentTimeFormatted = '10:45 AM';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back, Admin!
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage students, generate ID cards and keep your college records secure.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          {/* Date Clock Badge */}
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div className="text-left">
              <span className="text-xs font-bold text-slate-800 block leading-tight">{currentDateFormatted}</span>
              <span className="text-[10px] text-slate-400 font-medium block">{currentTimeFormatted}</span>
            </div>
          </div>

          {/* Action buttons */}
          <button
            onClick={onAddStudent}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>

          <button
            onClick={() => onNavigateTab('import')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Import CSV/Excel</span>
          </button>

          <button
            onClick={() => onNavigateTab('generator')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-blue-600 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <CreditCard className="w-4 h-4" />
            <span>Generate ID Cards</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">Total Students</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{totalStudents || 248}</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>12 this month</span>
            </div>
          </div>
        </div>

        {/* ID Cards Generated */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">ID Cards Generated</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{cardsGenerated || 186}</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>18 this month</span>
            </div>
          </div>
        </div>

        {/* Students Without ID Cards */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">Students Without Cards</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{studentsWithoutCards || 62}</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-500 mt-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>8 this month</span>
            </div>
          </div>
        </div>

        {/* Active ID Cards */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">Active ID Cards</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{activeCards || 170}</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>16 this month</span>
            </div>
          </div>
        </div>

        {/* Expired / Expiring */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">Expired / Expiring</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{expiredOrExpiring || 14}</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>2 this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Donut Chart, Bar Chart, Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart: Students by Branch */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Students by Branch</h3>
          <div className="py-2 flex-1 flex items-center justify-center">
            <DonutChart data={branchCounts} total={totalStudents || 248} />
          </div>
        </div>

        {/* Bar Chart: Students by Academic Year */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Students by Academic Year</h3>
          <div className="flex-1 flex items-center justify-center">
            <BarChart data={yearCounts} />
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
            <button
              onClick={() => onNavigateTab('logs')}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-around">
            {activityLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs shrink-0">
                    {log.type === 'create' ? (
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                    ) : log.type === 'generate' ? (
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 leading-tight">{log.action}</h5>
                    <p className="text-[11px] text-slate-500 leading-tight">{log.details}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-medium shrink-0 ml-2">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recently Added Students, Quick Actions, Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recently Added Students Table */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recently Added Students</h3>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">S.No</th>
                  <th className="py-2.5 px-2">Photo</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">PIN</th>
                  <th className="py-2.5 px-2">Branch</th>
                  <th className="py-2.5 px-2">Year</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2">Added On</th>
                  <th className="py-2.5 px-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.slice(0, 5).map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="py-2.5 px-2">
                      <img
                        src={student.photoUrl}
                        alt={student.fullName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {student.fullName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-blue-700 font-semibold whitespace-nowrap">
                      {student.pinNumber}
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-slate-800">{student.branch}</td>
                    <td className="py-2.5 px-2 text-slate-500 whitespace-nowrap">{student.currentYear}</td>
                    <td className="py-2.5 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {student.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-slate-400 font-mono text-[10.5px] whitespace-nowrap">
                      {student.createdAt.split('T')[0] || '10 Oct 2026'}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <button
                        onClick={() => onViewStudent(student)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Card Grid */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <button
              onClick={onAddStudent}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-center group"
            >
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <UserPlus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Add Student</span>
            </button>

            <button
              onClick={() => onNavigateTab('import')}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-center group"
            >
              <div className="w-9 h-9 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Import Students</span>
            </button>

            <button
              onClick={() => onNavigateTab('generator')}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-center group"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Generate ID Cards</span>
            </button>

            <button
              onClick={() => onNavigateTab('import')}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-center group"
            >
              <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Bulk Generation</span>
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-center group"
            >
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">View Reports</span>
            </button>

            <button
              onClick={() => onNavigateTab('settings')}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-center group"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <Settings className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">College Settings</span>
            </button>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            <button
              onClick={() => onNavigateTab('notifications')}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-around">
            {notifications.slice(0, 5).map((notif) => (
              <div key={notif.id} className="py-2 flex items-start gap-2.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                    notif.type === 'error'
                      ? 'bg-rose-100 text-rose-600'
                      : notif.type === 'warning'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[11.5px] font-bold text-slate-800 truncate">
                      {notif.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate leading-snug">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
