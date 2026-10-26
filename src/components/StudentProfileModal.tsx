import React from 'react';
import { Student, IDCard, CollegeSettings } from '../types';
import { X, CreditCard, Calendar, Phone, Mail, MapPin, Heart, Shield, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { IDCardPreview } from './IDCardPreview';

interface StudentProfileModalProps {
  student: Student | null;
  card?: IDCard;
  college: CollegeSettings;
  isOpen: boolean;
  onClose: () => void;
  onGenerateCard: (studentId: string) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  card,
  college,
  isOpen,
  onClose,
  onGenerateCard,
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/20 bg-slate-800">
              <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{student.fullName}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                PIN: {student.pinNumber} • Roll: {student.rollNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Card Status Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${card ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  {card ? `Identity Card Active (Rev ${card.version})` : 'Identity Card Not Yet Generated'}
                </h4>
                <p className="text-xs text-slate-500">
                  {card ? `UID: ${card.cardUid} • Code: ${card.verificationCode}` : 'Create official CR80 card for this student'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onGenerateCard(student.id);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>{card ? 'Reissue / Regenerate ID Card' : 'Generate ID Card Now'}</span>
            </button>
          </div>

          {/* Tabular details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academic Information */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5 text-blue-600">
                <FileText className="w-4 h-4" />
                <span>Academic Information</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Branch / Department</span>
                  <span className="font-bold text-slate-800">{student.branch}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Current Year</span>
                  <span className="font-bold text-slate-800">{student.currentYear}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Semester</span>
                  <span className="font-bold text-slate-800">{student.semester || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Academic Year</span>
                  <span className="font-bold text-slate-800">{student.academicYear}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Admission Date</span>
                  <span className="font-medium text-slate-700">{student.admissionDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">College</span>
                  <span className="font-medium text-slate-700 truncate block">{student.collegeName}</span>
                </div>
              </div>
            </div>

            {/* Personal & Emergency */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5 text-purple-600">
                <Shield className="w-4 h-4" />
                <span>Personal & Contact</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Blood Group</span>
                  <span className="font-bold text-red-600 flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-red-500" />
                    <span>{student.bloodGroup || 'N/A'}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Gender</span>
                  <span className="font-bold text-slate-800">{student.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Student Phone</span>
                  <span className="font-medium text-slate-700">{student.phoneNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Guardian / Emergency</span>
                  <span className="font-medium text-slate-700">{student.emergencyContact || student.parentContact || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Address</span>
                  <span className="font-medium text-slate-700">{student.address || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview of Card if exists */}
          {card && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Issued ID Card Preview
              </h3>
              <div className="flex justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto">
                <IDCardPreview student={student} card={card} college={college} side="both" scale={0.85} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
