import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  TenderInfo, 
  Requirement, 
  UploadedFile, 
  RequirementMatch, 
  Language, 
  PackageGenerationOptions 
} from './types';
import { translations } from './locales/translations';
import { inspectFile } from './utils/fileInspector';
import { 
  markDuplicateFiles, 
  calculateDocumentStatus, 
  getBlockingIssuesSummary 
} from './utils/validationLogic';
import { autoMatchFiles } from './utils/autoMatcher';
import { generateTenderPackage } from './utils/pdfGenerator';
import { exportChecklistToCsv } from './utils/csvExport';

import { Header } from './components/Header';
import { JsonLoader } from './components/JsonLoader';
import { FileUploader } from './components/FileUploader';
import { RequirementList } from './components/RequirementList';
import { ActionPanel } from './components/ActionPanel';
import { PdfPreviewModal } from './components/PdfPreviewModal';

const DEFAULT_TENDER: TenderInfo = {
  tender_id: "T-2026-0417",
  title: "Supply of IT Equipment",
  procuring_entity: "Example Directorate",
  bidder: "Example Company Ltd.",
  submission_deadline: "2026-10-20",
};

const DEFAULT_REQUIREMENTS: Requirement[] = [
  { id: "R01", order: 1, title_en: "Trade License", title_bn: "ট্রেড লাইসেন্স", mandatory: true, has_expiry: true },
  { id: "R02", order: 2, title_en: "TIN Certificate", title_bn: "টিআইএন সার্টিফিকেট", mandatory: true, has_expiry: false },
  { id: "R03", order: 3, title_en: "VAT Registration Certificate", title_bn: "ভ্যাট নিবন্ধন সনদ", mandatory: true, has_expiry: false },
  { id: "R04", order: 4, title_en: "Bank Solvency Certificate", title_bn: "ব্যাংক সলভেন্সি সার্টিফিকেট", mandatory: true, has_expiry: true },
  { id: "R05", order: 5, title_en: "Past Experience Certificate", title_bn: "কাজের অভিজ্ঞতার সনদ", mandatory: false, has_expiry: false },
  { id: "R06", order: 6, title_en: "Technical Proposal", title_bn: "কারিগরি প্রস্তাবনা", mandatory: true, has_expiry: false },
  { id: "R07", order: 7, title_en: "Financial Proposal", title_bn: "আর্থিক প্রস্তাবনা", mandatory: true, has_expiry: false }
];

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  // Tender state
  const [tender, setTender] = useState<TenderInfo>(DEFAULT_TENDER);
  const [requirements, setRequirements] = useState<Requirement[]>(DEFAULT_REQUIREMENTS);

  // Files & matches state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [matches, setMatches] = useState<RequirementMatch[]>([]);
  const [fileErrorMessage, setFileErrorMessage] = useState<string | null>(null);

  // Package generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgressText, setGenerationProgressText] = useState<string>('');
  const [generatedPdfBytes, setGeneratedPdfBytes] = useState<Uint8Array | null>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState<boolean>(false);

  // Bonus options
  const [options, setOptions] = useState<PackageGenerationOptions>({
    includeIndexPage: false,
    sealImageBuffer: undefined,
    sealPlacement: 'cover',
    sealScale: 0.25,
    bilingualCover: false,
  });

  // Toast / alert message
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Sync matches when requirements change
  useEffect(() => {
    setMatches(prevMatches => {
      return requirements.map(req => {
        const existing = prevMatches.find(m => m.requirementId === req.id);
        return existing || { requirementId: req.id, fileId: null };
      });
    });
  }, [requirements]);

  // Load custom requirements.json (Task 4.1)
  const handleLoadJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.tender || !parsed.requirements || !Array.isArray(parsed.requirements)) {
        throw new Error('Invalid schema: Missing tender or requirements array.');
      }
      setTender(parsed.tender);
      setRequirements(parsed.requirements);
      showToast(t.projectLoaded, 'success');
    } catch (err: any) {
      setFileErrorMessage(`Failed to parse requirements.json: ${err.message}`);
    }
  };

  // Upload files handler (Task 4.2 & 4.6)
  const handleFilesAdded = async (fileList: FileList | File[]) => {
    setFileErrorMessage(null);
    const newFiles: UploadedFile[] = [];
    let rejectedCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const inspected = await inspectFile(file);
        newFiles.push(inspected);
      } catch (err: any) {
        if (err.message?.includes('REJECTED_NON_PDF')) {
          rejectedCount++;
          setFileErrorMessage(t.nonPdfError + ` ("${file.name}")`);
        } else {
          console.error('Error inspecting file:', err);
        }
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => {
        const combined = [...prev, ...newFiles];
        return markDuplicateFiles(combined);
      });
      showToast(`${newFiles.length} file(s) added successfully!`, 'success');
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const filtered = prev.filter(f => f.id !== fileId);
      return markDuplicateFiles(filtered);
    });

    // Unmatch if file was matched
    setMatches(prev => prev.map(m => m.fileId === fileId ? { ...m, fileId: null } : m));
  };

  // Match / unmatch file to requirement (Task 4.3)
  const handleMatchChange = (requirementId: string, fileId: string | null) => {
    setMatches(prev => {
      return prev.map(m => {
        // Clear any other requirement that had this file assigned ("One file goes to at most one document")
        if (fileId && m.fileId === fileId && m.requirementId !== requirementId) {
          return { ...m, fileId: null };
        }
        if (m.requirementId === requirementId) {
          return { ...m, fileId };
        }
        return m;
      });
    });
  };

  // Expiry date change (Task 4.4)
  const handleExpiryDateChange = (requirementId: string, expiryDate: string) => {
    setMatches(prev => {
      return prev.map(m => {
        if (m.requirementId === requirementId) {
          return { ...m, expiryDate };
        }
        return m;
      });
    });
  };

  // Auto-Match button (Bonus 7.6)
  const handleAutoMatch = () => {
    const { matches: newMatches, matchedCount } = autoMatchFiles(
      requirements,
      uploadedFiles,
      matches
    );

    setMatches(newMatches);
    if (matchedCount > 0) {
      showToast(t.autoMatchSuccess.replace('{count}', String(matchedCount)), 'success');
    } else {
      showToast(t.autoMatchNone, 'info');
    }
  };

  // Load Built-in Sample Pack with all sample files
  const handleLoadDemoSamplePack = async () => {
    setIsLoadingDemo(true);
    try {
      // 1. Fetch requirements.json
      const reqRes = await fetch('/sample-pack/requirements.json');
      if (reqRes.ok) {
        const reqJson = await reqRes.json();
        setTender(reqJson.tender);
        setRequirements(reqJson.requirements);
      }

      // 2. Fetch sample document PDFs
      const docNames = [
        'Trade_License_Valid.pdf',
        'Trade_License_Expired.pdf',
        'TIN_Certificate.pdf',
        'VAT_Registration.pdf',
        'Bank_Solvency_Letter.pdf',
        'Past_Experience_Certificate.pdf',
        'Technical_Proposal.pdf',
        'Technical_Proposal_Copy_Duplicate.pdf',
        'Financial_Proposal.pdf',
      ];

      const loadedFiles: UploadedFile[] = [];

      for (const name of docNames) {
        try {
          const res = await fetch(`/sample-pack/documents/${name}`);
          if (res.ok) {
            const blob = await res.blob();
            const file = new File([blob], name, { type: 'application/pdf' });
            const inspected = await inspectFile(file);
            loadedFiles.push(inspected);
          }
        } catch (e) {
          console.warn(`Could not preload ${name}`, e);
        }
      }

      const markedFiles = markDuplicateFiles(loadedFiles);
      setUploadedFiles(markedFiles);

      // Auto-match initial valid files to demonstrate workflow
      const { matches: autoMatched } = autoMatchFiles(
        requirements,
        markedFiles,
        requirements.map(r => ({ requirementId: r.id, fileId: null }))
      );

      // Set expiry dates for Trade License (valid) and Bank Solvency (valid)
      const adjustedMatches = autoMatched.map(m => {
        if (m.requirementId === 'R01') {
          return { ...m, expiryDate: '2027-06-30' };
        }
        if (m.requirementId === 'R04') {
          return { ...m, expiryDate: '2026-11-15' };
        }
        return m;
      });

      setMatches(adjustedMatches);
      showToast(t.demoLoadedSuccess, 'success');
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    } catch (err: any) {
      console.error('Error loading sample pack:', err);
      showToast('Could not load sample pack automatically.', 'error');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  // Generate package (Task 4.7 & Section 6)
  const handleGeneratePackage = async () => {
    const blocking = getBlockingIssuesSummary(
      requirements,
      matches,
      uploadedFiles,
      tender.submission_deadline,
      lang
    );

    if (blocking.length > 0) {
      showToast('Cannot generate package while blocking issues exist.', 'error');
      return;
    }

    setIsGenerating(true);
    setGenerationProgressText('Starting compilation...');

    try {
      const pdfBytes = await generateTenderPackage(
        tender,
        requirements,
        matches,
        uploadedFiles,
        options,
        (step, pct) => {
          setGenerationProgressText(`${step} (${pct}%)`);
        }
      );

      setGeneratedPdfBytes(pdfBytes);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      if (generatedPdfUrl) URL.revokeObjectURL(generatedPdfUrl);
      const url = URL.createObjectURL(blob);
      setGeneratedPdfUrl(url);

      showToast('Package generated successfully!', 'success');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      console.error('Error generating package:', err);
      showToast(`Generation failed: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
      setGenerationProgressText('');
    }
  };

  // Download Package (Task 4.8)
  const handleDownloadPackage = () => {
    if (!generatedPdfUrl) return;
    const filename = `${tender.tender_id}_Package.pdf`;
    const link = document.createElement('a');
    link.href = generatedPdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV Checklist (Bonus 7.3)
  const handleExportCsv = () => {
    exportChecklistToCsv(tender, requirements, matches, uploadedFiles);
    showToast('Checklist exported to CSV.', 'success');
  };

  // Save Project Session (Bonus 7.4)
  const handleSaveProject = () => {
    const session = {
      tender,
      requirements,
      matches,
      options: {
        includeIndexPage: options.includeIndexPage,
        sealPlacement: options.sealPlacement,
        bilingualCover: options.bilingualCover,
      },
      fileNames: uploadedFiles.map(f => f.name),
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tender.tender_id}_Project_State.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(t.projectSaved, 'success');
  };

  // Load Project Session
  const handleLoadProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const session = JSON.parse(event.target?.result as string);
          if (session.tender) setTender(session.tender);
          if (session.requirements) setRequirements(session.requirements);
          if (session.matches) setMatches(session.matches);
          showToast(t.projectLoaded, 'success');
        } catch (err: any) {
          showToast(`Invalid project file: ${err.message}`, 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Reset
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all files and matches?')) {
      setUploadedFiles([]);
      setMatches(requirements.map(r => ({ requirementId: r.id, fileId: null })));
      setGeneratedPdfBytes(null);
      if (generatedPdfUrl) URL.revokeObjectURL(generatedPdfUrl);
      setGeneratedPdfUrl(null);
      setFileErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce-subtle ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
            : toastMessage.type === 'error'
            ? 'bg-rose-600 text-white shadow-rose-600/20'
            : 'bg-slate-800 text-white'
        }`}>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        lang={lang}
        onToggleLang={() => setLang(l => (l === 'en' ? 'bn' : 'en'))}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onReset={handleReset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Step 1: Tender Details & requirements.json loader (Task 4.1) */}
        <JsonLoader
          tender={tender}
          lang={lang}
          onLoadJson={handleLoadJson}
          onLoadDemoSamplePack={handleLoadDemoSamplePack}
          isLoadingDemo={isLoadingDemo}
        />

        {/* 2-column or stacked grid for file upload and requirement matching */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Uploaded Files Section (Task 4.2 & 4.6) */}
          <div className="lg:col-span-5 space-y-6">
            <FileUploader
              files={uploadedFiles}
              matches={matches}
              requirements={requirements}
              lang={lang}
              onFilesAdded={handleFilesAdded}
              onRemoveFile={handleRemoveFile}
              errorMessage={fileErrorMessage}
              onClearError={() => setFileErrorMessage(null)}
            />
          </div>

          {/* Checklist & Matching Section (Task 4.3, 4.4, 4.5) */}
          <div className="lg:col-span-7 space-y-6">
            <RequirementList
              tender={tender}
              requirements={requirements}
              uploadedFiles={uploadedFiles}
              matches={matches}
              lang={lang}
              onMatchChange={handleMatchChange}
              onExpiryDateChange={handleExpiryDateChange}
              onAutoMatch={handleAutoMatch}
            />
          </div>
        </div>

        {/* Action Panel: Verification, Validation status, Blocking list, PDF Generator (Task 4.7 & 4.8) */}
        <ActionPanel
          tender={tender}
          requirements={requirements}
          matches={matches}
          uploadedFiles={uploadedFiles}
          lang={lang}
          onGeneratePackage={handleGeneratePackage}
          onDownloadPackage={handleDownloadPackage}
          onExportCsv={handleExportCsv}
          onPreviewPackage={() => setIsPreviewOpen(true)}
          isGenerating={isGenerating}
          generatedPdfBlobUrl={generatedPdfUrl}
          options={options}
          onOptionsChange={setOptions}
          generationProgressText={generationProgressText}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p>AI DevFest &bull; Tender Document Package Builder &bull; Built strictly per official rules</p>
      </footer>

      {/* Live PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pdfUrl={generatedPdfUrl}
        filename={`${tender.tender_id}_Package.pdf`}
      />
    </div>
  );
}
