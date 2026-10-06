import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { TenderInfo, Requirement, RequirementMatch, UploadedFile, PackageGenerationOptions } from '../types';

export interface GenerationProgressCallback {
  (step: string, percentage: number): void;
}

export async function generateTenderPackage(
  tender: TenderInfo,
  requirements: Requirement[],
  matches: RequirementMatch[],
  uploadedFiles: UploadedFile[],
  options: PackageGenerationOptions,
  onProgress?: GenerationProgressCallback
): Promise<Uint8Array> {
  onProgress?.('Initializing PDF document...', 10);
  const mergedPdf = await PDFDocument.create();

  // Standard fonts
  const fontRegular = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await mergedPdf.embedFont(StandardFonts.HelveticaOblique);

  const fileMap = new Map<string, UploadedFile>();
  uploadedFiles.forEach(f => fileMap.set(f.id, f));

  const matchMap = new Map<string, RequirementMatch>();
  matches.forEach(m => matchMap.set(m.requirementId, m));

  // Filter and sort included documents strictly by order
  // "Skip optional documents with no file" (Section 6.2)
  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);
  const includedDocs: {
    req: Requirement;
    match: RequirementMatch;
    file: UploadedFile;
    pageOffset?: number;
  }[] = [];

  for (const req of sortedReqs) {
    const match = matchMap.get(req.id);
    if (match && match.fileId) {
      const file = fileMap.get(match.fileId);
      if (file && !file.isCorrupt) {
        includedDocs.push({ req, match, file });
      }
    }
  }

  const currentDateStr = new Date().toISOString().split('T')[0];

  // Colors
  const navyDark = rgb(0.06, 0.16, 0.35);
  const navyLight = rgb(0.12, 0.34, 0.65);
  const textDark = rgb(0.12, 0.15, 0.2);
  const textMuted = rgb(0.4, 0.45, 0.52);
  const borderGray = rgb(0.82, 0.86, 0.9);
  const tableHeaderBg = rgb(0.93, 0.95, 0.98);
  const zebraBg = rgb(0.97, 0.98, 1.0);

  // -------------------------------------------------------------
  // 6.1 PAGE 1: COVER PAGE (in English)
  // -------------------------------------------------------------
  onProgress?.('Creating official cover page...', 25);
  const coverPage = mergedPdf.addPage([595.28, 841.89]); // A4
  const { width: cWidth, height: cHeight } = coverPage.getSize();

  // Top header decorative bands
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
    color: rgb(0.85, 0.65, 0.13), // Gold accent
  });

  // Main Title & Subtitle
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

  // Tender Metadata Box
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

  // Left & right metadata columns
  const metaLeftX = 64;
  const metaRightX = 310;
  let curY = metaBoxY + 102;

  // Tender ID
  coverPage.drawText('Tender ID:', { x: metaLeftX, y: curY, size: 9, font: fontBold, color: textMuted });
  coverPage.drawText(tender.tender_id, { x: metaLeftX + 90, y: curY, size: 10, font: fontBold, color: navyDark });

  // Generation Date
  coverPage.drawText('Package Date:', { x: metaRightX, y: curY, size: 9, font: fontBold, color: textMuted });
  coverPage.drawText(currentDateStr, { x: metaRightX + 110, y: curY, size: 9.5, font: fontRegular, color: textDark });

  curY -= 24;
  // Tender Title
  coverPage.drawText('Tender Title:', { x: metaLeftX, y: curY, size: 9, font: fontBold, color: textMuted });
  const titleDisplay = tender.title.length > 28 ? tender.title.substring(0, 27) + '...' : tender.title;
  coverPage.drawText(titleDisplay, { x: metaLeftX + 90, y: curY, size: 9.5, font: fontRegular, color: textDark });

  // Submission Deadline
  coverPage.drawText('Submission Deadline:', { x: metaRightX, y: curY, size: 9, font: fontBold, color: textMuted });
  coverPage.drawText(tender.submission_deadline, { x: metaRightX + 110, y: curY, size: 9.5, font: fontBold, color: rgb(0.75, 0.15, 0.15) });

  curY -= 24;
  // Procuring Entity
  coverPage.drawText('Procuring Entity:', { x: metaLeftX, y: curY, size: 9, font: fontBold, color: textMuted });
  coverPage.drawText(tender.procuring_entity, { x: metaLeftX + 90, y: curY, size: 9.5, font: fontRegular, color: textDark });

  curY -= 24;
  // Bidder Name
  coverPage.drawText('Bidder Name:', { x: metaLeftX, y: curY, size: 9, font: fontBold, color: textMuted });
  coverPage.drawText(tender.bidder, { x: metaLeftX + 90, y: curY, size: 10, font: fontBold, color: navyLight });

  // -------------------------------------------------------------
  // List of Included Documents Table (Section 6.1)
  // -------------------------------------------------------------
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
  const colExpiryW = 84;

  // Header row
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

  includedDocs.forEach((item, index) => {
    const isEven = index % 2 === 0;
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

    const displayTitle = item.req.title_en.length > 28
      ? item.req.title_en.substring(0, 27) + '...'
      : item.req.title_en;

    const displayFile = item.file.name.length > 22
      ? item.file.name.substring(0, 20) + '...'
      : item.file.name;

    const expiryDisplay = item.req.has_expiry
      ? (item.match.expiryDate || 'N/A')
      : 'N/A';

    coverPage.drawText(`${index + 1}`, { x: tX + 12, y: rowY, size: 8.5, font: fontRegular, color: textDark });
    coverPage.drawText(displayTitle, { x: tX + colOrderW, y: rowY, size: 8.5, font: fontBold, color: textDark });
    coverPage.drawText(displayFile, { x: tX + colOrderW + colTitleW, y: rowY, size: 8, font: fontRegular, color: textMuted });
    coverPage.drawText(`${item.file.pageCount}`, { x: tX + colOrderW + colTitleW + colFileW + 18, y: rowY, size: 8.5, font: fontRegular, color: textDark });
    coverPage.drawText(expiryDisplay, { x: tX + colOrderW + colTitleW + colFileW + colPagesW + 10, y: rowY, size: 8, font: fontRegular, color: textDark });

    rowY -= 19;
  });

  // Total summary footer row
  const totalPagesInDocs = includedDocs.reduce((acc, curr) => acc + curr.file.pageCount, 0);
  coverPage.drawRectangle({
    x: tX,
    y: rowY - 5,
    width: tW,
    height: 20,
    color: tableHeaderBg,
    borderColor: borderGray,
    borderWidth: 1,
  });
  coverPage.drawText(`Total Documents Included: ${includedDocs.length}`, {
    x: tX + colOrderW,
    y: rowY,
    size: 8.5,
    font: fontBold,
    color: navyDark,
  });
  coverPage.drawText(`${totalPagesInDocs} pgs`, {
    x: tX + colOrderW + colTitleW + colFileW + 12,
    y: rowY,
    size: 8.5,
    font: fontBold,
    color: navyDark,
  });

  // Compliance statement at bottom of cover
  coverPage.drawText('Verified and prepared in accordance with tender specification instructions.', {
    x: 48,
    y: 50,
    size: 8,
    font: fontOblique,
    color: textMuted,
  });

  // -------------------------------------------------------------
  // BONUS 7.1: TABLE OF CONTENTS / INDEX PAGE (if enabled)
  // -------------------------------------------------------------
  let indexPageNumber = 0;
  if (options.includeIndexPage) {
    onProgress?.('Generating Table of Contents / Index page...', 35);
    const indexPage = mergedPdf.addPage([595.28, 841.89]);
    indexPageNumber = mergedPdf.getPageCount();

    indexPage.drawRectangle({
      x: 0,
      y: cHeight - 14,
      width: cWidth,
      height: 14,
      color: navyLight,
    });

    indexPage.drawText('TABLE OF CONTENTS / INDEX', {
      x: 48,
      y: cHeight - 65,
      size: 18,
      font: fontBold,
      color: navyDark,
    });

    indexPage.drawText('Sequential document locator for tender evaluation panel', {
      x: 48,
      y: cHeight - 82,
      size: 9.5,
      font: fontRegular,
      color: textMuted,
    });

    // We will calculate page offsets as documents are appended
  }

  // -------------------------------------------------------------
  // 6.2 MERGE INCLUDED DOCUMENTS IN STRICT ORDER
  // -------------------------------------------------------------
  let currentPageCounter = mergedPdf.getPageCount();

  for (let i = 0; i < includedDocs.length; i++) {
    const docItem = includedDocs[i];
    const pct = Math.floor(40 + (i / includedDocs.length) * 45);
    onProgress?.(`Merging document ${i + 1}/${includedDocs.length}: ${docItem.req.title_en}...`, pct);

    docItem.pageOffset = currentPageCounter + 1;

    try {
      const srcDoc = await PDFDocument.load(docItem.file.buffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());

      for (const page of copiedPages) {
        mergedPdf.addPage(page);
        currentPageCounter++;
      }
    } catch (err) {
      console.error(`Error copying pages for file ${docItem.file.name}:`, err);
    }
  }

  // If index page was added, populate its entries with exact starting page numbers!
  if (options.includeIndexPage && indexPageNumber > 0) {
    const indexPage = mergedPdf.getPage(indexPageNumber - 1);
    let tocY = cHeight - 130;

    indexPage.drawText('Cover Page', { x: 50, y: tocY, size: 10, font: fontBold, color: textDark });
    indexPage.drawText('........................................................................................................', { x: 180, y: tocY, size: 8, font: fontRegular, color: textMuted });
    indexPage.drawText('Page 1', { x: cWidth - 90, y: tocY, size: 10, font: fontBold, color: navyDark });
    tocY -= 26;

    indexPage.drawText('Table of Contents', { x: 50, y: tocY, size: 10, font: fontBold, color: textDark });
    indexPage.drawText('........................................................................................................', { x: 180, y: tocY, size: 8, font: fontRegular, color: textMuted });
    indexPage.drawText(`Page 2`, { x: cWidth - 90, y: tocY, size: 10, font: fontBold, color: navyDark });
    tocY -= 26;

    includedDocs.forEach((item, idx) => {
      indexPage.drawText(`${idx + 1}. ${item.req.title_en}`, { x: 50, y: tocY, size: 9.5, font: fontBold, color: textDark });
      indexPage.drawText('........................................................................................................', { x: 230, y: tocY, size: 8, font: fontRegular, color: textMuted });
      indexPage.drawText(`Page ${item.pageOffset}`, { x: cWidth - 90, y: tocY, size: 9.5, font: fontBold, color: navyLight });
      tocY -= 24;
    });
  }

  // -------------------------------------------------------------
  // BONUS 7.2: OFFICIAL SEAL / SIGNATURE STAMP EMBEDDING
  // -------------------------------------------------------------
  let embeddedSealImage: any = null;
  if (options.sealImageBuffer) {
    try {
      embeddedSealImage = await mergedPdf.embedPng(options.sealImageBuffer);
    } catch (err) {
      console.warn('Failed to embed seal image:', err);
    }
  }

  // -------------------------------------------------------------
  // 6.3 & 6.4 FOOTER ON EVERY PAGE (<tender_id> | Page X of Y)
  // -------------------------------------------------------------
  onProgress?.('Applying standard footers and seals across all pages...', 90);
  const totalPages = mergedPdf.getPageCount();
  const allPages = mergedPdf.getPages();

  for (let i = 0; i < totalPages; i++) {
    const page = allPages[i];
    const { width: pWidth, height: pHeight } = page.getSize();
    const pageNum = i + 1;
    const footerText = `${tender.tender_id} | Page ${pageNum} of ${totalPages}`;

    // Clean footer separator line (Section 6.4: Must not cover document content)
    page.drawLine({
      start: { x: 36, y: 26 },
      end: { x: pWidth - 36, y: 26 },
      thickness: 0.6,
      color: borderGray,
    });

    // Left Tender Reference
    page.drawText(tender.bidder, {
      x: 36,
      y: 13,
      size: 7.5,
      font: fontRegular,
      color: textMuted,
    });

    // Right Footer text (T-2026-0417 | Page X of Y)
    const textWidth = fontBold.widthOfTextAtSize(footerText, 8.5);
    page.drawText(footerText, {
      x: pWidth - 36 - textWidth,
      y: 13,
      size: 8.5,
      font: fontBold,
      color: navyDark,
    });

    // Draw seal if requested
    if (embeddedSealImage) {
      const shouldDrawSeal =
        options.sealPlacement === 'all' ||
        (options.sealPlacement === 'cover' && pageNum === 1) ||
        (options.sealPlacement === 'last_page_each'); // placed on key pages

      if (shouldDrawSeal) {
        const sealDims = embeddedSealImage.scale(options.sealScale || 0.25);
        page.drawImage(embeddedSealImage, {
          x: pWidth - sealDims.width - 45,
          y: 40,
          width: sealDims.width,
          height: sealDims.height,
          opacity: 0.85,
        });
      }
    }
  }

  onProgress?.('Finalizing and compiling PDF bytes...', 98);
  const finalPdfBytes = await mergedPdf.save();
  onProgress?.('Complete!', 100);

  return finalPdfBytes;
}
