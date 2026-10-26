import React, { useState } from 'react';
import { Student, Branch, AcademicYear } from '../types';
import { X, Upload, Camera, AlertCircle, Check, Sparkles } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; error?: string };
  initialData?: Student | null;
  collegeName: string;
}

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
];

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  collegeName,
}) => {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    pinNumber: initialData?.pinNumber || '',
    rollNumber: initialData?.rollNumber || '',
    branch: (initialData?.branch || 'CSE') as Branch,
    currentYear: (initialData?.currentYear || '1st Year') as AcademicYear,
    semester: initialData?.semester || '1st Sem',
    academicYear: initialData?.academicYear || '2026 - 2027',
    collegeName: initialData?.collegeName || collegeName || 'Government Polytechnic Peddapuram',
    photoUrl: initialData?.photoUrl || SAMPLE_AVATARS[0],
    status: initialData?.status || 'Active' as const,
    dateOfBirth: initialData?.dateOfBirth || '',
    gender: initialData?.gender || 'Male' as const,
    bloodGroup: initialData?.bloodGroup || 'O+',
    phoneNumber: initialData?.phoneNumber || '',
    email: initialData?.email || '',
    parentContact: initialData?.parentContact || '',
    address: initialData?.address || '',
    admissionDate: initialData?.admissionDate || '2026-06-15',
    validFrom: initialData?.validFrom || '2026-07-01',
    validUntil: initialData?.validUntil || '2029-06-30',
    emergencyContact: initialData?.emergencyContact || '',
    additionalNotes: initialData?.additionalNotes || '',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG or JPEG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.fullName.trim()) {
      setErrorMsg('Student Full Name is required.');
      return;
    }
    if (!formData.pinNumber.trim()) {
      setErrorMsg('Student PIN Number is required.');
      return;
    }
    if (!formData.rollNumber.trim()) {
      setErrorMsg('Roll Number / Registration Number is required.');
      return;
    }
    if (!formData.photoUrl) {
      setErrorMsg('Student photo is required for ID card generation.');
      return;
    }

    const res = onSave(formData);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save student record.');
      return;
    }

    onClose();
  };

  const autoGeneratePIN = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const branchCode = formData.branch;
    const year = '2026';
    setFormData(prev => ({
      ...prev,
      pinNumber: `${branchCode}-${year}-${randomNum}`,
      rollNumber: `26${randomNum}`,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>{initialData ? 'Edit Student Details' : 'Add New Student Record'}</span>
              <span className="text-xs bg-blue-600 px-2 py-0.5 rounded font-mono font-medium">2026 Edition</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Fill in student details. PIN and Roll numbers must be unique.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Photo Upload & Preview section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-24 h-28 rounded-xl overflow-hidden border-2 border-blue-500 bg-white shadow-md shrink-0">
              <img
                src={formData.photoUrl}
                alt="Student preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                <Camera className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Student Passport Photo *
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-400">or choose synthetic avatar:</span>
              </div>

              {/* Sample Avatar picker */}
              <div className="flex items-center gap-1.5 pt-1">
                {SAMPLE_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, photoUrl: url }))}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                      formData.photoUrl === url ? 'border-blue-600 scale-110 shadow-sm' : 'border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Academic Identifiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. K. Sai Charan"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* PIN & Roll Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  PIN Number (Unique) *
                </label>
                <button
                  type="button"
                  onClick={autoGeneratePIN}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Generate</span>
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. CSE-2026-001"
                value={formData.pinNumber}
                onChange={e => setFormData({ ...formData, pinNumber: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
              <p className="text-[10px] text-slate-400 mt-1">Configurable format: BRANCH-YYYY-XXX</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                College Roll Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 26001"
                value={formData.rollNumber}
                onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Department & Academic Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Branch / Department *
              </label>
              <select
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value as Branch })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
              >
                <option value="CSE">CSE (Computer Engineering)</option>
                <option value="ECE">ECE (Electronics & Comm.)</option>
                <option value="EEE">EEE (Electrical & Electronics)</option>
                <option value="MECH">MECH (Mechanical)</option>
                <option value="CIVIL">CIVIL (Civil Engineering)</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Year *
              </label>
              <select
                value={formData.currentYear}
                onChange={e => setFormData({ ...formData, currentYear: e.target.value as AcademicYear })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Semester
              </label>
              <input
                type="text"
                placeholder="e.g. 1st Sem"
                value={formData.semester}
                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Blood group, Phone, Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-red-600"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Emergency / Guardian Contact
              </label>
              <input
                type="tel"
                placeholder="+91 98765 00001"
                value={formData.emergencyContact}
                onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Validity & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Valid From
              </label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Valid Until (Card Expiry)
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Address & College */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Residential Address (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Peddapuram, Kakinada District"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30"
          >
            <Check className="w-4 h-4" />
            <span>{initialData ? 'Update Student Record' : 'Save Student Record'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
