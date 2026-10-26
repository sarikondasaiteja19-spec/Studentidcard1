import React, { useEffect, useState } from 'react';
import { Student, IDCard, CollegeSettings } from '../types';
import { generateQRCodeDataUrl } from '../utils/idCardGenerator';
import { GraduationCap, ShieldCheck, Heart, Phone, MapPin, Globe, CheckCircle2, QrCode } from 'lucide-react';

interface IDCardPreviewProps {
  student: Student;
  card?: IDCard;
  college: CollegeSettings;
  side?: 'front' | 'back' | 'both';
  scale?: number;
  onFlip?: () => void;
  showShadow?: boolean;
}

export const IDCardPreview: React.FC<IDCardPreviewProps> = ({
  student,
  card,
  college,
  side = 'front',
  scale = 1,
  showShadow = true,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const verificationCode = card?.verificationCode || `VER-GPT-${student.branch}-${student.rollNumber.slice(-3)}`;
  const cardUid = card?.cardUid || `GPT-2026-${student.rollNumber}89`;
  const expiryDate = card?.expiryDate || '2029-06-30';
  const issueDate = card?.issueDate || '2026-10-10';

  useEffect(() => {
    let isMounted = true;
    const verifyPayload = JSON.stringify({
      app: 'SmartStudentIDPro',
      code: verificationCode,
      pin: student.pinNumber,
      college: college.collegeName,
      status: card?.status || 'Active',
    });

    generateQRCodeDataUrl(verifyPayload).then(url => {
      if (isMounted) setQrCodeUrl(url);
    });

    return () => {
      isMounted = false;
    };
  }, [verificationCode, student.pinNumber, college.collegeName, card?.status]);

  // Template styling configs
  const template = card?.templateId || college.defaultTemplate || 'modern-tech';

  const templateStyles = {
    'modern-tech': {
      headerBg: 'bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white',
      accentBar: 'bg-cyan-500',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-200',
      highlightText: 'text-blue-700',
      cornerAccent: 'border-cyan-500',
      cardBorder: 'border-slate-300',
    },
    'classic-navy': {
      headerBg: 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white',
      accentBar: 'bg-amber-400',
      badgeBg: 'bg-indigo-100 text-indigo-950 border-indigo-200',
      highlightText: 'text-indigo-800',
      cornerAccent: 'border-amber-400',
      cardBorder: 'border-slate-300',
    },
    'minimal-slate': {
      headerBg: 'bg-gradient-to-r from-slate-800 to-slate-900 text-white',
      accentBar: 'bg-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      highlightText: 'text-emerald-700',
      cornerAccent: 'border-emerald-500',
      cardBorder: 'border-slate-300',
    },
    'elegant-maroon': {
      headerBg: 'bg-gradient-to-r from-red-950 via-rose-900 to-red-900 text-white',
      accentBar: 'bg-amber-500',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-200',
      highlightText: 'text-rose-800',
      cornerAccent: 'border-amber-500',
      cardBorder: 'border-amber-200',
    },
  }[template] || {
    headerBg: 'bg-slate-900 text-white',
    accentBar: 'bg-blue-500',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    highlightText: 'text-blue-600',
    cornerAccent: 'border-blue-500',
    cardBorder: 'border-slate-300',
  };

  const renderFrontCard = () => (
    <div
      id={`id-card-front-${student.id}`}
      className={`relative w-[420px] h-[264px] bg-white rounded-2xl overflow-hidden border ${templateStyles.cardBorder} select-none flex flex-col justify-between transition-transform duration-300 ${
        showShadow ? 'shadow-xl shadow-slate-200/60' : ''
      }`}
      style={{
        width: `${420 * scale}px`,
        height: `${264 * scale}px`,
        transformOrigin: 'top left',
      }}
    >
      {/* Top Header */}
      <div className={`${templateStyles.headerBg} px-4 py-2.5 relative`}>
        <div className="flex items-center gap-2.5">
          {college.logoUrl ? (
            <img src={college.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-full bg-white p-0.5 shadow-sm" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <GraduationCap className="w-5 h-5 text-amber-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-black uppercase tracking-wide truncate leading-tight text-white drop-shadow-sm">
              {college.collegeName}
            </h3>
            <p className="text-[9px] text-slate-300 truncate font-medium">
              {college.tagline || 'State Board of Technical Education & Training'}
            </p>
            <div className="flex items-center gap-2 text-[8px] text-slate-300/90 font-semibold tracking-wider">
              <span>ACADEMIC YEAR: {student.academicYear || college.academicYear}</span>
              <span>•</span>
              <span className="text-amber-300 font-bold">STUDENT ID</span>
            </div>
          </div>
        </div>

        {/* Accent strip */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${templateStyles.accentBar}`} />
      </div>

      {/* Main Content Area */}
      <div className="px-4 py-2.5 flex-1 flex gap-3.5 items-center bg-white relative">
        {/* Background watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <GraduationCap className="w-48 h-48 text-slate-900" />
        </div>

        {/* Student Photo */}
        <div className="relative shrink-0 flex flex-col items-center">
          <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-sm relative group">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={student.fullName}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <GraduationCap className="w-8 h-8 mb-1" />
                <span className="text-[9px] font-semibold">NO PHOTO</span>
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-slate-900/75 py-0.5 text-center">
              <span className="text-[8px] font-bold text-white tracking-widest uppercase">
                {student.status}
              </span>
            </div>
          </div>
          {student.bloodGroup && (
            <div className="mt-1 flex items-center gap-1 bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200 text-[9px] font-bold">
              <Heart className="w-2.5 h-2.5 fill-red-500 text-red-500" />
              <span>{student.bloodGroup}</span>
            </div>
          )}
        </div>

        {/* Student Details Fields */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="mb-1.5">
            <h2 className="text-[15px] font-extrabold text-slate-900 uppercase tracking-tight truncate leading-snug">
              {student.fullName}
            </h2>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 shadow-2xs ${templateStyles.badgeBg}">
              <span>{student.branch}</span>
              <span>•</span>
              <span>{student.currentYear}</span>
              {student.semester && <span className="text-slate-500">({student.semester})</span>}
            </div>
          </div>

          <div className="space-y-1 text-[10.5px]">
            <div className="flex items-center">
              <span className="w-18 text-slate-500 font-semibold text-[10px]">PIN NO:</span>
              <span className="font-mono font-bold text-slate-900 tracking-wider text-[11px] bg-slate-50 px-1 py-0.2 rounded border border-slate-200">
                {student.pinNumber}
              </span>
            </div>

            <div className="flex items-center">
              <span className="w-18 text-slate-500 font-semibold text-[10px]">ROLL NO:</span>
              <span className="font-bold text-slate-800">{student.rollNumber}</span>
            </div>

            <div className="flex items-center">
              <span className="w-18 text-slate-500 font-semibold text-[10px]">VALID TILL:</span>
              <span className="font-semibold text-emerald-700">{expiryDate}</span>
            </div>

            {student.phoneNumber && (
              <div className="flex items-center">
                <span className="w-18 text-slate-500 font-semibold text-[10px]">PHONE:</span>
                <span className="text-slate-700 font-medium text-[10px]">{student.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* QR Code and Verification Area */}
        <div className="shrink-0 flex flex-col items-center justify-center pl-1 border-l border-slate-100">
          <div className="p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 object-contain" />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center bg-slate-50">
                <QrCode className="w-8 h-8 text-slate-400 animate-pulse" />
              </div>
            )}
          </div>
          <span className="text-[7.5px] font-bold text-slate-500 tracking-wider mt-1 text-center">
            SCAN TO VERIFY
          </span>

          {/* Digital Signature */}
          <div className="mt-2 text-center">
            <p className="text-[8.5px] font-serif italic font-bold text-slate-800 leading-none">
              {college.signatoryName}
            </p>
            <div className="w-16 h-[0.5px] bg-slate-400 mx-auto mt-0.5" />
            <p className="text-[7px] text-slate-500 uppercase font-semibold tracking-wider">
              {college.signatoryTitle || 'Principal'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer Ribbon */}
      <div className="bg-slate-900 text-white px-4 py-1.5 flex items-center justify-between text-[8px] font-semibold tracking-wide">
        <span className="flex items-center gap-1 text-cyan-400">
          <ShieldCheck className="w-3 h-3" />
          <span>UID: {cardUid}</span>
        </span>
        <span className="text-slate-400">
          ISSUED: {issueDate}
        </span>
        <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40 font-mono">
          {card?.version ? `REV ${card.version}` : 'REV 1'}
        </span>
      </div>
    </div>
  );

  const renderBackCard = () => (
    <div
      id={`id-card-back-${student.id}`}
      className={`relative w-[420px] h-[264px] bg-white rounded-2xl overflow-hidden border ${templateStyles.cardBorder} select-none flex flex-col justify-between transition-transform duration-300 ${
        showShadow ? 'shadow-xl shadow-slate-200/60' : ''
      }`}
      style={{
        width: `${420 * scale}px`,
        height: `${264 * scale}px`,
        transformOrigin: 'top left',
      }}
    >
      {/* Back Header Banner */}
      <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-bold tracking-wider uppercase">
            TERMS & IMPORTANT INSTRUCTIONS
          </span>
        </div>
        <span className="text-[9px] text-slate-400 font-mono">CR80 • ISO/IEC 7810</span>
      </div>

      {/* Back Instructions */}
      <div className="px-5 py-2.5 flex-1 flex flex-col justify-between text-[9px] text-slate-700">
        <div className="space-y-1.5">
          <p className="font-bold text-slate-900 text-[10px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            General Instructions:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 text-[8.5px] leading-relaxed pl-1">
            <li>This card must be worn and clearly displayed at all times inside the college campus.</li>
            <li>In case of loss or theft, notify the Principal&apos;s office and security immediately.</li>
            <li>This card is non-transferable. Impersonation is punishable under cyber & college statutes.</li>
            <li>Surrender this card to college administration upon course completion or transfer.</li>
          </ul>
        </div>

        {/* Emergency & Contact Details */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-[8.5px]">
            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
            <span className="truncate">{college.address}</span>
          </div>
          <div className="flex items-center justify-between text-[8px] text-slate-600 pt-0.5">
            <span className="flex items-center gap-1">
              <Phone className="w-2.5 h-2.5 text-blue-600" />
              <span>Emergency: {student.emergencyContact || student.parentContact || college.contactPhone}</span>
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-2.5 h-2.5 text-blue-600" />
              <span>{college.website}</span>
            </span>
          </div>
        </div>

        {/* Machine Readable UID Strip */}
        <div className="bg-slate-100 rounded px-3 py-1 flex items-center justify-between font-mono text-[9px] text-slate-800 border border-slate-300">
          <span>{cardUid}</span>
          <span>CODE: {verificationCode}</span>
          <span className="font-bold text-blue-700">STATUS: {card?.status || 'ACTIVE'}</span>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-1.5 text-center">
        <p className="text-[7.5px] text-slate-500 leading-tight">
          {college.cardFooterNote || 'Property of Government Polytechnic. If found, please return to the Principal Office.'}
        </p>
      </div>
    </div>
  );

  if (side === 'front') return renderFrontCard();
  if (side === 'back') return renderBackCard();

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
          Front Side
        </div>
        {renderFrontCard()}
      </div>
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
          Back Side
        </div>
        {renderBackCard()}
      </div>
    </div>
  );
};
