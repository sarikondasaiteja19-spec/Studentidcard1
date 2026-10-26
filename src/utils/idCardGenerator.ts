import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Student, IDCard, CollegeSettings } from '../types';

/**
 * Generate a QR code as a base64 Data URL
 */
export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('QR code generation failed:', err);
    return '';
  }
}

/**
 * Export high-resolution CR80 ID Card as PDF (Single or double-sided)
 */
export async function exportIDCardPDF(
  student: Student,
  card: IDCard,
  college: CollegeSettings,
  includeBack: boolean = true
): Promise<void> {
  // CR80 standard: 85.6 mm width, 53.98 mm height
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [85.6, 54.0],
  });

  const qrDataUrl = await generateQRCodeDataUrl(
    `https://verify.gptpeddapuram.edu.in/verify?code=${encodeURIComponent(card.verificationCode)}`
  );

  // --- PAGE 1: FRONT SIDE ---
  // Background header
  pdf.setFillColor(15, 23, 42); // Navy 900
  pdf.rect(0, 0, 85.6, 14, 'F');

  // Accent stripe
  pdf.setFillColor(14, 165, 233); // Cyan 500
  pdf.rect(0, 13.2, 85.6, 1.2, 'F');

  // College Name & Header
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.text(college.collegeName.toUpperCase(), 42.8, 5.5, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5);
  pdf.setTextColor(203, 213, 225);
  pdf.text(college.tagline || 'STUDENT IDENTITY CARD', 42.8, 9, { align: 'center' });

  pdf.setFontSize(4.5);
  pdf.setTextColor(148, 163, 184);
  pdf.text(`ACADEMIC YEAR: ${student.academicYear || college.academicYear}`, 42.8, 12, { align: 'center' });

  // Main Card Body (White)
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 14.4, 85.6, 39.6, 'F');

  // Student Photo Placeholder or loaded image
  const photoX = 5;
  const photoY = 17;
  const photoW = 20;
  const photoH = 25;

  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.3);
  pdf.rect(photoX, photoY, photoW, photoH);

  if (student.photoUrl && student.photoUrl.startsWith('data:image')) {
    try {
      pdf.addImage(student.photoUrl, 'JPEG', photoX + 0.3, photoY + 0.3, photoW - 0.6, photoH - 0.6);
    } catch {
      // Fallback
    }
  } else {
    // Drawn avatar silhouette
    pdf.setFillColor(241, 245, 249);
    pdf.rect(photoX + 0.3, photoY + 0.3, photoW - 0.6, photoH - 0.6, 'F');
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(6);
    pdf.text('PHOTO', photoX + photoW / 2, photoY + photoH / 2, { align: 'center' });
  }

  // Student Details
  const detailX = 28;
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.text(student.fullName.toUpperCase(), detailX, 20);

  // Branch badge
  pdf.setFillColor(238, 242, 255);
  pdf.roundedRect(detailX, 22, 28, 4, 1, 1, 'F');
  pdf.setTextColor(67, 56, 202);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5);
  pdf.text(`${student.branch} - ${student.currentYear}`, detailX + 1.5, 24.8);

  // Field rows
  const startY = 29;
  const lineGap = 3.6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('PIN NO:', detailX, startY);
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.text(student.pinNumber, detailX + 14, startY);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139);
  pdf.text('ROLL NO:', detailX, startY + lineGap);
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.text(student.rollNumber, detailX + 14, startY + lineGap);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139);
  pdf.text('BLOOD GRP:', detailX, startY + lineGap * 2);
  pdf.setTextColor(220, 38, 38);
  pdf.setFont('helvetica', 'bold');
  pdf.text(student.bloodGroup || 'N/A', detailX + 14, startY + lineGap * 2);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139);
  pdf.text('VALID TILL:', detailX, startY + lineGap * 3);
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.text(card.expiryDate || 'JUNE 2029', detailX + 14, startY + lineGap * 3);

  // QR Code on right
  const qrX = 64;
  const qrY = 17;
  const qrSize = 17;

  if (qrDataUrl) {
    try {
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    } catch {
      // ignore
    }
  }

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(3.8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('SCAN TO VERIFY', qrX + qrSize / 2, qrY + qrSize + 2.5, { align: 'center' });

  // Signature line at bottom right
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(4.5);
  pdf.setTextColor(30, 41, 59);
  pdf.text(college.signatoryName, qrX + qrSize / 2, 47, { align: 'center' });
  pdf.setDrawColor(148, 163, 184);
  pdf.line(qrX - 1, 48.5, qrX + qrSize + 1, 48.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(4);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Principal / Signatory', qrX + qrSize / 2, 51, { align: 'center' });

  // Bottom footer stripe
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 52.5, 85.6, 1.5, 'F');

  // --- PAGE 2: BACK SIDE ---
  if (includeBack) {
    pdf.addPage([85.6, 54.0], 'landscape');

    // Header strip
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, 85.6, 6, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5);
    pdf.text('STUDENT INFORMATION & INSTRUCTIONS', 42.8, 4, { align: 'center' });

    // Back details
    pdf.setTextColor(51, 65, 85);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(4.5);

    const bX = 6;
    let bY = 10;

    pdf.setFont('helvetica', 'bold');
    pdf.text('INSTRUCTIONS:', bX, bY);
    pdf.setFont('helvetica', 'normal');
    bY += 3.2;
    pdf.text('1. This card must be presented on campus, laboratories, and library at all times.', bX, bY);
    bY += 2.8;
    pdf.text('2. Card is strictly non-transferable. Loss must be reported immediately.', bX, bY);
    bY += 2.8;
    pdf.text('3. Misuse of identity card will attract disciplinary action by the institution.', bX, bY);

    bY += 4.5;
    pdf.setFont('helvetica', 'bold');
    pdf.text('EMERGENCY & CONTACT DETAILS:', bX, bY);
    bY += 3.2;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Student Phone: ${student.phoneNumber || 'N/A'}  |  Parent: ${student.parentContact || 'N/A'}`, bX, bY);
    bY += 2.8;
    pdf.text(`Address: ${student.address || college.address}`, bX, bY);
    bY += 2.8;
    pdf.text(`College Web: ${college.website}  |  Emergency: ${college.contactPhone}`, bX, bY);

    // Card UID barcode aesthetic
    bY += 6;
    pdf.setFillColor(241, 245, 249);
    pdf.rect(bX, bY, 73.6, 6, 'F');
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(5.5);
    pdf.text(`* UID: ${card.cardUid} *  CODE: ${card.verificationCode}  * REV: ${card.version} *`, 42.8, bY + 4, { align: 'center' });

    // Bottom note
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 48, 85.6, 6, 'F');
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(4);
    pdf.text(college.cardFooterNote, 42.8, 51.5, { align: 'center' });
  }

  // Save the PDF
  const filename = `${student.pinNumber}_ID_Card.pdf`;
  pdf.save(filename);
}

/**
 * Bulk Export PDF containing multiple student cards formatted for printing on A4 sheet
 */
export async function exportBulkCardsA4PDF(
  studentsWithCards: Array<{ student: Student; card: IDCard }>,
  college: CollegeSettings
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  // A4 can fit 8 cards (2 columns x 4 rows)
  const cardW = 85.6;
  const cardH = 54.0;
  const startX = 14;
  const startY = 15;
  const gapX = 10;
  const gapY = 12;

  let currentCardIndex = 0;

  for (let i = 0; i < studentsWithCards.length; i++) {
    const { student, card } = studentsWithCards[i];
    const pageCardIndex = currentCardIndex % 8;

    if (currentCardIndex > 0 && pageCardIndex === 0) {
      pdf.addPage('a4', 'portrait');
    }

    const col = pageCardIndex % 2;
    const row = Math.floor(pageCardIndex / 2);

    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    // Outer card border
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.2);
    pdf.rect(x, y, cardW, cardH);

    // Header banner
    pdf.setFillColor(15, 23, 42);
    pdf.rect(x, y, cardW, 13, 'F');

    pdf.setFillColor(14, 165, 233);
    pdf.rect(x, y + 12.2, cardW, 0.8, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.text(college.collegeName.toUpperCase(), x + cardW / 2, y + 5, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(4.5);
    pdf.setTextColor(203, 213, 225);
    pdf.text('STUDENT IDENTITY CARD', x + cardW / 2, y + 8, { align: 'center' });

    pdf.setFontSize(4);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`${student.academicYear || college.academicYear}`, x + cardW / 2, y + 11, { align: 'center' });

    // Photo Box
    const px = x + 4;
    const py = y + 15;
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(px, py, 18, 22);
    pdf.setFillColor(241, 245, 249);
    pdf.rect(px, py, 18, 22, 'F');
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(5);
    pdf.text('PHOTO', px + 9, py + 12, { align: 'center' });

    // Details
    const dx = x + 25;
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.text(student.fullName.toUpperCase(), dx, y + 18);

    pdf.setTextColor(30, 64, 175);
    pdf.setFontSize(5);
    pdf.text(`${student.branch} • ${student.currentYear}`, dx, y + 22);

    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(4.8);
    pdf.text(`PIN: ${student.pinNumber}`, dx, y + 26);
    pdf.text(`Roll: ${student.rollNumber}`, dx, y + 29.5);
    pdf.text(`Blood: ${student.bloodGroup || 'N/A'}`, dx, y + 33);
    pdf.text(`Valid Till: ${card.expiryDate}`, dx, y + 36.5);

    // QR code placeholder
    const qx = x + 62;
    const qy = y + 15;
    pdf.rect(qx, qy, 18, 18);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(qx, qy, 18, 18, 'F');
    pdf.setFontSize(4);
    pdf.setTextColor(100, 116, 139);
    pdf.text('QR VERIFY', qx + 9, qy + 9, { align: 'center' });
    pdf.text(`UID: ${card.cardUid.slice(-6)}`, qx + 9, qy + 13, { align: 'center' });

    // Bottom banner
    pdf.setFillColor(15, 23, 42);
    pdf.rect(x, y + cardH - 1.5, cardW, 1.5, 'F');

    currentCardIndex++;
  }

  pdf.save(`Bulk_Student_ID_Cards_${new Date().toISOString().split('T')[0]}.pdf`);
}
