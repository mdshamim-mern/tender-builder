import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function main() {
  const baseDir = path.resolve(process.cwd(), 'public', 'sample-pack');
  const docsDir = path.join(baseDir, 'documents');
  const outputDir = path.resolve(process.cwd(), 'output');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const reqJsonPath = path.join(baseDir, 'requirements.json');
  const reqData = JSON.parse(fs.readFileSync(reqJsonPath, 'utf-8'));
  const tender = reqData.tender;
  const requirements = reqData.requirements.sort((a, b) => a.order - b.order);

  // Resolved documents mapping (choosing valid trade license, no duplicate, valid expiries)
  const resolvedFiles = [
    { reqId: 'R01', filename: 'Trade_License_Valid.pdf', expiryDate: '2027-06-30' },
    { reqId: 'R02', filename: 'TIN_Certificate.pdf', expiryDate: null },
    { reqId: 'R03', filename: 'VAT_Registration.pdf', expiryDate: null },
    { reqId: 'R04', filename: 'Bank_Solvency_Letter.pdf', expiryDate: '2026-11-15' },
    { reqId: 'R05', filename: 'Past_Experience_Certificate.pdf', expiryDate: null },
    { reqId: 'R06', filename: 'Technical_Proposal.pdf', expiryDate: null },
    { reqId: 'R07', filename: 'Financial_Proposal.pdf', expiryDate: null },
  ];

  const mergedPdf = await PDFDocument.create();
  const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const fontOblique = await mergedPdf.embedFont(StandardFonts.HelveticaOblique);

  // Colors
  const navyDark = rgb(0.06, 0.16, 0.35);
  const navyLight = rgb(0.12, 0.34, 0.65);
  const textDark = rgb(0.12, 0.15, 0.2);
  const textMuted = rgb(0.4, 0.45, 0.52);
  const borderGray = rgb(0.82, 0.86, 0.9);
  const tableHeaderBg = rgb(0.93, 0.95, 0.98);
  const zebraBg = rgb(0.97, 0.98, 1.0);

  // 1. Cover Page (Page 1) in English
  const coverPage = mergedPdf.addPage([595.28, 841.89]); // A4
  const { width: cWidth, height: cHeight } = coverPage.getSize();

  // Top header bands
  coverPage.drawRectangle({
    x: 0,
    y: cHeight - 14,
    width: cWidth,
    height: 14,
    color: navyDark,
  });
  coverPage.drawRectangle({
    x: 0,
    y: cHeight - 20,
    width: cWidth,
    height: 6,
    color: rgb(0.85, 0.65, 0.13),
  });

  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: 48,
    y: cHeight - 65,
    size: 22,
    font: fontBold,
    color: navyDark,
  });

  coverPage.drawText('OFFICIAL TENDER DOCUMENTATION COMPILATION', {
    x: 48,
    y: cHeight - 82,
    size: 9.5,
    font: fontRegular,
    color: textMuted,
  });

  // Metadata Box
  const metaBoxY = cHeight - 225;
  coverPage.drawRectangle({
    x: 48,
    y: metaBoxY,
    width: cWidth - 96,
    height: 125,
    borderColor: borderGray,
    borderWidth: 1,
    color: rgb(0.99, 0.99, 1),
  });

  const metaLeftX = 64;
  const metaRightX = 310;
  let curY = metaBoxY + 102;

  coverPage.drawText('Tender ID:', { x: metaLeftX, y: curY, size: 9, font: fontBold, color: textMuted });
  coverPage.drawText(tender.tender_id, { x: metaLeftX + 90, y: curY, size: 10, font: fontBold, color: navyDark });

  coverPage.drawText('Package Date:', { x: metaRightX, y: curY, size: 9, font: fontBold, color: textMuted });
  coverPage.drawText('2026-10-06', { x: metaRightX + 110, y: curY, size: 9.5, font: fontRegular, color: textDark });

  curY -= 24;
  coverPage.drawText('Tender Title:', { x: metaLeftX, y: curY, size: 9, font: fontBold, color: textMuted });
  coverPage.drawText(tender.title, { x: metaLeftX + 90, y: curY, size: 9.5, font: fontRegular, color: textDark });

  coverPage.drawText('Submission Deadline:', { x: metaRightX, y: curY, size: 9, font: fontBold, color: textMuted });
  coverPage.drawText(tender.submission_deadline, { x: metaRightX + 110, y: curY, size: 9.5, font: fontBold, color: rgb(0.75, 0.15, 0.15) });

  curY -= 24;
  coverPage.drawText('Procuring Entity:', { x: metaLeftX, y: curY, size: 9, font: fontBold, color: textMuted });
  coverPage.drawText(tender.procuring_entity, { x: metaLeftX + 90, y: curY, size: 9.5, font: fontRegular, color: textDark });

  curY -= 24;
  coverPage.drawText('Bidder Name:', { x: metaLeftX, y: curY, size: 9, font: fontBold, color: textMuted });
  coverPage.drawText(tender.bidder, { x: metaLeftX + 90, y: curY, size: 10, font: fontBold, color: navyLight });

  // Table of included documents
  const tableTopY = metaBoxY - 30;
  coverPage.drawText('SCHEDULE OF INCLUDED DOCUMENTS', {
    x: 48,
    y: tableTopY + 12,
    size: 11,
    font: fontBold,
    color: navyDark,
  });

  const tX = 48;
  const tW = cWidth - 96;
  const colOrderW = 40;
  const colTitleW = 190;
  const colFileW = 140;
  const colPagesW = 45;

  let rowY = tableTopY - 14;
  coverPage.drawRectangle({
    x: tX,
    y: rowY - 6,
    width: tW,
    height: 20,
    color: tableHeaderBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  coverPage.drawText('#', { x: tX + 8, y: rowY, size: 8.5, font: fontBold, color: navyDark });
  coverPage.drawText('Document Title', { x: tX + colOrderW, y: rowY, size: 8.5, font: fontBold, color: navyDark });
  coverPage.drawText('Matched File', { x: tX + colOrderW + colTitleW, y: rowY, size: 8.5, font: fontBold, color: navyDark });
  coverPage.drawText('Pages', { x: tX + colOrderW + colTitleW + colFileW + 8, y: rowY, size: 8.5, font: fontBold, color: navyDark });
  coverPage.drawText('Expiry Date', { x: tX + colOrderW + colTitleW + colFileW + colPagesW + 6, y: rowY, size: 8.5, font: fontBold, color: navyDark });

  rowY -= 20;

  const docFilePages = [];

  for (let idx = 0; idx < resolvedFiles.length; idx++) {
    const item = resolvedFiles[idx];
    const req = requirements.find(r => r.id === item.reqId);
    const fileBytes = fs.readFileSync(path.join(docsDir, item.filename));
    const srcDoc = await PDFDocument.load(fileBytes);
    const pCount = srcDoc.getPageCount();
    docFilePages.push({ req, item, fileBytes, pageCount: pCount });

    const isEven = idx % 2 === 0;
    if (isEven) {
      coverPage.drawRectangle({
        x: tX,
        y: rowY - 5,
        width: tW,
        height: 19,
        color: zebraBg,
      });
    }

    coverPage.drawRectangle({
      x: tX,
      y: rowY - 5,
      width: tW,
      height: 19,
      borderColor: borderGray,
      borderWidth: 0.5,
    });

    coverPage.drawText(`${idx + 1}`, { x: tX + 12, y: rowY, size: 8.5, font: fontRegular, color: textDark });
    coverPage.drawText(req.title_en, { x: tX + colOrderW, y: rowY, size: 8.5, font: fontBold, color: textDark });
    coverPage.drawText(item.filename, { x: tX + colOrderW + colTitleW, y: rowY, size: 8, font: fontRegular, color: textMuted });
    coverPage.drawText(`${pCount}`, { x: tX + colOrderW + colTitleW + colFileW + 18, y: rowY, size: 8.5, font: fontRegular, color: textDark });
    coverPage.drawText(item.expiryDate || 'N/A', { x: tX + colOrderW + colTitleW + colFileW + colPagesW + 10, y: rowY, size: 8, font: fontRegular, color: textDark });

    rowY -= 19;
  }

  // Merge all document pages
  for (const docItem of docFilePages) {
    const srcDoc = await PDFDocument.load(docItem.fileBytes);
    const pages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
    for (const page of pages) {
      mergedPdf.addPage(page);
    }
  }

  // Footers on EVERY page (<tender_id> | Page X of Y)
  const totalPages = mergedPdf.getPageCount();
  const allPages = mergedPdf.getPages();

  for (let i = 0; i < totalPages; i++) {
    const page = allPages[i];
    const { width: pWidth } = page.getSize();
    const pageNum = i + 1;
    const footerText = `${tender.tender_id} | Page ${pageNum} of ${totalPages}`;

    page.drawLine({
      start: { x: 36, y: 26 },
      end: { x: pWidth - 36, y: 26 },
      thickness: 0.6,
      color: borderGray,
    });

    page.drawText(tender.bidder, {
      x: 36,
      y: 13,
      size: 7.5,
      font: fontRegular,
      color: textMuted,
    });

    const textWidth = fontBold.widthOfTextAtSize(footerText, 8.5);
    page.drawText(footerText, {
      x: pWidth - 36 - textWidth,
      y: 13,
      size: 8.5,
      font: fontBold,
      color: navyDark,
    });
  }

  const finalPdfBytes = await mergedPdf.save();
  const outputPath = path.join(outputDir, `${tender.tender_id}_Package.pdf`);
  fs.writeFileSync(outputPath, finalPdfBytes);

  console.log(`Successfully generated submission package at: ${outputPath}`);
  console.log(`Total Pages: ${totalPages}`);
}

main().catch(err => {
  console.error('Error generating output package:', err);
  process.exit(1);
});
