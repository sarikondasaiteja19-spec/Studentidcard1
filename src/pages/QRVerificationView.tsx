import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { CollegeSettings, Student, IDCard } from '../types';
import {
  QrCode,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  HelpCircle,
  Search,
  CheckCircle2,
  Lock,
  Building2,
  Calendar,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface QRVerificationViewProps {
  college: CollegeSettings;
  initialCode?: string;
}

export const QRVerificationView: React.FC<QRVerificationViewProps> = ({
  college,
  initialCode,
}) => {
  const [verificationCode, setVerificationCode] = useState(initialCode || '');
  const [hasSearched, setHasSearched] = useState(false);
  const [result, setResult] = useState<{
    card?: IDCard;
    student?: Student;
    status: 'Valid' | 'Expired' | 'Revoked' | 'Not Found';
  }>({ status: 'Not Found' });

  // Load existing cards for quick test selection
  const allCards = storage.getIDCards();
  const allStudents = storage.getStudents();

  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
  }, [initialCode]);

  const handleVerify = (codeToTest?: string) => {
    const code = (codeToTest !== undefined ? codeToTest : verificationCode).trim();
    if (!code) return;

    setHasSearched(true);
    const lookup = storage.getCardByVerificationCode(code);
    setResult(lookup);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <QrCode className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Public Student ID Verification Portal
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Scan the QR code on any institutional identity card or enter the cryptographic verification identifier below to confirm card authenticity.
        </p>
      </div>

      {/* Code Search Input */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Verification Code or Card UID *
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. VER-GPT-CSE2601-9921 or GPT-2026-984321"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
            <button
              onClick={() => handleVerify()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
            >
              Verify Now
            </button>
          </div>
        </div>

        {/* Quick Test Links */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            Quick Test Identifiers from Database:
          </span>
          <div className="flex flex-wrap gap-2">
            {allCards.slice(0, 4).map(c => {
              const s = allStudents.find(std => std.id === c.studentId);
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setVerificationCode(c.verificationCode);
                    handleVerify(c.verificationCode);
                  }}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                    c.status === 'Revoked'
                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  {s?.fullName.split(' ')[0]}: {c.verificationCode} ({c.status})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Verification Results Display */}
      {hasSearched && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
          {/* Status Header Badge */}
          {result.status === 'Valid' && (
            <div className="bg-emerald-600 text-white p-5 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-200 shrink-0" />
              <div>
                <h3 className="text-lg font-black tracking-wide uppercase">
                  Verified Genuine & Active
                </h3>
                <p className="text-xs text-emerald-100">
                  This identity card is officially recorded in the institutional registry.
                </p>
              </div>
            </div>
          )}

          {result.status === 'Revoked' && (
            <div className="bg-red-600 text-white p-5 flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-red-200 shrink-0" />
              <div>
                <h3 className="text-lg font-black tracking-wide uppercase">
                  Card Revoked / Invalid
                </h3>
                <p className="text-xs text-red-100">
                  This card has been deactivated or reported lost by college authorities. Entry not permitted.
                </p>
              </div>
            </div>
          )}

          {result.status === 'Expired' && (
            <div className="bg-amber-600 text-white p-5 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-200 shrink-0" />
              <div>
                <h3 className="text-lg font-black tracking-wide uppercase">
                  Identity Card Expired
                </h3>
                <p className="text-xs text-amber-100">
                  The validity period for this student credential has elapsed.
                </p>
              </div>
            </div>
          )}

          {result.status === 'Not Found' && (
            <div className="bg-slate-800 text-white p-5 flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-slate-400 shrink-0" />
              <div>
                <h3 className="text-lg font-black tracking-wide uppercase">
                  Record Not Found
                </h3>
                <p className="text-xs text-slate-300">
                  No institutional record matches this verification identifier. Please inspect card barcode or contact administration.
                </p>
              </div>
            </div>
          )}

          {/* Approved Public Card Details */}
          {result.student && result.card && (
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={result.student.photoUrl}
                  alt={result.student.fullName}
                  className="w-16 h-20 rounded-xl object-cover border-2 border-slate-200 shadow-xs"
                />
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 uppercase">
                    {result.student.fullName}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    {college.collegeName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      PIN: {result.student.pinNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {result.student.branch} ({result.student.currentYear})
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Metadata Table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Card UID</span>
                  <span className="font-mono font-bold text-slate-800">{result.card.cardUid}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Issue Date</span>
                  <span className="font-semibold text-slate-800">{result.card.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Expiry Date</span>
                  <span className="font-semibold text-slate-800">{result.card.expiryDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Academic Year</span>
                  <span className="font-semibold text-slate-800">{result.student.academicYear}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Card Version</span>
                  <span className="font-mono font-bold text-slate-800">Revision {result.card.version}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Authorized Signatory</span>
                  <span className="font-semibold text-slate-800">{college.signatoryName}</span>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Privacy Protected: Personal phone numbers, home addresses, date of birth, and guardian records are strictly withheld from public verification.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
