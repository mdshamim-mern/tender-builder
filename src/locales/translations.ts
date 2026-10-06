import { Language } from '../types';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  langSwitch: string;
  loadSamplePack: string;
  loadSamplePackDesc: string;
  uploadReqJson: string;
  dragReqJson: string;
  tenderDetails: string;
  tenderId: string;
  title: string;
  procuringEntity: string;
  bidder: string;
  submissionDeadline: string;
  generatedDate: string;
  docRequirements: string;
  docRequirementsDesc: string;
  uploadedFiles: string;
  uploadedFilesDesc: string;
  uploadPdfFiles: string;
  dragPdfFiles: string;
  nonPdfError: string;
  corruptPdfError: string;
  duplicateWarning: string;
  duplicateDesc: string;
  duplicateConflict: string;
  order: string;
  docName: string;
  type: string;
  mandatory: string;
  optional: string;
  matchedFile: string;
  selectFile: string;
  unmatch: string;
  expiryRequirement: string;
  hasExpiry: string;
  noExpiry: string;
  expiryDate: string;
  enterExpiryDate: string;
  status: string;
  actions: string;
  pages: string;
  size: string;
  remove: string;
  autoMatchBtn: string;
  autoMatchSuccess: string;
  autoMatchNone: string;
  statusMissing: string;
  statusExpiryNeeded: string;
  statusExpired: string;
  statusNotProvided: string;
  statusOk: string;
  statusMissingDesc: string;
  statusExpiryNeededDesc: string;
  statusExpiredDesc: string;
  statusNotProvidedDesc: string;
  statusOkDesc: string;
  generatePackage: string;
  downloadPackage: string;
  exportCsv: string;
  saveProject: string;
  loadProject: string;
  clearAll: string;
  projectSaved: string;
  projectLoaded: string;
  blockingProblemsTitle: string;
  readyToGenerateTitle: string;
  readyToGenerateDesc: string;
  generatingPackage: string;
  previewPackage: string;
  close: string;
  bonusOptions: string;
  includeIndexPage: string;
  includeIndexPageDesc: string;
  officialSeal: string;
  officialSealDesc: string;
  uploadSealPng: string;
  sealPlacement: string;
  sealPlacementCover: string;
  sealPlacementAll: string;
  sealPlacementLast: string;
  bilingualCover: string;
  bilingualCoverDesc: string;
  totalDocs: string;
  validDocs: string;
  missingMandatory: string;
  expiredDocs: string;
  demoLoadedSuccess: string;
  footerFormatNotice: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: "Tender Document Package Builder",
    appSubtitle: "Turn loose PDFs into a verified, ordered & compliant tender submission package",
    langSwitch: "বাংলা",
    loadSamplePack: "Load Sample Pack (Demo)",
    loadSamplePackDesc: "Preload official sample tender with real validation problems to test",
    uploadReqJson: "Upload requirements.json",
    dragReqJson: "Drag & drop requirements.json here or click to browse",
    tenderDetails: "Tender Information",
    tenderId: "Tender ID",
    title: "Tender Title",
    procuringEntity: "Procuring Entity",
    bidder: "Bidder Name",
    submissionDeadline: "Submission Deadline",
    generatedDate: "Package Date",
    docRequirements: "Required Documents Checklist",
    docRequirementsDesc: "Documents arranged strictly in tender order with real-time status validation",
    uploadedFiles: "Uploaded PDF Files",
    uploadedFilesDesc: "Manage and inspect uploaded documents for duplicates and page counts",
    uploadPdfFiles: "Upload PDF Documents",
    dragPdfFiles: "Drag & drop multiple PDF files here, or click to browse (PDF only)",
    nonPdfError: "File rejected! Only PDF files are permitted.",
    corruptPdfError: "File is damaged or password-protected and cannot be read.",
    duplicateWarning: "Duplicate Content Detected",
    duplicateDesc: "This file has identical content to another uploaded file.",
    duplicateConflict: "Cannot match duplicate file! Duplicate files must not be matched.",
    order: "Order",
    docName: "Document Name",
    type: "Requirement",
    mandatory: "Mandatory",
    optional: "Optional",
    matchedFile: "Matched PDF File",
    selectFile: "-- Select Matched File --",
    unmatch: "Unmatch",
    expiryRequirement: "Expiry Required?",
    hasExpiry: "Yes (Check Date)",
    noExpiry: "No Expiry",
    expiryDate: "Expiry Date",
    enterExpiryDate: "YYYY-MM-DD",
    status: "Status",
    actions: "Actions",
    pages: "pages",
    size: "Size",
    remove: "Remove",
    autoMatchBtn: "Smart Auto-Match",
    autoMatchSuccess: "Successfully matched {count} documents based on file names!",
    autoMatchNone: "No new matching files found.",
    statusMissing: "Missing",
    statusExpiryNeeded: "Expiry date needed",
    statusExpired: "Expired",
    statusNotProvided: "Not provided",
    statusOk: "OK",
    statusMissingDesc: "Required document, no file matched (Blocks package)",
    statusExpiryNeededDesc: "File matched, but expiry date is missing (Blocks package)",
    statusExpiredDesc: "Expiry date is before the submission deadline (Blocks package)",
    statusNotProvidedDesc: "Optional document, no file matched (Does not block)",
    statusOkDesc: "File matched and valid (Ready for package)",
    generatePackage: "Generate Submission Package",
    downloadPackage: "Download {filename}",
    exportCsv: "Export Checklist (CSV)",
    saveProject: "Save Project",
    loadProject: "Load Project",
    clearAll: "Reset",
    projectSaved: "Project session saved successfully!",
    projectLoaded: "Project session restored!",
    blockingProblemsTitle: "Package Generation Blocked",
    readyToGenerateTitle: "Package Ready for Generation",
    readyToGenerateDesc: "All mandatory documents are matched, verified, and valid for submission.",
    generatingPackage: "Generating final PDF package...",
    previewPackage: "Preview Package",
    close: "Close",
    bonusOptions: "Advanced & Bonus Package Options",
    includeIndexPage: "Include Table of Contents / Index Page",
    includeIndexPageDesc: "Adds Page 2 showing starting page numbers of all documents",
    officialSeal: "Official Seal / Signature Stamp",
    officialSealDesc: "Upload a transparent PNG stamp to imprint on package pages",
    uploadSealPng: "Upload Seal (PNG)",
    sealPlacement: "Seal Placement",
    sealPlacementCover: "Cover Page Only",
    sealPlacementAll: "All Document Pages",
    sealPlacementLast: "Last Page of Each Document",
    bilingualCover: "Bilingual English + Bangla Cover",
    bilingualCoverDesc: "Show document names in both languages on the cover table",
    totalDocs: "Total Required",
    validDocs: "Ready / OK",
    missingMandatory: "Missing Mandatory",
    expiredDocs: "Expired / Missing Date",
    demoLoadedSuccess: "Official Sample Pack loaded successfully with test cases!",
    footerFormatNotice: "Standard footer: {tender_id} | Page X of Y added to every page."
  },
  bn: {
    appTitle: "দরপত্র নথি প্যাকেজ প্রস্তুতকারক (Tender Package Builder)",
    appSubtitle: "আলাদা পিডিএফ ফাইলগুলোকে নির্ভুল, সুবিন্যস্ত ও পরীক্ষিত চূড়ান্ত দরপত্র প্যাকেজে রূপান্তর করুন",
    langSwitch: "English",
    loadSamplePack: "নমুনা প্যাক লোড করুন (ডেমো)",
    loadSamplePackDesc: "পরীক্ষার জন্য সমস্যাযুক্ত অফিশিয়াল নমুনা দরপত্র নথি তাৎক্ষণিক লোড করুন",
    uploadReqJson: "requirements.json আপলোড করুন",
    dragReqJson: "requirements.json এখানে টেনে আনুন অথবা ব্রাউজ করুন",
    tenderDetails: "দরপত্রের সাধারণ তথ্য",
    tenderId: "দরপত্র আইডি",
    title: "দরপত্রের শিরোনাম",
    procuringEntity: "সংগ্রহকারী কর্তৃপক্ষ",
    bidder: "দরদাতা প্রতিষ্ঠান",
    submissionDeadline: "জমাদানের শেষ সময়",
    generatedDate: "প্যাকেজ তৈরির তারিখ",
    docRequirements: "প্রয়োজনীয় নথিপত্রের তালিকা",
    docRequirementsDesc: "দরপত্রের ক্রম অনুসারে সাজানো এবং তাৎক্ষণিক স্ট্যাটাস যাচাইকরণ",
    uploadedFiles: "আপলোডকৃত পিডিএফ ফাইলসমূহ",
    uploadedFilesDesc: "আপলোড করা ফাইল ব্যবস্থাপনা, ডুপ্লিকেট শনাক্তকরণ ও পৃষ্ঠা সংখ্যা যাচাই",
    uploadPdfFiles: "পিডিএফ ফাইল আপলোড করুন",
    dragPdfFiles: "একাধিক পিডিএফ ফাইল এখানে টেনে এনে ছাড়ুন অথবা ক্লিক করুন (শুধুমাত্র PDF)",
    nonPdfError: "ফাইল বাতিল! শুধুমাত্র পিডিএফ (PDF) ফাইল গ্রহণযোগ্য।",
    corruptPdfError: "ফাইলটি নষ্ট অথবা পাসওয়ার্ড সংরক্ষিত, পড়া সম্ভব নয়।",
    duplicateWarning: "একই কনটেন্টের ডুপ্লিকেট ফাইল পাওয়া গেছে",
    duplicateDesc: "এই ফাইলটির অভ্যন্তরীণ বিষয়বস্তু অন্য একটি আপলোডকৃত ফাইলের হুবহু এক।",
    duplicateConflict: "ডুপ্লিকেট ফাইল ম্যাচ করা যাবে না! একই কনটেন্টযুক্ত ফাইল ভিন্ন নথিতে ব্যবহার নিষিদ্ধ।",
    order: "ক্রম",
    docName: "নথির নাম",
    type: "নথির ধরন",
    mandatory: "বাধ্যতামূলক",
    optional: "ঐচ্ছিক",
    matchedFile: "সংযুক্ত পিডিএফ ফাইল",
    selectFile: "-- সংযুক্ত ফাইল নির্বাচন করুন --",
    unmatch: "বাতিল করুন",
    expiryRequirement: "মেয়াদ যাচাই?",
    hasExpiry: "হ্যাঁ (তারিখ আবশ্যক)",
    noExpiry: "মেয়াদ নেই",
    expiryDate: "মেয়াদের শেষ তারিখ",
    enterExpiryDate: "YYYY-MM-DD",
    status: "স্ট্যাটাস",
    actions: "পদক্ষেপ",
    pages: "পৃষ্ঠা",
    size: "আকার",
    remove: "মুছুন",
    autoMatchBtn: "স্বয়ংক্রিয় ম্যাচ (Auto-Match)",
    autoMatchSuccess: "ফাইলের নামের ওপর ভিত্তি করে {count}টি নথি সফলভাবে ম্যাচ হয়েছে!",
    autoMatchNone: "নতুন কোনো ম্যাচ পাওয়া যায়নি।",
    statusMissing: "অনুপস্থিত (Missing)",
    statusExpiryNeeded: "মেয়াদের তারিখ প্রয়োজন (Expiry date needed)",
    statusExpired: "মেয়াদোত্তীর্ণ (Expired)",
    statusNotProvided: "সরবরাহ করা হয়নি (Not provided)",
    statusOk: "সঠিক (OK)",
    statusMissingDesc: "বাধ্যতামূলক নথি কিন্তু কোনো ফাইল সংযুক্ত করা হয়নি (প্যাকেজ তৈরি বন্ধ থাকবে)",
    statusExpiryNeededDesc: "ফাইল সংযুক্ত আছে কিন্তু মেয়াদের তারিখ প্রদান করা হয়নি (প্যাকেজ তৈরি বন্ধ থাকবে)",
    statusExpiredDesc: "নথির মেয়াদ জমাদানের শেষ তারিখের পূর্বে শেষ হয়ে গেছে (প্যাকেজ তৈরি বন্ধ থাকবে)",
    statusNotProvidedDesc: "ঐচ্ছিক নথি এবং কোনো ফাইল দেওয়া হয়নি (প্যাকেজ তৈরিতে বাধা নেই)",
    statusOkDesc: "ফাইল সংযুক্ত এবং মেয়াদের শর্ত উত্তীর্ণ হয়েছে (প্রস্তুত)",
    generatePackage: "চূড়ান্ত প্যাকেজ তৈরি করুন",
    downloadPackage: "ডাউনলোড করুন ({filename})",
    exportCsv: "চেকলিস্ট এক্সপোর্ট (CSV)",
    saveProject: "প্রজেক্ট সংরক্ষণ",
    loadProject: "প্রজেক্ট লোড",
    clearAll: "রিসেট",
    projectSaved: "বর্তমান প্রজেক্ট সেশন সফলভাবে সংরক্ষিত হয়েছে!",
    projectLoaded: "সংরক্ষিত প্রজেক্ট সেশন পুনরায় চালু করা হয়েছে!",
    blockingProblemsTitle: "প্যাকেজ তৈরি স্থগিত (সমস্যা শনাক্ত হয়েছে)",
    readyToGenerateTitle: "প্যাকেজ তৈরির জন্য সম্পূর্ণ প্রস্তুত",
    readyToGenerateDesc: "সকল বাধ্যতামূলক নথিপত্র যথাযথভাবে যাচাইকৃত ও বৈধ পাওয়া গেছে।",
    generatingPackage: "সম্মিলিত পিডিএফ প্যাকেজ প্রস্তুত করা হচ্ছে...",
    previewPackage: "প্রিভিউ দেখুন",
    close: "বন্ধ করুন",
    bonusOptions: "অতিরিক্ত ও অ্যাডভান্সড সেটিংস",
    includeIndexPage: "সূচিপত্র / ইনডেক্স পৃষ্ঠা যুক্ত করুন",
    includeIndexPageDesc: "কভার পেজের পর পৃষ্ঠা ২ হিসেবে প্রতিটি নথির শুরুর পৃষ্ঠা নম্বরসহ সূচিপত্র যোগ করবে",
    officialSeal: "অফিসিয়াল সিল / স্বাক্ষর স্ট্যাম্প",
    officialSealDesc: "স্বচ্ছ PNG ফরম্যাটের ডিজিটাল সিল বা স্বাক্ষর প্রতিটি পাতায় বসান",
    uploadSealPng: "সিল আপলোড (PNG)",
    sealPlacement: "সিলের অবস্থান",
    sealPlacementCover: "শুধুমাত্র কভার পেজে",
    sealPlacementAll: "প্রতিটি ডকুমেন্ট পেজে",
    sealPlacementLast: "প্রতিটি ডকুমেন্টের শেষ পেজে",
    bilingualCover: "দ্বিভাষিক কভার পেজ (ইংরেজি + বাংলা)",
    bilingualCoverDesc: "কভার পেজের নথির তালিকায় বাংলা ও ইংরেজি উভয় শিরোনাম প্রদর্শন করবে",
    totalDocs: "মোট প্রয়োজনীয় নথি",
    validDocs: "প্রস্তুত / সঠিক",
    missingMandatory: "অনুপস্থিত বাধ্যতামূলক",
    expiredDocs: "মেয়াদোত্তীর্ণ / তারিখ নেই",
    demoLoadedSuccess: "পরীক্ষণের জন্য অফিশিয়াল নমুনা প্যাক সফলভাবে লোড হয়েছে!",
    footerFormatNotice: "প্রতিটি পৃষ্ঠার নিচে '{tender_id} | Page X of Y' ফুটার যুক্ত হবে।"
  }
};
