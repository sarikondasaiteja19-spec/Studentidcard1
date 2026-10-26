import React, { useState } from 'react';
import { Student, IDCard, CollegeSettings } from '../types';
import { IDCardPreview } from '../components/IDCardPreview';
import { exportIDCardPDF } from '../utils/idCardGenerator';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  Download,
  Printer,
  Sparkles,
  Search,
  CheckCircle2,
  RefreshCw,
  Palette,
  QrCode,
  AlertCircle,
  Eye,
  Sliders,
} from 'lucide-react';

interface IDCardGeneratorViewProps {
  students: Student[];
  cards: IDCard[];
  college: CollegeSettings;
  preselectedStudentId?: string | null;
  onCardGenerated: (card: IDCard) => void;
  onNavigateToVerify: (code: string) => void;
}

export const IDCardGeneratorView: React.FC<IDCardGeneratorViewProps> = ({
  students,
  cards,
  college,
  preselectedStudentId,
  onCardGenerated,
  onNavigateToVerify,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preselectedStudentId || (students[0]?.id || '')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<IDCard['templateId']>('modern-tech');
  const [sideView, setSideView] = useState<'front' | 'back' | 'both'>('front');
  const [isExporting, setIsExporting] = useState(false);
  const [customExpiry, setCustomExpiry] = useState<string>('2029-06-30');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const existingCard = cards.find(c => c.studentId === selectedStudent?.id);

  // Filter students for picker
  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.pinNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateOrReissue = () => {
    if (!selectedStudent) return;

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    // Call storage service or card generation logic
    const isReissue = !!existingCard;
    const branchCode = selectedStudent.branch.substring(0, 3).toUpperCase();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const cardUid = `GPT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const verificationCode = `VER-GPT-${branchCode}${selectedStudent.rollNumber.slice(-4)}-${randomHex}`;

    const newCard: IDCard = {
      id: existingCard?.id || `card-${Date.now()}`,
      studentId: selectedStudent.id,
      cardUid,
      verificationCode,
      templateId: selectedTemplate,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: customExpiry || '2029-06-30',
      status: 'Active',
      version: existingCard ? (existingCard.version || 1) + 1 : 1,
      createdAt: existingCard?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCardGenerated(newCard);
    setSuccessBanner(
      isReissue
        ? `Successfully reissued ID Card for ${selectedStudent.fullName} (Rev ${newCard.version})`
        : `Successfully generated official CR80 ID Card for ${selectedStudent.fullName}!`
    );

    setTimeout(() => setSuccessBanner(null), 5000);
  };

  const handleDownloadPDF = async () => {
    if (!selectedStudent) return;
    setIsExporting(true);
    try {
      const activeCard: IDCard = existingCard || {
        id: `temp-${Date.now()}`,
        studentId: selectedStudent.id,
        cardUid: `GPT-2026-${selectedStudent.rollNumber}88`,
        verificationCode: `VER-GPT-${selectedStudent.branch}-${selectedStudent.rollNumber.slice(-3)}`,
        templateId: selectedTemplate,
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: customExpiry,
        status: 'Active',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await exportIDCardPDF(selectedStudent, activeCard, college, true);
    } catch (e) {
      console.error('PDF export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Professional ID Card Generator
            </h1>
            <span className="bg-blue-100 text-blue-700 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
              CR80 Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time preview, high-resolution vector PDF export, and QR verification binding.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Card</span>
          </button>

          <button
            onClick={handleGenerateOrReissue}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all active:scale-95 hover:shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>{existingCard ? 'Reissue ID Card' : 'Generate ID Card'}</span>
          </button>
        </div>
      </div>

      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          {existingCard && (
            <button
              onClick={() => onNavigateToVerify(existingCard.verificationCode)}
              className="text-xs underline text-emerald-700 hover:text-emerald-900 font-bold"
            >
              Test Public QR Verification →
            </button>
          )}
        </div>
      )}

      {/* Main Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Selector & Config Controls */}
        <div className="lg:col-span-4 space-y-5">
          {/* Student Picker Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Select Student</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {filteredStudents.length} available
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search name, PIN, branch..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Student list */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-50">
              {filteredStudents.map(student => {
                const isSelected = student.id === selectedStudent?.id;
                const hasCard = cards.some(c => c.studentId === student.id);
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border border-blue-200 shadow-2xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <img
                      src={student.photoUrl}
                      alt={student.fullName}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {student.fullName}
                        </span>
                        {hasCard ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Card Issued" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Pending Card" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {student.pinNumber} • {student.branch}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Theme Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <span>Card Design Theme</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'modern-tech', name: 'Modern Tech', color: 'bg-slate-900 border-cyan-500' },
                { id: 'classic-navy', name: 'Classic Navy', color: 'bg-blue-900 border-amber-400' },
                { id: 'minimal-slate', name: 'Minimal Slate', color: 'bg-slate-800 border-emerald-500' },
                { id: 'elegant-maroon', name: 'Elegant Maroon', color: 'bg-red-950 border-amber-500' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-18 ${
                    selectedTemplate === t.id
                      ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-full h-3 rounded ${t.color} border-l-4 shadow-2xs`} />
                  <span className="text-xs font-bold text-slate-800 mt-1">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Validity & Details Configuration */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Card Parameters</span>
            </label>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={customExpiry}
                onChange={e => setCustomExpiry(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-[11px] text-slate-500 space-y-1 pt-1">
              <div className="flex justify-between">
                <span>Institution:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[160px]">{college.collegeName}</span>
              </div>
              <div className="flex justify-between">
                <span>Signatory:</span>
                <span className="font-semibold text-slate-700">{college.signatoryName}</span>
              </div>
              <div className="flex justify-between">
                <span>Card Status:</span>
                <span className="font-semibold text-emerald-600">{existingCard?.status || 'Ready to Generate'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Card Canvas Preview */}
        <div className="lg:col-span-8 flex flex-col items-center justify-start bg-slate-50/70 p-6 rounded-2xl border border-slate-200 shadow-inner">
          {/* Controls Bar above preview */}
          <div className="w-full flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setSideView('front')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sideView === 'front' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Front View
              </button>
              <button
                onClick={() => setSideView('back')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sideView === 'back' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Back View
              </button>
              <button
                onClick={() => setSideView('both')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sideView === 'both' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Both Sides
              </button>
            </div>

            {existingCard && (
              <button
                onClick={() => onNavigateToVerify(existingCard.verificationCode)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                <span>Verify Card Code</span>
              </button>
            )}
          </div>

          {/* CR80 Live Card Component */}
          {selectedStudent ? (
            <div className="w-full flex items-center justify-center py-4 overflow-x-auto">
              <div className="id-card-print-container">
                <IDCardPreview
                  student={selectedStudent}
                  card={
                    existingCard
                      ? { ...existingCard, templateId: selectedTemplate, expiryDate: customExpiry }
                      : {
                          id: 'preview',
                          studentId: selectedStudent.id,
                          cardUid: `GPT-2026-${selectedStudent.rollNumber}88`,
                          verificationCode: `VER-GPT-${selectedStudent.branch}-${selectedStudent.rollNumber.slice(-3)}`,
                          templateId: selectedTemplate,
                          issueDate: new Date().toISOString().split('T')[0],
                          expiryDate: customExpiry,
                          status: 'Active',
                          version: 1,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        }
                  }
                  college={college}
                  side={sideView}
                  scale={1.05}
                />
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No student selected</p>
            </div>
          )}

          {/* Bottom Card Specifications & Info */}
          <div className="mt-6 w-full bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-800">ISO/IEC 7810 ID-1 standard (85.60 × 53.98 mm)</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
              <span>Resolution: 300 DPI Vector</span>
              <span>•</span>
              <span>QR Error Correction: Level M</span>
              <span>•</span>
              <span>Color Space: sRGB/CMYK Safe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
