import React from 'react';
import { ActivityLog } from '../types';
import {
  Clock,
  UserPlus,
  CreditCard,
  Edit,
  Trash2,
  ShieldAlert,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ActivityLogViewProps {
  logs: ActivityLog[];
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs }) => {
  const getIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'create':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'generate':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'update':
        return <Edit className="w-4 h-4 text-amber-600" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'revoke':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'import':
        return <FileSpreadsheet className="w-4 h-4 text-indigo-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Security & Audit Activity Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident chronological log of all administrator and institutional actions.
          </p>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-bold">
          {logs.length} Logged Events
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {logs.map((log) => (
          <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                {getIcon(log.type)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{log.action}</h4>
                <p className="text-xs text-slate-500">{log.details}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono font-medium text-slate-400 block">{log.timestamp}</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                by {log.performedBy}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
