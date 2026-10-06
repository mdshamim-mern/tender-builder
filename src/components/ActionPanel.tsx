import React, { useRef, useState } from 'react';
import { 
  TenderInfo, 
  Requirement, 
  RequirementMatch, 
  UploadedFile, 
  Language, 
  PackageGenerationOptions 
} from '../types';
import { translations } from '../locales/translations';
import { 
  calculateDocumentStatus, 
  isBlockingStatus, 
  getBlockingIssuesSummary 
} from '../utils/validationLogic';
import { 
  Download, 
  FileSpreadsheet, 
  AlertOctagon, 
  CheckCircle2, 
  Eye, 
  Settings2, 
  Stamp, 
  ListTree, 
  Loader2, 
  Info,
  Sparkles
} from 'lucide-react';

interface ActionPanelProps {
  tender: TenderInfo;
  requirements: Requirement[];
  matches: RequirementMatch[];
  uploadedFiles: UploadedFile[];
  lang: Language;
  onGeneratePackage: () => void;
  onDownloadPackage: () => void;
  onExportCsv: () => void;
  onPreviewPackage: () => void;
  isGenerating: boolean;
  generatedPdfBlobUrl: string | null;
  options: PackageGenerationOptions;
  onOptionsChange: (newOptions: PackageGenerationOptions) => void;
  generationProgressText: string;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  tender,
  requirements,
  matches,
  uploadedFiles,
  lang,
  onGeneratePackage,
  onDownloadPackage,
  onExportCsv,
  onPreviewPackage,
  isGenerating,
  generatedPdfBlobUrl,
  options,
  onOptionsChange,
  generationProgressText,
}) => {
  const t = translations[lang];
  const [showAdvanced, setShowAdvanced] = useState(false);
  const sealInputRef = useRef<HTMLInputElement>(null);

  // Compute status counts
  const matchMap = new Map<string, RequirementMatch>();
  matches.forEach(m => matchMap.set(m.requirementId, m));

  let okCount = 0;
  let missingCount = 0;
  let expiryNeededCount = 0;
  let expiredCount = 0;
  let notProvidedCount = 0;

  requirements.forEach(req => {
    const match = matchMap.get(req.id);
    const status = calculateDocumentStatus(req, match, tender.submission_deadline);
    if (status === 'OK') okCount++;
    else if (status === 'Missing') missingCount++;
    else if (status === 'Expiry date needed') expiryNeededCount++;
    else if (status === 'Expired') expiredCount++;
    else if (status === 'Not provided') notProvidedCount++;
  });

  // Calculate blocking issues
  const blockingIssues = getBlockingIssuesSummary(
    requirements,
    matches,
    uploadedFiles,
    tender.submission_deadline,
    lang
  );

  const hasBlockingIssues = blockingIssues.length > 0;
  const targetFilename = `${tender.tender_id}_Package.pdf`;

  // Seal upload handler
  const handleSealUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      onOptionsChange({
        ...options,
        sealImageBuffer: arrayBuffer,
      });
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-5">
      {/* Status Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-center">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            {t.statusOk}
          </span>
          <span className="text-lg font-extrabold text-emerald-800">
            {okCount}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200/60 text-center">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
            {t.statusMissing}
          </span>
          <span className="text-lg font-extrabold text-red-800">
            {missingCount}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-center">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            {t.statusExpiryNeeded}
          </span>
          <span className="text-lg font-extrabold text-amber-800">
            {expiryNeededCount}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/60 text-center">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
            {t.statusExpired}
          </span>
          <span className="text-lg font-extrabold text-rose-800">
            {expiredCount}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
            {t.statusNotProvided}
          </span>
          <span className="text-lg font-extrabold text-slate-700">
            {notProvidedCount}
          </span>
        </div>
      </div>

      {/* Blocking Issues or Success Notification Box */}
      {hasBlockingIssues ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{t.blockingProblemsTitle} ({blockingIssues.length})</span>
          </div>
          <ul className="text-xs space-y-1 list-disc list-inside text-rose-700/90 pl-1 max-h-36 overflow-y-auto">
            {blockingIssues.map((issue, idx) => (
              <li key={idx} className="leading-snug">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-900">
              {t.readyToGenerateTitle}
            </p>
            <p className="text-[11px] text-emerald-700">
              {t.readyToGenerateDesc}
            </p>
          </div>
        </div>
      )}

      {/* Advanced / Bonus Settings Toggle */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition"
        >
          <Settings2 className="w-3.5 h-3.5 text-blue-600" />
          <span>{t.bonusOptions}</span>
          <span className="text-[10px] text-slate-400">
            ({showAdvanced ? 'Hide' : 'Show'})
          </span>
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3.5 animate-fadeIn">
            {/* Index Page (Bonus 7.1) */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ListTree className="w-3.5 h-3.5 text-blue-500" /> {t.includeIndexPage}
                </span>
                <p className="text-[11px] text-slate-500">
                  {t.includeIndexPageDesc}
                </p>
              </div>
              <input
                type="checkbox"
                checked={options.includeIndexPage}
                onChange={(e) => onOptionsChange({ ...options, includeIndexPage: e.target.checked })}
                className="w-4 h-4 rounded-sm text-blue-600 border-slate-300 focus:ring-blue-500"
              />
            </div>

            <div className="h-px bg-slate-200" />

            {/* Official Seal / Signature (Bonus 7.2) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Stamp className="w-3.5 h-3.5 text-indigo-500" /> {t.officialSeal}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {t.officialSealDesc}
                  </p>
                </div>
                <button
                  onClick={() => sealInputRef.current?.click()}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs"
                >
                  {options.sealImageBuffer ? 'Change Seal PNG' : t.uploadSealPng}
                </button>
                <input
                  ref={sealInputRef}
                  type="file"
                  accept="image/png"
                  onChange={handleSealUpload}
                  className="hidden"
                />
              </div>

              {options.sealImageBuffer && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] text-slate-600 font-medium">{t.sealPlacement}:</span>
                  <select
                    value={options.sealPlacement}
                    onChange={(e: any) => onOptionsChange({ ...options, sealPlacement: e.target.value })}
                    className="text-[11px] py-1 px-2 rounded-lg bg-white border border-slate-300"
                  >
                    <option value="cover">{t.sealPlacementCover}</option>
                    <option value="all">{t.sealPlacementAll}</option>
                    <option value="last_page_each">{t.sealPlacementLast}</option>
                  </select>
                  <button
                    onClick={() => onOptionsChange({ ...options, sealImageBuffer: undefined })}
                    className="text-[10px] text-rose-600 hover:underline"
                  >
                    Remove Seal
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Buttons Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        {/* Generate Package Button (Task 4.7) */}
        <button
          onClick={onGeneratePackage}
          disabled={hasBlockingIssues || isGenerating}
          className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-98 ${
            hasBlockingIssues
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-500/25 ring-1 ring-white/20'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{generationProgressText || t.generatingPackage}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t.generatePackage}</span>
            </>
          )}
        </button>

        {/* Download Button (Task 4.8) */}
        {generatedPdfBlobUrl && (
          <button
            onClick={onDownloadPackage}
            className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-98 animate-bounce-subtle"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadPackage.replace('{filename}', targetFilename)}</span>
          </button>
        )}

        {/* Preview Button */}
        {generatedPdfBlobUrl && (
          <button
            onClick={onPreviewPackage}
            className="w-full sm:w-auto py-3 px-3.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 transition"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>{t.previewPackage}</span>
          </button>
        )}

        {/* Export CSV Button (Bonus 7.3) */}
        <button
          onClick={onExportCsv}
          className="w-full sm:w-auto py-3 px-3.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 transition"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>{t.exportCsv}</span>
        </button>
      </div>

      {/* Footer Info Notice */}
      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span>{t.footerFormatNotice.replace('{tender_id}', tender.tender_id)}</span>
      </div>
    </div>
  );
};
