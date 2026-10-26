import React, { useState } from 'react';
import { IDCard, Student, CardStatus } from '../types';
import {
  CreditCard,
  Search,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  QrCode,
  FileCheck,
} from 'lucide-react';

interface CardManagementViewProps {
  cards: IDCard[];
  students: Student[];
  onUpdateStatus: (cardId: string, status: CardStatus, reason?: string) => void;
  onReissueCard: (studentId: string) => void;
  onNavigateToVerify: (code: string) => void;
}

export const CardManagementView: React.FC<CardManagementViewProps> = ({
  cards,
  students,
  onUpdateStatus,
  onReissueCard,
  onNavigateToVerify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [revokeModalCardId, setRevokeModalCardId] = useState<string | null>(null);
  const [revocationReason, setRevocationReason] = useState('Card reported lost by student');

  const filteredCards = cards.filter(card => {
    const student = students.find(s => s.id === card.studentId);
    const matchesSearch =
      card.cardUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.verificationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student && student.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student && student.pinNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'ALL' || card.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleConfirmRevoke = () => {
    if (!revokeModalCardId) return;
    onUpdateStatus(revokeModalCardId, 'Revoked', revocationReason);
    setRevokeModalCardId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            ID Card Lifecycle & Access Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit issued credentials, monitor validity, reissue lost cards, and revoke compromised IDs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
            Active: {cards.filter(c => c.status === 'Active').length}
          </span>
          <span className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold">
            Revoked: {cards.filter(c => c.status === 'Revoked').length}
          </span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Search UID, Code, PIN, or Student Name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses ({cards.length})</option>
            <option value="Active">Active ({cards.filter(c => c.status === 'Active').length})</option>
            <option value="Revoked">Revoked ({cards.filter(c => c.status === 'Revoked').length})</option>
            <option value="Expired">Expired ({cards.filter(c => c.status === 'Expired').length})</option>
          </select>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Card UID & Code</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Revision</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Card Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">No ID cards found.</p>
                  </td>
                </tr>
              ) : (
                filteredCards.map(card => {
                  const student = students.find(s => s.id === card.studentId);
                  return (
                    <tr key={card.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block text-[11.5px]">
                          {card.cardUid}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {card.verificationCode}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {student?.photoUrl && (
                            <img
                              src={student.photoUrl}
                              alt={student.fullName}
                              className="w-7 h-7 rounded-full object-cover border"
                            />
                          )}
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {student?.fullName || 'Unknown Student'}
                            </span>
                            <span className="text-[10.5px] text-slate-400 font-mono">
                              {student?.pinNumber} ({student?.branch})
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {card.issueDate}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {card.expiryDate}
                      </td>

                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold text-[10.5px]">
                          v{card.version}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            card.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : card.status === 'Revoked'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {card.status}
                        </span>
                        {card.revocationReason && (
                          <span className="text-[10px] text-red-500 block mt-0.5 italic">
                            {card.revocationReason}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onNavigateToVerify(card.verificationCode)}
                            title="Test QR Verification"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {card.status === 'Active' ? (
                            <button
                              onClick={() => setRevokeModalCardId(card.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[11px] font-bold border border-red-200 transition-colors"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Revoke</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateStatus(card.id, 'Active')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold border border-emerald-200 transition-colors"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Reactivate</span>
                            </button>
                          )}

                          {student && (
                            <button
                              onClick={() => onReissueCard(student.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Reissue / Increment Revision"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Reason Modal */}
      {revokeModalCardId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-100">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Revoke Student ID Card</h3>
                <p className="text-xs text-slate-500">Immediate security invalidation</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Once revoked, this card will immediately <strong>FAIL public QR verification</strong>,
              preventing unauthorized campus or exam hall entry even if the card has not expired.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Select Revocation Reason *
              </label>
              <select
                value={revocationReason}
                onChange={e => setRevocationReason(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Card reported lost by student">Card reported lost by student</option>
                <option value="Card damaged or unreadable">Card damaged or unreadable</option>
                <option value="Student transferred to another college">Student transferred to another college</option>
                <option value="Student discontinued or graduated">Student discontinued or graduated</option>
                <option value="Disciplinary suspension by institution">Disciplinary suspension by institution</option>
                <option value="Fraudulent duplication attempt">Fraudulent duplication attempt</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setRevokeModalCardId(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
