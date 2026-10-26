import { CollegeSettings, Student, IDCard, ActivityLog, AppNotification, User, CardStatus } from '../types';
import { initialCollegeSettings, initialStudents, initialIDCards, initialActivityLogs, initialNotifications, initialUser } from '../data/seedData';

const STORAGE_KEYS = {
  COLLEGE: 'smart_id_college_settings_v1',
  STUDENTS: 'smart_id_students_v1',
  CARDS: 'smart_id_cards_v1',
  ACTIVITIES: 'smart_id_activities_v1',
  NOTIFICATIONS: 'smart_id_notifications_v1',
  USER: 'smart_id_user_v1',
};

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // User
  getUser(): User {
    return this.get<User>(STORAGE_KEYS.USER, initialUser);
  }

  updateUser(user: Partial<User>): User {
    const current = this.getUser();
    const updated = { ...current, ...user };
    this.set(STORAGE_KEYS.USER, updated);
    return updated;
  }

  // College Settings
  getCollegeSettings(): CollegeSettings {
    return this.get<CollegeSettings>(STORAGE_KEYS.COLLEGE, initialCollegeSettings);
  }

  updateCollegeSettings(settings: Partial<CollegeSettings>): CollegeSettings {
    const current = this.getCollegeSettings();
    const updated = { ...current, ...settings };
    this.set(STORAGE_KEYS.COLLEGE, updated);
    this.logActivity('College settings updated', 'Institute details & card defaults modified', 'update');
    return updated;
  }

  // Students
  getStudents(): Student[] {
    return this.get<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
  }

  getStudentById(id: string): Student | undefined {
    return this.getStudents().find(s => s.id === id);
  }

  getStudentByPin(pin: string): Student | undefined {
    const cleanPin = pin.trim().toUpperCase();
    return this.getStudents().find(s => s.pinNumber.trim().toUpperCase() === cleanPin);
  }

  getStudentByRoll(roll: string): Student | undefined {
    const cleanRoll = roll.trim().toUpperCase();
    return this.getStudents().find(s => s.rollNumber.trim().toUpperCase() === cleanRoll);
  }

  addStudent(studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): { success: boolean; student?: Student; error?: string } {
    const students = this.getStudents();
    const cleanPin = studentData.pinNumber.trim().toUpperCase();
    const cleanRoll = studentData.rollNumber.trim().toUpperCase();

    // Check duplicate PIN
    if (students.some(s => s.pinNumber.trim().toUpperCase() === cleanPin)) {
      this.addNotification({
        title: 'Duplicate PIN detected',
        message: `Attempted to register with already existing PIN: ${cleanPin}`,
        type: 'error',
        linkTab: 'students',
      });
      return { success: false, error: `Student with PIN "${cleanPin}" already exists!` };
    }

    // Check duplicate Roll
    if (students.some(s => s.rollNumber.trim().toUpperCase() === cleanRoll)) {
      return { success: false, error: `Student with Roll Number "${cleanRoll}" already exists!` };
    }

    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      pinNumber: cleanPin,
      rollNumber: cleanRoll,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    students.unshift(newStudent);
    this.set(STORAGE_KEYS.STUDENTS, students);

    this.logActivity(
      'New student registered',
      `${newStudent.fullName} (${newStudent.branch} - ${newStudent.currentYear})`,
      'create'
    );

    this.addNotification({
      title: 'New student registered',
      message: `${newStudent.fullName} (${newStudent.branch} - ${newStudent.currentYear}) saved to database.`,
      type: 'success',
      linkTab: 'students',
    });

    return { success: true, student: newStudent };
  }

  updateStudent(id: string, updates: Partial<Student>): { success: boolean; student?: Student; error?: string } {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index === -1) return { success: false, error: 'Student record not found.' };

    const current = students[index];

    // If changing PIN, verify uniqueness
    if (updates.pinNumber && updates.pinNumber.trim().toUpperCase() !== current.pinNumber.trim().toUpperCase()) {
      const cleanPin = updates.pinNumber.trim().toUpperCase();
      if (students.some(s => s.id !== id && s.pinNumber.trim().toUpperCase() === cleanPin)) {
        return { success: false, error: `Student with PIN "${cleanPin}" already exists.` };
      }
      updates.pinNumber = cleanPin;
    }

    // If changing Roll, verify uniqueness
    if (updates.rollNumber && updates.rollNumber.trim().toUpperCase() !== current.rollNumber.trim().toUpperCase()) {
      const cleanRoll = updates.rollNumber.trim().toUpperCase();
      if (students.some(s => s.id !== id && s.rollNumber.trim().toUpperCase() === cleanRoll)) {
        return { success: false, error: `Student with Roll Number "${cleanRoll}" already exists.` };
      }
      updates.rollNumber = cleanRoll;
    }

    const updatedStudent: Student = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    students[index] = updatedStudent;
    this.set(STORAGE_KEYS.STUDENTS, students);

    this.logActivity(
      'Student updated',
      `${updatedStudent.fullName} (${updatedStudent.branch} - ${updatedStudent.currentYear})`,
      'update'
    );

    return { success: true, student: updatedStudent };
  }

  deleteStudent(id: string): { success: boolean; error?: string } {
    const students = this.getStudents();
    const student = students.find(s => s.id === id);
    if (!student) return { success: false, error: 'Student record not found.' };

    const remaining = students.filter(s => s.id !== id);
    this.set(STORAGE_KEYS.STUDENTS, remaining);

    // Also remove associated cards
    const cards = this.getIDCards().filter(c => c.studentId !== id);
    this.set(STORAGE_KEYS.CARDS, cards);

    this.logActivity('Student deleted', `${student.fullName} (PIN: ${student.pinNumber})`, 'delete');

    return { success: true };
  }

  // ID Cards
  getIDCards(): IDCard[] {
    return this.get<IDCard[]>(STORAGE_KEYS.CARDS, initialIDCards);
  }

  getCardByStudentId(studentId: string): IDCard | undefined {
    return this.getIDCards().find(c => c.studentId === studentId);
  }

  getCardByVerificationCode(code: string): { card?: IDCard; student?: Student; status: 'Valid' | 'Expired' | 'Revoked' | 'Not Found' } {
    const cleanCode = code.trim().toUpperCase();
    const cards = this.getIDCards();
    const card = cards.find(c => 
      c.verificationCode.toUpperCase() === cleanCode || 
      c.cardUid.toUpperCase() === cleanCode
    );

    if (!card) {
      return { status: 'Not Found' };
    }

    const student = this.getStudentById(card.studentId);
    if (!student) {
      return { card, status: 'Not Found' };
    }

    if (card.status === 'Revoked') {
      return { card, student, status: 'Revoked' };
    }

    // Check expiration
    const expiry = new Date(card.expiryDate);
    const now = new Date();
    if (expiry < now || card.status === 'Expired') {
      return { card, student, status: 'Expired' };
    }

    return { card, student, status: 'Valid' };
  }

  generateOrReissueCard(studentId: string, templateId?: IDCard['templateId'], customExpiry?: string): { success: boolean; card?: IDCard; error?: string } {
    const student = this.getStudentById(studentId);
    if (!student) return { success: false, error: 'Student not found.' };

    const cards = this.getIDCards();
    const existingIndex = cards.findIndex(c => c.studentId === studentId);
    const college = this.getCollegeSettings();

    const branchCode = student.branch.substring(0, 3).toUpperCase();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const cardUid = `GPT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const verificationCode = `VER-GPT-${branchCode}${student.rollNumber.slice(-4)}-${randomHex}`;

    let defaultExpiry = customExpiry;
    if (!defaultExpiry) {
      const expDate = new Date();
      expDate.setFullYear(expDate.getFullYear() + (college.defaultValidityYears || 3));
      defaultExpiry = expDate.toISOString().split('T')[0];
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (existingIndex >= 0) {
      // Reissuing existing card
      const oldCard = cards[existingIndex];
      const newVersion = (oldCard.version || 1) + 1;
      const updatedCard: IDCard = {
        ...oldCard,
        cardUid,
        verificationCode,
        templateId: templateId || oldCard.templateId || college.defaultTemplate,
        issueDate: todayStr,
        expiryDate: defaultExpiry,
        status: 'Active',
        version: newVersion,
        revocationReason: undefined,
        revokedAt: undefined,
        updatedAt: new Date().toISOString(),
      };
      cards[existingIndex] = updatedCard;
      this.set(STORAGE_KEYS.CARDS, cards);

      this.logActivity('ID card reissued', `${student.fullName} (Rev ${newVersion})`, 'generate');
      this.addNotification({
        title: 'ID Card Reissued',
        message: `ID card for ${student.fullName} updated to version ${newVersion}.`,
        type: 'success',
        linkTab: 'cards',
      });

      return { success: true, card: updatedCard };
    }

    // Creating brand new card
    const newCard: IDCard = {
      id: `card-${Date.now()}`,
      studentId,
      cardUid,
      verificationCode,
      templateId: templateId || college.defaultTemplate || 'modern-tech',
      issueDate: todayStr,
      expiryDate: defaultExpiry,
      status: 'Active',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    cards.unshift(newCard);
    this.set(STORAGE_KEYS.CARDS, cards);

    this.logActivity('ID card generated', `${student.fullName} (${student.branch} - ${student.currentYear})`, 'generate');
    this.addNotification({
      title: 'ID card generated successfully',
      message: `${student.fullName} (${student.branch} - ${student.currentYear}) issued card UID ${newCard.cardUid}.`,
      type: 'success',
      linkTab: 'cards',
    });

    return { success: true, card: newCard };
  }

  updateCardStatus(cardId: string, status: CardStatus, revocationReason?: string): { success: boolean; card?: IDCard } {
    const cards = this.getIDCards();
    const index = cards.findIndex(c => c.id === cardId);
    if (index === -1) return { success: false };

    const card = cards[index];
    const student = this.getStudentById(card.studentId);
    card.status = status;
    card.updatedAt = new Date().toISOString();
    if (status === 'Revoked') {
      card.revocationReason = revocationReason || 'Revoked by institution authority';
      card.revokedAt = new Date().toISOString();
      this.logActivity('ID card revoked', `${student?.fullName || 'Student'} (Reason: ${card.revocationReason})`, 'revoke');
      this.addNotification({
        title: 'ID Card Revoked',
        message: `Card for ${student?.fullName || 'Student'} marked as revoked.`,
        type: 'error',
        linkTab: 'cards',
      });
    } else {
      card.revocationReason = undefined;
      card.revokedAt = undefined;
      this.logActivity('Card status updated', `${student?.fullName || 'Student'} status set to ${status}`, 'update');
    }

    cards[index] = card;
    this.set(STORAGE_KEYS.CARDS, cards);
    return { success: true, card };
  }

  // Activity Logs
  getActivityLogs(): ActivityLog[] {
    return this.get<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, initialActivityLogs);
  }

  logActivity(action: string, details: string, type: ActivityLog['type']): void {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      action,
      details,
      performedBy: 'Admin',
      timestamp: 'Just now',
      type,
    };
    logs.unshift(newLog);
    if (logs.length > 50) logs.pop();
    this.set(STORAGE_KEYS.ACTIVITIES, logs);
  }

  // Notifications
  getNotifications(): AppNotification[] {
    return this.get<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  }

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    const notifications = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    notifications.unshift(newNotif);
    if (notifications.length > 30) notifications.pop();
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  markAllNotificationsRead(): void {
    const notifications = this.getNotifications().map(n => ({ ...n, read: true }));
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  // Dashboard Aggregates
  getDashboardStats() {
    const students = this.getStudents();
    const cards = this.getIDCards();

    const totalStudents = students.length;
    const cardsGenerated = cards.length;
    const studentsWithoutCards = Math.max(0, totalStudents - cardsGenerated);
    const activeCards = cards.filter(c => c.status === 'Active').length;
    const expiredOrExpiring = cards.filter(c => {
      if (c.status === 'Expired' || c.status === 'Revoked') return true;
      const expiry = new Date(c.expiryDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiry <= thirtyDaysFromNow;
    }).length;

    // Branches breakdown
    const branchCounts: Record<string, number> = {
      CSE: 0,
      ECE: 0,
      EEE: 0,
      MECH: 0,
      CIVIL: 0,
      OTHER: 0,
    };

    students.forEach(s => {
      if (branchCounts[s.branch] !== undefined) {
        branchCounts[s.branch]++;
      } else {
        branchCounts.OTHER++;
      }
    });

    // Years breakdown
    const yearCounts: Record<string, number> = {
      '1st Year': 0,
      '2nd Year': 0,
      '3rd Year': 0,
      '4th Year': 0,
    };

    students.forEach(s => {
      if (yearCounts[s.currentYear] !== undefined) {
        yearCounts[s.currentYear]++;
      }
    });

    return {
      totalStudents,
      cardsGenerated,
      studentsWithoutCards,
      activeCards,
      expiredOrExpiring,
      branchCounts,
      yearCounts,
      recentStudents: students.slice(0, 5),
      recentCards: cards.slice(0, 5),
    };
  }

  // Bulk import
  bulkImportStudents(importedStudents: Array<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>): {
    successCount: number;
    failedCount: number;
    errors: Array<{ row: number; pin: string; error: string }>;
  } {
    let successCount = 0;
    let failedCount = 0;
    const errors: Array<{ row: number; pin: string; error: string }> = [];

    importedStudents.forEach((studentData, index) => {
      const res = this.addStudent(studentData);
      if (res.success) {
        successCount++;
      } else {
        failedCount++;
        errors.push({
          row: index + 1,
          pin: studentData.pinNumber,
          error: res.error || 'Failed to import',
        });
      }
    });

    if (failedCount > 0) {
      this.addNotification({
        title: 'Import completed with warnings',
        message: `${successCount} students imported, ${failedCount} errors detected.`,
        type: 'warning',
        linkTab: 'import',
      });
    } else {
      this.addNotification({
        title: 'Bulk import successful',
        message: `Successfully imported ${successCount} student records.`,
        type: 'success',
        linkTab: 'students',
      });
    }

    return { successCount, failedCount, errors };
  }

  // Reset to default seed
  resetToInitialData(): void {
    this.set(STORAGE_KEYS.COLLEGE, initialCollegeSettings);
    this.set(STORAGE_KEYS.STUDENTS, initialStudents);
    this.set(STORAGE_KEYS.CARDS, initialIDCards);
    this.set(STORAGE_KEYS.ACTIVITIES, initialActivityLogs);
    this.set(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    this.set(STORAGE_KEYS.USER, initialUser);
  }
}

export const storage = new StorageService();
