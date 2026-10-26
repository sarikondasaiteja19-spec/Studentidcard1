import React, { useState, useEffect } from 'react';
import { storage } from './services/storageService';
import { Student, IDCard, CollegeSettings, ActivityLog, AppNotification, User } from './types';
import { DashboardView } from './pages/DashboardView';
import { StudentsView } from './pages/StudentsView';
import { IDCardGeneratorView } from './pages/IDCardGeneratorView';
import { CardManagementView } from './pages/CardManagementView';
import { BulkImportView } from './pages/BulkImportView';
import { QRVerificationView } from './pages/QRVerificationView';
import { CollegeSettingsView } from './pages/CollegeSettingsView';
import { ReportsView } from './pages/ReportsView';
import { ActivityLogView } from './pages/ActivityLogView';
import { NotificationsView } from './pages/NotificationsView';
import { StudentFormModal } from './components/StudentFormModal';
import { StudentProfileModal } from './components/StudentProfileModal';

import {
  LayoutDashboard,
  Users,
  CreditCard,
  Layers,
  Upload,
  BarChart3,
  Settings,
  Bell,
  Clock,
  QrCode,
  LogOut,
  Moon,
  Sun,
  Search,
  Building,
  GraduationCap,
  ShieldCheck,
  ChevronDown,
  Key,
  Menu,
  X,
} from 'lucide-react';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Application Data States
  const [user, setUser] = useState<User>(storage.getUser());
  const [college, setCollege] = useState<CollegeSettings>(storage.getCollegeSettings());
  const [students, setStudents] = useState<Student[]>(storage.getStudents());
  const [cards, setCards] = useState<IDCard[]>(storage.getIDCards());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(storage.getActivityLogs());
  const [notifications, setNotifications] = useState<AppNotification[]>(storage.getNotifications());

  // Global search input
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Modals state
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [generatorPreselectedId, setGeneratorPreselectedId] = useState<string | null>(null);
  const [verificationInitialCode, setVerificationInitialCode] = useState<string | undefined>(undefined);

  // User dropdown menu & auth modal
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Reload data from storage
  const refreshData = () => {
    setUser(storage.getUser());
    setCollege(storage.getCollegeSettings());
    setStudents(storage.getStudents());
    setCards(storage.getIDCards());
    setActivityLogs(storage.getActivityLogs());
    setNotifications(storage.getNotifications());
  };

  // Global search handler
  useEffect(() => {
    if (!globalSearch.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const q = globalSearch.toLowerCase();
    const hits = students.filter(
      s =>
        s.fullName.toLowerCase().includes(q) ||
        s.pinNumber.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q)
    );
    setSearchResults(hits.slice(0, 6));
    setShowSearchDropdown(true);
  }, [globalSearch, students]);

  // Tab change
  const navigateToTab = (tab: string, studentIdForGenerator?: string, verifyCode?: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (studentIdForGenerator) {
      setGeneratorPreselectedId(studentIdForGenerator);
    }
    if (verifyCode) {
      setVerificationInitialCode(verifyCode);
    }
  };

  // Handlers for student operations
  const handleSaveStudent = (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingStudent) {
      const res = storage.updateStudent(editingStudent.id, data);
      if (res.success) {
        refreshData();
        setEditingStudent(null);
      }
      return res;
    } else {
      const res = storage.addStudent(data);
      if (res.success) {
        refreshData();
      }
      return res;
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    storage.deleteStudent(studentId);
    refreshData();
  };

  const handleCardGenerated = (card: IDCard) => {
    storage.generateOrReissueCard(card.studentId, card.templateId, card.expiryDate);
    refreshData();
  };

  const handleUpdateCardStatus = (cardId: string, status: IDCard['status'], reason?: string) => {
    storage.updateCardStatus(cardId, status, reason);
    refreshData();
  };

  const handleBulkImportSuccess = (imported: Array<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>) => {
    storage.bulkImportStudents(imported);
    refreshData();
  };

  const handleGenerateBatchCards = (studentIds: string[]) => {
    studentIds.forEach(id => {
      storage.generateOrReissueCard(id);
    });
    refreshData();
    navigateToTab('cards');
  };

  const handleUpdateCollegeSettings = (updated: Partial<CollegeSettings>) => {
    storage.updateCollegeSettings(updated);
    refreshData();
  };

  const handleResetDatabase = () => {
    storage.resetToInitialData();
    refreshData();
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'generator', label: 'ID Card Generator', icon: CreditCard },
    { id: 'cards', label: 'Card Management', icon: Layers },
    { id: 'import', label: 'Bulk Import', icon: Upload },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'College Settings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount },
    { id: 'logs', label: 'Activity Log', icon: Clock },
    { id: 'verify', label: 'QR Verification', icon: QrCode },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs px-4 lg:px-6 py-2.5 flex items-center justify-between no-print">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => navigateToTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                  Smart Student ID Generator Pro
                </span>
              </div>
              <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase block font-mono">
                2026 Edition
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:block flex-1 max-w-md mx-6 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search students by name, PIN, roll number..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Search dropdown results */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100">
              {searchResults.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    setViewingStudent(s);
                    setShowSearchDropdown(false);
                    setGlobalSearch('');
                  }}
                  className="p-2.5 flex items-center gap-3 hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <img src={s.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">{s.fullName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      PIN: {s.pinNumber} • {s.branch} ({s.currentYear})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick actions, notifications, user avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Notifications bell */}
          <button
            onClick={() => navigateToTab('notifications')}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Dark / Light toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Toggle display mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
              />
              <div className="hidden sm:block text-left text-xs">
                <span className="font-bold text-slate-900 block leading-tight">{user.name}</span>
                <span className="text-[10px] text-slate-400 font-medium block leading-tight">{user.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-800">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowPasswordModal(true);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>Change Password</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigateToTab('settings');
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Institute Settings</span>
                </button>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      alert('Logged out from Administrator session.');
                    }}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY WITH LEFT SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* LEFT SIDEBAR */}
        <aside
          className={`lg:w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 no-print transition-all duration-300 ${
            mobileMenuOpen ? 'block fixed inset-y-0 left-0 z-50 w-72 shadow-2xl' : 'hidden lg:flex'
          }`}
        >
          {/* Top navigation items */}
          <div className="p-3.5 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom institution info card & logout */}
          <div className="p-3.5 border-t border-slate-100 space-y-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11.5px] font-bold text-slate-900 truncate">
                    {college.collegeName}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate font-medium">
                    Peddapuram
                  </p>
                  <p className="text-[9.5px] text-blue-700 font-mono font-bold mt-0.5">
                    Academic Year: {college.academicYear}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert('Logged out from Administrator session.')}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* MAIN VIEW CONTENT CONTAINER */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {/* Breadcrumb indicator */}
          <div className="mb-4 text-xs font-medium text-slate-400 flex items-center gap-2 no-print">
            <span
              onClick={() => navigateToTab('dashboard')}
              className="cursor-pointer hover:text-blue-600 flex items-center gap-1 font-semibold"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Home</span>
            </span>
            <span>/</span>
            <span className="text-slate-700 capitalize font-bold">
              {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </span>
          </div>

          {/* Active View Router */}
          {activeTab === 'dashboard' && (
            <DashboardView
              students={students}
              cards={cards}
              college={college}
              activityLogs={activityLogs}
              notifications={notifications}
              onAddStudent={() => {
                setEditingStudent(null);
                setIsStudentFormOpen(true);
              }}
              onNavigateTab={navigateToTab}
              onGenerateCard={(studentId) => navigateToTab('generator', studentId)}
              onViewStudent={(student) => setViewingStudent(student)}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              students={students}
              cards={cards}
              onAddStudent={() => {
                setEditingStudent(null);
                setIsStudentFormOpen(true);
              }}
              onEditStudent={(student) => {
                setEditingStudent(student);
                setIsStudentFormOpen(true);
              }}
              onViewStudent={(student) => setViewingStudent(student)}
              onDeleteStudent={handleDeleteStudent}
              onGenerateCardForStudent={(studentId) => navigateToTab('generator', studentId)}
              onBulkGenerate={handleGenerateBatchCards}
            />
          )}

          {activeTab === 'generator' && (
            <IDCardGeneratorView
              students={students}
              cards={cards}
              college={college}
              preselectedStudentId={generatorPreselectedId}
              onCardGenerated={handleCardGenerated}
              onNavigateToVerify={(code) => navigateToTab('verify', undefined, code)}
            />
          )}

          {activeTab === 'cards' && (
            <CardManagementView
              cards={cards}
              students={students}
              onUpdateStatus={handleUpdateCardStatus}
              onReissueCard={(studentId) => navigateToTab('generator', studentId)}
              onNavigateToVerify={(code) => navigateToTab('verify', undefined, code)}
            />
          )}

          {activeTab === 'import' && (
            <BulkImportView
              existingStudents={students}
              cards={cards}
              college={college}
              onImportSuccess={handleBulkImportSuccess}
              onGenerateBatchCards={handleGenerateBatchCards}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              students={students}
              cards={cards}
              college={college}
            />
          )}

          {activeTab === 'settings' && (
            <CollegeSettingsView
              settings={college}
              onSave={handleUpdateCollegeSettings}
              onResetDatabase={handleResetDatabase}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkAllRead={() => {
                storage.markAllNotificationsRead();
                refreshData();
              }}
              onNavigateTab={navigateToTab}
            />
          )}

          {activeTab === 'logs' && (
            <ActivityLogView logs={activityLogs} />
          )}

          {activeTab === 'verify' && (
            <QRVerificationView
              college={college}
              initialCode={verificationInitialCode}
            />
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3.5 text-center text-xs text-slate-500 no-print flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Secure • Reliable • Easy to Use • Smart Student ID Generator Pro</span>
        </div>
        <p className="font-mono text-[11px] text-slate-400">
          © 2026. All rights reserved. Diploma Final Year CSE Project.
        </p>
      </footer>

      {/* MODALS */}
      <StudentFormModal
        isOpen={isStudentFormOpen}
        onClose={() => {
          setIsStudentFormOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        initialData={editingStudent}
        collegeName={college.collegeName}
      />

      <StudentProfileModal
        isOpen={!!viewingStudent}
        student={viewingStudent}
        card={cards.find(c => c.studentId === viewingStudent?.id)}
        college={college}
        onClose={() => setViewingStudent(null)}
        onGenerateCard={(studentId) => {
          setViewingStudent(null);
          navigateToTab('generator', studentId);
        }}
      />

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Change Admin Password</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Password updated successfully.');
                  setShowPasswordModal(false);
                }}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
