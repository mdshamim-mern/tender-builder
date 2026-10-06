import React, { useRef, useState } from 'react';
import { UploadedFile, Language, RequirementMatch, Requirement } from '../types';
import { translations } from '../locales/translations';
import { formatFileSize } from '../utils/fileInspector';
import { 
  FileUp, 
  Trash2, 
  FileText, 
  Copy, 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  Files
} from 'lucide-react';

interface FileUploaderProps {
  files: UploadedFile[];
  matches: RequirementMatch[];
  requirements: Requirement[];
  lang: Language;
  onFilesAdded: (files: FileList | File[]) => void;
  onRemoveFile: (fileId: string) => void;
  errorMessage: string | null;
  onClearError: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  matches,
  requirements,
  lang,
  onFilesAdded,
  onRemoveFile,
  errorMessage,
  onClearError,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(e.target.files);
      e.target.value = '';
    }
  };

  // Helper to find which requirement a file is currently matched to
  const getMatchedReqTitle = (fileId: string) => {
    const match = matches.find(m => m.fileId === fileId);
    if (!match) return null;
    const req = requirements.find(r => r.id === match.requirementId);
    if (!req) return null;
    return lang === 'bn' ? req.title_bn : req.title_en;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Files className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              {t.uploadedFiles} ({files.length})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.uploadedFilesDesc}
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition active:scale-95"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{t.uploadPdfFiles}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Non-PDF / File Rejection Error Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs animate-shake">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={onClearError}
            className="text-red-500 hover:text-red-800 font-bold ml-2 px-1.5 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
            : 'border-slate-200 hover:border-indigo-400 bg-slate-50/40 hover:bg-indigo-50/20'
        }`}
      >
        <div className="mx-auto w-10 h-10 rounded-full bg-indigo-100/60 flex items-center justify-center text-indigo-600 mb-2">
          <FileUp className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-700">
          {t.dragPdfFiles}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Up to 30 files &bull; Total max 50 MB &bull; Instant SHA-256 duplicate detection
        </p>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 ? (
        <div className="max-h-64 overflow-y-auto pr-1 space-y-2 divide-y divide-slate-100">
          {files.map((file) => {
            const matchedReq = getMatchedReqTitle(file.id);

            return (
              <div
                key={file.id}
                className={`pt-2 first:pt-0 flex items-center justify-between gap-3 p-2.5 rounded-xl transition ${
                  file.isDuplicate
                    ? 'bg-amber-50/60 border border-amber-200/80'
                    : file.isCorrupt
                    ? 'bg-red-50/60 border border-red-200'
                    : 'bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100'
                }`}
              >
                {/* File info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      file.isCorrupt
                        ? 'bg-red-100 text-red-600'
                        : file.isDuplicate
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className="text-xs font-semibold text-slate-900 truncate max-w-xs"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      
                      {/* Pages badge */}
                      {!file.isCorrupt && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200/70 text-slate-700">
                          {file.pageCount} {t.pages}
                        </span>
                      )}

                      {/* Duplicate badge */}
                      {file.isDuplicate && (
                        <span 
                          title={`${t.duplicateDesc} Identical to: ${file.duplicateOfNames?.join(', ')}`}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-800 border border-amber-300"
                        >
                          <Copy className="w-3 h-3 text-amber-600" />
                          {t.duplicateWarning}
                        </span>
                      )}

                      {/* Corrupt badge */}
                      {file.isCorrupt && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          {file.errorMessage || t.corruptPdfError}
                        </span>
                      )}
                    </div>

                    {/* Metadata & Match state */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatFileSize(file.size)}</span>
                      <span>&bull;</span>
                      {matchedReq ? (
                        <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Matched to: {matchedReq}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unmatched</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => onRemoveFile(file.id)}
                  title={t.remove}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-xs text-slate-400 italic">
          No PDF documents uploaded yet.
        </div>
      )}
    </div>
  );
};
