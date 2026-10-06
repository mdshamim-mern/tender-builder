import React from 'react';
import { Language } from '../types';
import { translations } from '../locales/translations';
import { Languages, Save, FolderOpen, RotateCcw, FileCheck2, Sparkles } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  onSaveProject,
  onLoadProject,
  onReset,
}) => {
  const t = translations[lang];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <FileCheck2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  {t.appTitle}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-3 h-3" /> AI DevFest
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Save Project (Bonus) */}
            <button
              onClick={onSaveProject}
              title={t.saveProject}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Save className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">{t.saveProject}</span>
            </button>

            {/* Load Project (Bonus) */}
            <button
              onClick={onLoadProject}
              title={t.loadProject}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">{t.loadProject}</span>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              title={t.clearAll}
              className="inline-flex items-center p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline ml-1">{t.clearAll}</span>
            </button>

            <div className="h-5 w-px bg-slate-700 mx-1" />

            {/* Language Switcher Button (Task 4.9) */}
            <button
              onClick={onToggleLang}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm ring-1 ring-white/10 transition active:scale-95"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
