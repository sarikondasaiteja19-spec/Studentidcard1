import React, { useState } from 'react';
import { Student, IDCard, Branch, AcademicYear } from '../types';
import {
  Search,
  Plus,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  CreditCard,
  CheckCircle,
  XCircle,
  MoreVertical,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';
import Papa from 'papaparse';

interface StudentsViewProps {
  students: Student[];
  cards: IDCard[];
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onViewStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onGenerateCardForStudent: (studentId: string) => void;
  onBulkGenerate: (selectedStudentIds: string[]) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  cards,
  onAddStudent,
  onEditStudent,
  onViewStudent,
  onDeleteStudent,
  onGenerateCardForStudent,
  onBulkGenerate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCardFilter, setSelectedCardFilter] = useState<string>('ALL');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter students
  const filtered = students.filter(student => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.pinNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.phoneNumber && student.phoneNumber.includes(searchTerm));

    const matchesBranch = selectedBranch === 'ALL' || student.branch === selectedBranch;
    const matchesYear = selectedYear === 'ALL' || student.currentYear === selectedYear;
    const matchesStatus = selectedStatus === 'ALL' || student.status === selectedStatus;

    const hasCard = cards.some(c => c.studentId === student.id);
    const matchesCard =
      selectedCardFilter === 'ALL' ||
      (selectedCardFilter === 'YES' && hasCard) ||
      (selectedCardFilter === 'NO' && !hasCard);

    return matchesSearch && matchesBranch && matchesYear && matchesStatus && matchesCard;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedStudents = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filtered.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filtered.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const dataToExport = (selectedStudentIds.length > 0
      ? students.filter(s => selectedStudentIds.includes(s.id))
      : filtered
    ).map(s => ({
      'Full Name': s.fullName,
      'PIN Number': s.pinNumber,
      'Roll Number': s.rollNumber,
      'Branch': s.branch,
      'Current Year': s.currentYear,
      'Semester': s.semester || '',
      'Status': s.status,
      'Phone': s.phoneNumber || '',
      'Blood Group': s.bloodGroup || '',
      'Address': s.address || '',
      'Valid Till': s.validUntil || '',
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Students_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Student Records Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, search, edit student database, and manage ID credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {selectedStudentIds.length > 0 && (
            <button
              onClick={() => onBulkGenerate(selectedStudentIds)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>Generate ({selectedStudentIds.length}) IDs</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onAddStudent}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              placeholder="Search by name, PIN, roll number, or phone..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Branch Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedBranch}
              onChange={e => {
                setSelectedBranch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedYear}
              onChange={e => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          {/* Card Status Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCardFilter}
              onChange={e => {
                setSelectedCardFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All ID Statuses</option>
              <option value="YES">ID Generated</option>
              <option value="NO">Without ID Card</option>
            </select>
          </div>
        </div>

        {/* Selected count notification */}
        {selectedStudentIds.length > 0 && (
          <div className="text-xs bg-blue-50 text-blue-700 p-2 rounded-lg flex items-center justify-between font-medium">
            <span>{selectedStudentIds.length} students selected</span>
            <button
              onClick={() => setSelectedStudentIds([])}
              className="text-xs text-blue-800 underline hover:font-bold"
            >
              Deselect all
            </button>
          </div>
        )}
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-500 hover:text-slate-700">
                    {selectedStudentIds.length > 0 && selectedStudentIds.length === filtered.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">S.No</th>
                <th className="py-3 px-3">Photo</th>
                <th className="py-3 px-4">Student Details</th>
                <th className="py-3 px-4">PIN & Roll</th>
                <th className="py-3 px-4">Branch & Year</th>
                <th className="py-3 px-4">ID Card Status</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No students match your filter criteria.</p>
                    <p className="text-xs mt-1">Try clearing search terms or adding new student records.</p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student, idx) => {
                  const serialNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isSelected = selectedStudentIds.includes(student.id);
                  const studentCard = cards.find(c => c.studentId === student.id);

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleSelectStudent(student.id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-400 font-semibold text-center">
                        {serialNumber}
                      </td>

                      <td className="py-3 px-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          <img
                            src={student.photoUrl}
                            alt={student.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{student.fullName}</span>
                        <span className="text-[11px] text-slate-400 block">{student.email || student.phoneNumber || 'Student'}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-700 block text-[11.5px]">
                          {student.pinNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Roll: {student.rollNumber}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{student.branch}</span>
                        <span className="text-[11px] text-slate-500">{student.currentYear}</span>
                      </td>

                      <td className="py-3 px-4">
                        {studentCard ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Generated (Rev {studentCard.version})
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Pending ID
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                            student.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onViewStudent(student)}
                            title="View Profile"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onGenerateCardForStudent(student.id)}
                            title="Generate / Preview ID Card"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditStudent(student)}
                            title="Edit Student"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(student.id)}
                            title="Delete Student"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing <strong>{filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{' '}
            <strong>{Math.min(currentPage * itemsPerPage, filtered.length)}</strong> of{' '}
            <strong>{filtered.length}</strong> students
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Student Record?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this student record? This action will permanently remove
              their profile, attendance link, and any issued ID cards from the database.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
