import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function createSamplePdf(title, subtitle, pagesCount = 1, extraDetails = []) {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= pagesCount; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // Top decorative bar
    page.drawRectangle({
      x: 40,
      y: height - 60,
      width: width - 80,
      height: 4,
      color: rgb(0.12, 0.44, 0.88),
    });

    // Document Header
    page.drawText(title, {
      x: 50,
      y: height - 100,
      size: 20,
      font: fontBold,
      color: rgb(0.08, 0.18, 0.36),
    });

    page.drawText(subtitle, {
      x: 50,
      y: height - 125,
      size: 11,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.5),
    });

    page.drawText(`Page ${i} of ${pagesCount}`, {
      x: width - 130,
      y: height - 100,
      size: 10,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.5),
    });

    // Body content box
    page.drawRectangle({
      x: 40,
      y: 100,
      width: width - 80,
      height: height - 250,
      borderColor: rgb(0.85, 0.88, 0.92),
      borderWidth: 1,
      color: rgb(0.98, 0.99, 1),
    });

    let currentY = height - 170;
    for (const detail of extraDetails) {
      page.drawText(detail, {
        x: 60,
        y: currentY,
        size: 11,
        font: fontRegular,
        color: rgb(0.2, 0.25, 0.3),
      });
      currentY -= 24;
    }

    page.drawText(`Official Sample Document for Tender Submission (Section ${i})`, {
      x: 60,
      y: currentY - 20,
      size: 10,
      font: fontRegular,
      color: rgb(0.5, 0.55, 0.6),
    });
  }

  return await pdfDoc.save();
}

async function main() {
  const baseDir = path.resolve(process.cwd(), 'public', 'sample-pack');
  const docsDir = path.join(baseDir, 'documents');

  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // 1. requirements.json
  const requirements = {
    tender: {
      tender_id: "T-2026-0417",
      title: "Supply of IT Equipment",
      procuring_entity: "Example Directorate",
      bidder: "Example Company Ltd.",
      submission_deadline: "2026-10-20"
    },
    requirements: [
      {
        id: "R01",
        order: 1,
        title_en: "Trade License",
        title_bn: "ট্রেড লাইসেন্স",
        mandatory: true,
        has_expiry: true
      },
      {
        id: "R02",
        order: 2,
        title_en: "TIN Certificate",
        title_bn: "টিআইএন সার্টিফিকেট",
        mandatory: true,
        has_expiry: false
      },
      {
        id: "R03",
        order: 3,
        title_en: "VAT Registration Certificate",
        title_bn: "ভ্যাট নিবন্ধন সনদ",
        mandatory: true,
        has_expiry: false
      },
      {
        id: "R04",
        order: 4,
        title_en: "Bank Solvency Certificate",
        title_bn: "ব্যাংক সলভেন্সি সার্টিফিকেট",
        mandatory: true,
        has_expiry: true
      },
      {
        id: "R05",
        order: 5,
        title_en: "Past Experience Certificate",
        title_bn: "কাজের অভিজ্ঞতার সনদ",
        mandatory: false,
        has_expiry: false
      },
      {
        id: "R06",
        order: 6,
        title_en: "Technical Proposal",
        title_bn: "কারিগরি প্রস্তাবনা",
        mandatory: true,
        has_expiry: false
      },
      {
        id: "R07",
        order: 7,
        title_en: "Financial Proposal",
        title_bn: "আর্থিক প্রস্তাবনা",
        mandatory: true,
        has_expiry: false
      }
    ]
  };

  fs.writeFileSync(path.join(baseDir, 'requirements.json'), JSON.stringify(requirements, null, 2));

  // 2. Generate PDF files
  // Valid Trade License (Expiry: 2027-06-30)
  const tradeValid = await createSamplePdf(
    "TRADE LICENSE CERTIFICATE",
    "Government of the People's Republic of Bangladesh - City Corporation",
    1,
    [
      "License No: TR-2024-984210",
      "Issued to: Example Company Ltd.",
      "Business Nature: Computer & IT Equipment Import & Supply",
      "Issue Date: 2024-07-01",
      "Valid Until: 2027-06-30 (Valid on submission date)"
    ]
  );
  fs.writeFileSync(path.join(docsDir, 'Trade_License_Valid.pdf'), tradeValid);

  // Expired Trade License (Expiry: 2025-06-30 - Before deadline 2026-10-20!)
  const tradeExpired = await createSamplePdf(
    "TRADE LICENSE CERTIFICATE (EXPIRED)",
    "Expired License Copy for Testing Validation",
    1,
    [
      "License No: TR-2022-110294",
      "Issued to: Example Company Ltd.",
      "Issue Date: 2022-07-01",
      "Valid Until: 2025-06-30 (EXPIRED BEFORE SUBMISSION DEADLINE 2026-10-20)"
    ]
  );
  fs.writeFileSync(path.join(docsDir, 'Trade_License_Expired.pdf'), tradeExpired);

  // TIN Certificate
  const tinPdf = await createSamplePdf(
    "TAXPAYER IDENTIFICATION CERTIFICATE",
    "National Board of Revenue, Bangladesh (TIN)",
    1,
    [
      "TIN: 849301928401",
      "Name: Example Company Ltd.",
      "Taxes Circle: Circle-14, Taxes Zone-03, Dhaka",
      "Status: Active Taxpayer"
    ]
  );
  fs.writeFileSync(path.join(docsDir, 'TIN_Certificate.pdf'), tinPdf);

  // VAT Certificate
  const vatPdf = await createSamplePdf(
    "VAT REGISTRATION CERTIFICATE (BIN)",
    "Customs, Excise and VAT Commissionerate, Dhaka",
    1,
    [
      "BIN: 001928374-0102",
      "Business Name: Example Company Ltd.",
      "Form: Mushak-2.8",
      "Registration Type: Regular"
    ]
  );
  fs.writeFileSync(path.join(docsDir, 'VAT_Registration.pdf'), vatPdf);

  // Bank Solvency Certificate (Expiry: 2026-11-15 - After deadline 2026-10-20)
  const bankPdf = await createSamplePdf(
    "BANK SOLVENCY CERTIFICATE",
    "Prime Commercial Bank Ltd. - Corporate Branch",
    1,
    [
      "Reference: PCB/CORP/SOLV/2026-789",
      "Account Holder: Example Company Ltd.",
      "Account Type: Current Account (BDT)",
      "Financial Standing: Highly Solvent and Creditworthy",
      "Certificate Validity: Valid through 2026-11-15"
    ]
  );
  fs.writeFileSync(path.join(docsDir, 'Bank_Solvency_Letter.pdf'), bankPdf);

  // Past Experience Certificate (Optional)
  const expPdf = await createSamplePdf(
    "PAST EXPERIENCE CERTIFICATE",
    "Ministry of Posts, Telecommunications & IT",
    2,
    [
      "Contract Ref: ICT-DIV-2024-551",
      "Project: Supply of 500 Enterprise Workstations & Laptops",
      "Contract Value: BDT 45,000,000",
      "Completion Status: Successfully Delivered & Verified on 2025-03-10"
    ]
  );
  fs.writeFileSync(path.join(docsDir, 'Past_Experience_Certificate.pdf'), expPdf);

  // Technical Proposal (Multi-page)
  const techPdf = await createSamplePdf(
    "TECHNICAL PROPOSAL & SPECIFICATIONS",
    "Tender Reference: T-2026-0417 - Supply of IT Equipment",
    3,
    [
      "Bidder: Example Company Ltd.",
      "Scope: Supply, Installation & Configuration of Server & Network Infrastructure",
      "OEM Certifications: ISO 9001, Tier-III Compatibility Certified",
      "Warranty & SLA: 3 Years 24/7 Enterprise Onsite Support"
    ]
  );
  fs.writeFileSync(path.join(docsDir, 'Technical_Proposal.pdf'), techPdf);

  // Duplicate Technical Proposal (Exact same content as Technical_Proposal.pdf to test Task 4.6!)
  fs.writeFileSync(path.join(docsDir, 'Technical_Proposal_Copy_Duplicate.pdf'), techPdf);

  // Financial Proposal
  const finPdf = await createSamplePdf(
    "FINANCIAL PROPOSAL & BILL OF QUANTITIES (BOQ)",
    "Confidential Financial Submission for T-2026-0417",
    2,
    [
      "Total Quoted Bid Price: BDT 38,500,000 (Inclusive of VAT & AIT)",
      "Bid Security BG No: BG-2026-9902 attached",
      "Payment Terms: Milestone-based as per Tender Schedule"
    ]
  );
  fs.writeFileSync(path.join(docsDir, 'Financial_Proposal.pdf'), finPdf);

  // Non-PDF file to test rejection (Task 4.2)
  fs.writeFileSync(
    path.join(docsDir, 'Notice_Readme.txt'),
    "This is a text file, not a PDF. The application must reject this file with a clear error message."
  );

  // Corrupted PDF file to test safe handling (Bonus 7.7)
  fs.writeFileSync(
    path.join(docsDir, 'Corrupted_Doc_Sample.pdf'),
    Buffer.from("%PDF-1.4\nDAMAGED_CORRUPTED_STREAM_HEADER_INVALID_SYNTAX_FAIL")
  );

  console.log("Successfully generated all sample-pack files in public/sample-pack!");
}

main().catch(err => {
  console.error("Error generating sample pack:", err);
  process.exit(1);
});
