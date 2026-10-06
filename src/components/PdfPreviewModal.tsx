import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  filename: string;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  filename,
}) => {
  if (!isOpen || !pdfUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">
              PDF Package Preview:
            </span>
            <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {filename}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              download={filename}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
              title="Open in new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF viewer iframe */}
        <div className="flex-1 bg-slate-100 p-2">
          <iframe
            src={pdfUrl}
            title="PDF Package Preview"
            className="w-full h-full rounded-xl border border-slate-200 shadow-inner bg-white"
          />
        </div>
      </div>
    </div>
  );
};
