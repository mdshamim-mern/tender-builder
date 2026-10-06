import React from 'react';
import { DocumentStatus, Language } from '../types';
import { translations } from '../locales/translations';
import { CheckCircle2, AlertTriangle, Clock, XCircle, MinusCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: DocumentStatus;
  lang: Language;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, lang }) => {
  const t = translations[lang];

  switch (status) {
    case 'OK':
      return (
        <span 
          title={t.statusOkDesc}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{t.statusOk}</span>
        </span>
      );

    case 'Missing':
      return (
        <span 
          title={t.statusMissingDesc}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 shadow-xs animate-pulse"
        >
          <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>{t.statusMissing}</span>
        </span>
      );

    case 'Expiry date needed':
      return (
        <span 
          title={t.statusExpiryNeededDesc}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-xs"
        >
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{t.statusExpiryNeeded}</span>
        </span>
      );

    case 'Expired':
      return (
        <span 
          title={t.statusExpiredDesc}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300 shadow-xs"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{t.statusExpired}</span>
        </span>
      );

    case 'Not provided':
      return (
        <span 
          title={t.statusNotProvidedDesc}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
        >
          <MinusCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{t.statusNotProvided}</span>
        </span>
      );

    default:
      return null;
  }
};
