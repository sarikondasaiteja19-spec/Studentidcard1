export type Branch = 'CSE' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | 'OTHER';

export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';

export type CardStatus = 'Draft' | 'Generated' | 'Active' | 'Expired' | 'Revoked';

export type UserRole = 'Administrator' | 'Staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface Student {
  id: string;
  fullName: string;
  pinNumber: string;
  rollNumber: string;
  branch: Branch;
  currentYear: AcademicYear;
  semester: string;
  academicYear: string;
  collegeName: string;
  photoUrl: string;
  status: 'Active' | 'Inactive';
  // Optional fields
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  phoneNumber?: string;
  email?: string;
  parentContact?: string;
  address?: string;
  admissionDate?: string;
  validFrom?: string;
  validUntil?: string;
  emergencyContact?: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDCard {
  id: string;
  studentId: string;
  cardUid: string;
  verificationCode: string;
  templateId: 'modern-tech' | 'classic-navy' | 'minimal-slate' | 'elegant-maroon';
  issueDate: string;
  expiryDate: string;
  status: CardStatus;
  version: number;
  revocationReason?: string;
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollegeSettings {
  collegeName: string;
  collegeCode: string;
  tagline: string;
  address: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  signatoryName: string;
  signatoryTitle: string;
  academicYear: string;
  defaultValidityYears: number;
  pinFormat: string; // e.g. "BRANCH-YYYY-XXX"
  logoUrl: string;
  signatureUrl: string;
  cardFooterNote: string;
  cardEmergencyNote: string;
  defaultTemplate: 'modern-tech' | 'classic-navy' | 'minimal-slate' | 'elegant-maroon';
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete' | 'generate' | 'revoke' | 'import' | 'auth';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  linkTab?: string;
}
