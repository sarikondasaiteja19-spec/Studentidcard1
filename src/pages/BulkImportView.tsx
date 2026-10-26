import React, { useState } from 'react';
import { Student, IDCard, CollegeSettings, Branch, AcademicYear } from '../types';
import { exportBulkCardsA4PDF } from '../utils/idCardGenerator';
import Papa from 'papaparse';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Users,
  CreditCard,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface BulkImportViewProps {
  existingStudents: Student[];
  cards: IDCard[];
  college: CollegeSettings;
  onImportSuccess: (imported: Array<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  onGenerateBatchCards: (studentIds: string[]) => void;
}

interface ParsedRow {
  fullName: string;
  pinNumber: string;
  rollNumber: string;
  branch: string;
  currentYear: string;
  semester?: string;
  bloodGroup?: string;
  phoneNumber?: string;
  gender?: string;
  isValid: boolean;
  errors: string[];
}

export const BulkImportView: React.FC<BulkImportViewProps> = ({
  existingStudents,
  cards,
  college,
  onImportSuccess,
  onGenerateBatchCards,
}) => {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const [isExportingA4, setIsExportingA4] = useState(false);

  // Download sample CSV template
  const handleDownloadSample = () => {
    const sampleData = [
      {
        fullName: 'B. Manoj Kumar',
        pinNumber: 'CSE-2026-009',
        rollNumber: '26009',
        branch: 'CSE',
        currentYear: '1st Year',
        semester: '1st Sem',
        gender: 'Male',
        bloodGroup: 'B+',
        phoneNumber: '+91 98888 11111',
      },
      {
        fullName: 'K. Divya Sri',
        pinNumber: 'ECE-2026-010',
        rollNumber: '26010',
        branch: 'ECE',
        currentYear: '2nd Year',
        semester: '3rd Sem',
        gender: 'Female',
        bloodGroup: 'O+',
        phoneNumber: '+91 97777 22222',
      },
      {
        fullName: 'P. Sai Krishna',
        pinNumber: 'MECH-2026-011',
        rollNumber: '26011',
        branch: 'MECH',
        currentYear: '3rd Year',
        semester: '5th Sem',
        gender: 'Male',
        bloodGroup: 'AB+',
        phoneNumber: '+91 96666 33333',
      },
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart_student_id_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle CSV file upload & validation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResults(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: ParsedRow[] = results.data.map((row: any) => {
          const errors: string[] = [];
          const fullName = (row.fullName || row['Full Name'] || '').trim();
          const pinNumber = (row.pinNumber || row['PIN Number'] || row.PIN || '').trim().toUpperCase();
          const rollNumber = (row.rollNumber || row['Roll Number'] || row.Roll || '').trim();
          const branch = (row.branch || row['Branch'] || 'CSE').trim().toUpperCase();
          const currentYear = (row.currentYear || row['Current Year'] || '1st Year').trim();

          if (!fullName) errors.push('Missing Full Name');
          if (!pinNumber) errors.push('Missing PIN');
          if (!rollNumber) errors.push('Missing Roll Number');

          // Check if duplicate in existing DB
          if (existingStudents.some(s => s.pinNumber.toUpperCase() === pinNumber)) {
            errors.push('PIN already exists in database');
          }
          if (existingStudents.some(s => s.rollNumber.toUpperCase() === rollNumber)) {
            errors.push('Roll No already exists in database');
          }

          const validBranches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'OTHER'];
          const cleanBranch = validBranches.includes(branch) ? branch : 'OTHER';

          return {
            fullName,
            pinNumber,
            rollNumber,
            branch: cleanBranch,
            currentYear,
            semester: row.semester || row['Semester'] || '1st Sem',
            bloodGroup: row.bloodGroup || row['Blood Group'] || 'O+',
            phoneNumber: row.phoneNumber || row['Phone Number'] || '',
            gender: row.gender || row['Gender'] || 'Male',
            isValid: errors.length === 0,
            errors,
          };
        });

        setParsedRows(rows);
      },
    });
  };

  const handleCommitImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    const sampleAvatars = [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    ];

    const toImport = validRows.map((r, i) => ({
      fullName: r.fullName,
      pinNumber: r.pinNumber,
      rollNumber: r.rollNumber,
      branch: r.branch as Branch,
      currentYear: (r.currentYear as AcademicYear) || '1st Year',
      semester: r.semester || '1st Sem',
      academicYear: college.academicYear || '2026 - 2027',
      collegeName: college.collegeName,
      photoUrl: sampleAvatars[i % sampleAvatars.length],
      status: 'Active' as const,
      bloodGroup: r.bloodGroup || 'O+',
      phoneNumber: r.phoneNumber || '',
      gender: (r.gender as any) || 'Male',
    }));

    onImportSuccess(toImport);
    setImportResults({
      success: validRows.length,
      failed: parsedRows.length - validRows.length,
    });
    setParsedRows([]);
  };

  // Bulk Print A4 Sheet for all students with cards
  const handleBulkPrintA4Sheet = async () => {
    const studentsWithCards = existingStudents
      .map(s => {
        const card = cards.find(c => c.studentId === s.id);
        return card ? { student: s, card } : null;
      })
      .filter(Boolean) as Array<{ student: Student; card: IDCard }>;

    if (studentsWithCards.length === 0) {
      alert('No generated cards found to print. Please generate ID cards first!');
      return;
    }

    setIsExportingA4(true);
    try {
      await exportBulkCardsA4PDF(studentsWithCards, college);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingA4(false);
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Bulk Student Import & Batch Generation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Import bulk rosters from CSV/Excel, validate duplicates, and print 8-up A4 ID card sheets.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Download CSV Template</span>
          </button>

          <button
            onClick={handleBulkPrintA4Sheet}
            disabled={isExportingA4}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>{isExportingA4 ? 'Compiling Sheet...' : 'Export A4 Multi-Card Sheet'}</span>
          </button>
        </div>
      </div>

      {/* Results banner if imported */}
      {importResults && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Batch import complete: <strong>{importResults.success}</strong> records saved successfully.
              {importResults.failed > 0 && ` (${importResults.failed} duplicates/errors skipped)`}
            </span>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors text-center shadow-xs">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Upload CSV or Excel Student Roster
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Drag and drop your prepared CSV file here, or click below to browse. Every record will be verified for unique PIN and Roll number.
          </p>
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-blue-500/20 transition-all">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Browse CSV File</span>
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          {fileName && (
            <p className="text-[11px] font-mono text-slate-500">
              Loaded: <strong>{fileName}</strong> ({parsedRows.length} rows)
            </p>
          )}
        </div>
      </div>

      {/* Parsed Rows Preview Table */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Staged Import Preview & Validation
              </h3>
              <p className="text-xs text-slate-500">
                Found {validCount} valid records and {invalidCount} with validation issues.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setParsedRows([])}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                onClick={handleCommitImport}
                disabled={validCount === 0}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save {validCount} Valid Students</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">PIN Number</th>
                  <th className="py-2.5 px-3">Roll Number</th>
                  <th className="py-2.5 px-3">Branch</th>
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3">Issues / Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {parsedRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50/50 hover:bg-red-50'}
                  >
                    <td className="py-2.5 px-3">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                          <AlertCircle className="w-3 h-3" /> Error
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold">{row.fullName}</td>
                    <td className="py-2.5 px-3 font-mono">{row.pinNumber}</td>
                    <td className="py-2.5 px-3 font-mono">{row.rollNumber}</td>
                    <td className="py-2.5 px-3 font-semibold">{row.branch}</td>
                    <td className="py-2.5 px-3">{row.currentYear}</td>
                    <td className="py-2.5 px-3 text-red-600 font-medium">
                      {row.errors.length > 0 ? row.errors.join(', ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Batch Cards Generator for pending students */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              One-Click Batch ID Card Generator
            </h4>
            <p className="text-xs text-slate-500">
              Automatically generate official CR80 cards for all students currently missing an ID card.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const pendingIds = existingStudents
              .filter(s => !cards.some(c => c.studentId === s.id))
              .map(s => s.id);
            if (pendingIds.length === 0) {
              alert('All students currently have ID cards generated!');
              return;
            }
            onGenerateBatchCards(pendingIds);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95 shrink-0"
        >
          <CreditCard className="w-4 h-4" />
          <span>Generate All Pending ID Cards</span>
        </button>
      </div>
    </div>
  );
};
