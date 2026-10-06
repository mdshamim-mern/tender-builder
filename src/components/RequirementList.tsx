import React from 'react';
import { 
  Requirement, 
  UploadedFile, 
  RequirementMatch, 
  Language, 
  TenderInfo 
} from '../types';
import { translations } from '../locales/translations';
import { calculateDocumentStatus } from '../utils/validationLogic';
import { StatusBadge } from './StatusBadge';
import { 
  FileText, 
  Wand2, 
  Calendar, 
  Check, 
  X, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface RequirementListProps {
  tender: TenderInfo;
  requirements: Requirement[];
  uploadedFiles: UploadedFile[];
  matches: RequirementMatch[];
  lang: Language;
  onMatchChange: (requirementId: string, fileId: string | null) => void;
  onExpiryDateChange: (requirementId: string, expiryDate: string) => void;
  onAutoMatch: () => void;
}

export const RequirementList: React.FC<RequirementListProps> = ({
  tender,
  requirements,
  uploadedFiles,
  matches,
  lang,
  onMatchChange,
  onExpiryDateChange,
  onAutoMatch,
}) => {
  const t = translations[lang];

  // Map of requirementId -> RequirementMatch
  const matchMap = new Map<string, RequirementMatch>();
  matches.forEach(m => matchMap.set(m.requirementId, m));

  // Map of fileId -> UploadedFile
  const fileMap = new Map<string, UploadedFile>();
  uploadedFiles.forEach(f => fileMap.set(f.id, f));

  // Sorted strictly by order (Task 4.1)
  const sortedRequirements = [...requirements].sort((a, b) => a.order - b.order);

  // Set of already matched file IDs (to prevent matching one file to multiple documents)
  // "One file goes to at most one document" (Task 4.3)
  const assignedFileIds = new Set(
    matches.filter(m => m.fileId).map(m => m.fileId as string)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
      {/* Header and Auto-Match Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              {t.docRequirements} ({requirements.length})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.docRequirementsDesc}
          </p>
        </div>

        <button
          onClick={onAutoMatch}
          disabled={uploadedFiles.length === 0}
          title={t.autoMatchBtn}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>{t.autoMatchBtn}</span>
        </button>
      </div>

      {/* Requirements Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-y border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-14 font-semibold text-center">{t.order}</th>
              <th className="py-3 px-3 font-semibold">{t.docName}</th>
              <th className="py-3 px-3 w-28 font-semibold">{t.type}</th>
              <th className="py-3 px-3 w-64 font-semibold">{t.matchedFile}</th>
              <th className="py-3 px-3 w-44 font-semibold">{t.expiryDate}</th>
              <th className="py-3 px-3 w-40 font-semibold text-center">{t.status}</th>
              <th className="py-3 px-3 w-16 font-semibold text-center">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRequirements.map((req) => {
              const currentMatch = matchMap.get(req.id);
              const matchedFile = currentMatch?.fileId ? fileMap.get(currentMatch.fileId) : undefined;
              
              // Calculate status in real time
              const status = calculateDocumentStatus(
                req,
                currentMatch,
                tender.submission_deadline
              );

              // Title in active language (Task 4.9)
              const title = lang === 'bn' ? req.title_bn : req.title_en;
              const altTitle = lang === 'bn' ? req.title_en : req.title_bn;

              // Filter available files for this requirement:
              // Can select file if: it's not assigned to ANY OTHER document, or it is currently assigned to this requirement
              const selectableFiles = uploadedFiles.filter(
                f => !assignedFileIds.has(f.id) || f.id === currentMatch?.fileId
              );

              return (
                <tr 
                  key={req.id} 
                  className={`hover:bg-slate-50/60 transition ${
                    status === 'OK' 
                      ? 'bg-white' 
                      : status === 'Missing' 
                      ? 'bg-red-50/20' 
                      : status === 'Expired'
                      ? 'bg-rose-50/20'
                      : 'bg-white'
                  }`}
                >
                  {/* Order (#) */}
                  <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                    <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 inline-flex items-center justify-center text-xs">
                      {req.order}
                    </span>
                  </td>

                  {/* Document Name */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {req.id}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">
                          {title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {altTitle}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Mandatory / Optional Badge */}
                  <td className="py-3.5 px-3">
                    {req.mandatory ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        <Check className="w-3 h-3 text-blue-600" />
                        {t.mandatory}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {t.optional}
                      </span>
                    )}
                  </td>

                  {/* Matched File Dropdown (Task 4.3) */}
                  <td className="py-3.5 px-3">
                    <div className="relative">
                      <select
                        value={currentMatch?.fileId || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : e.target.value;
                          onMatchChange(req.id, val);
                        }}
                        className={`w-full text-xs rounded-xl py-1.5 px-2.5 pr-8 border transition focus:outline-hidden focus:ring-2 truncate ${
                          matchedFile
                            ? 'bg-white font-medium text-slate-800 border-slate-300 focus:ring-blue-500/20'
                            : 'bg-slate-50 text-slate-400 border-slate-200 focus:ring-blue-500/20'
                        }`}
                      >
                        <option value="">{t.selectFile}</option>
                        {selectableFiles.map((f) => (
                          <option 
                            key={f.id} 
                            value={f.id}
                            disabled={f.isCorrupt}
                          >
                            {f.name} ({f.pageCount} {t.pages}){f.isDuplicate ? ' [DUPLICATE]' : ''}{f.isCorrupt ? ' [CORRUPT]' : ''}
                          </option>
                        ))}
                      </select>

                      {/* Duplicate warning on matched file */}
                      {matchedFile?.isDuplicate && (
                        <p className="text-[10px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {t.duplicateDesc}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Expiry Date (Task 4.4) */}
                  <td className="py-3.5 px-3">
                    {req.has_expiry ? (
                      matchedFile ? (
                        <div className="space-y-1">
                          <div className="relative">
                            <input
                              type="date"
                              value={currentMatch?.expiryDate || ''}
                              onChange={(e) => onExpiryDateChange(req.id, e.target.value)}
                              className={`w-full text-xs py-1 px-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                                !currentMatch?.expiryDate
                                  ? 'border-amber-300 bg-amber-50/50 text-amber-900 focus:ring-amber-500/20'
                                  : currentMatch.expiryDate < tender.submission_deadline
                                  ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-rose-500/20'
                                  : 'border-emerald-300 bg-emerald-50/40 text-emerald-900 focus:ring-emerald-500/20'
                              }`}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>Deadline: {tender.submission_deadline}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          (Match file first)
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        {t.noExpiry}
                      </span>
                    )}
                  </td>

                  {/* Status Badge (Task 4.5 & Section 5) */}
                  <td className="py-3.5 px-3 text-center">
                    <StatusBadge status={status} lang={lang} />
                  </td>

                  {/* Actions (Unmatch / Clear) */}
                  <td className="py-3.5 px-3 text-center">
                    {matchedFile ? (
                      <button
                        onClick={() => onMatchChange(req.id, null)}
                        title={t.unmatch}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-slate-300">&bull;</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
