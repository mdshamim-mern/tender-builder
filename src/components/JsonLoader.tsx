import React, { useRef } from 'react';
import { TenderInfo, Language } from '../types';
import { translations } from '../locales/translations';
import { FileJson, Calendar, Building2, User, Hash, FileCheck, UploadCloud, Sparkles } from 'lucide-react';

interface JsonLoaderProps {
  tender: TenderInfo | null;
  lang: Language;
  onLoadJson: (content: string) => void;
  onLoadDemoSamplePack: () => void;
  isLoadingDemo: boolean;
}

export const JsonLoader: React.FC<JsonLoaderProps> = ({
  tender,
  lang,
  onLoadJson,
  onLoadDemoSamplePack,
  isLoadingDemo,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      onLoadJson(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      onLoadJson(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileJson className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              {t.tenderDetails}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {tender ? `${t.tenderId}: ${tender.tender_id}` : t.uploadReqJson}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLoadDemoSamplePack}
            disabled={isLoadingDemo}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isLoadingDemo ? 'Loading...' : t.loadSamplePack}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.uploadReqJson}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Tender Info Grid or Empty Upload Prompt */}
      {tender ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-blue-500" /> {t.tenderId}
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1 truncate" title={tender.tender_id}>
              {tender.tender_id}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-500" /> {t.title}
            </span>
            <p className="text-sm font-semibold text-slate-900 mt-1 truncate" title={tender.title}>
              {tender.title}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-500" /> {t.procuringEntity}
            </span>
            <p className="text-sm font-medium text-slate-800 mt-1 truncate" title={tender.procuring_entity}>
              {tender.procuring_entity}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" /> {t.bidder}
            </span>
            <p className="text-sm font-medium text-slate-800 mt-1 truncate" title={tender.bidder}>
              {tender.bidder}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 sm:col-span-2 lg:col-span-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-semibold text-rose-900">
                {t.submissionDeadline}:
              </span>
              <span className="text-xs font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                {tender.submission_deadline}
              </span>
            </div>
            <span className="text-[11px] text-rose-600/80 hidden sm:inline">
              (Documents with expiry dates must be valid on or after this date)
            </span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl p-8 text-center cursor-pointer transition-colors"
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100/60 flex items-center justify-center text-blue-600 mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {t.dragReqJson}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Accepts official <span className="font-mono font-medium text-slate-600">requirements.json</span> file
          </p>
        </div>
      )}
    </div>
  );
};
