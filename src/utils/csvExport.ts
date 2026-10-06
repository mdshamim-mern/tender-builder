import { Requirement, RequirementMatch, UploadedFile, TenderInfo } from '../types';
import { calculateDocumentStatus } from './validationLogic';

export function exportChecklistToCsv(
  tender: TenderInfo,
  requirements: Requirement[],
  matches: RequirementMatch[],
  uploadedFiles: UploadedFile[]
): void {
  const fileMap = new Map<string, UploadedFile>();
  uploadedFiles.forEach(f => fileMap.set(f.id, f));

  const matchMap = new Map<string, RequirementMatch>();
  matches.forEach(m => matchMap.set(m.requirementId, m));

  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);

  const headers = [
    'Order',
    'Requirement ID',
    'Document Title (English)',
    'Document Title (Bangla)',
    'Mandatory',
    'Has Expiry',
    'Matched File Name',
    'Page Count',
    'Expiry Date',
    'Submission Deadline',
    'Document Status'
  ];

  const rows = sortedReqs.map(req => {
    const match = matchMap.get(req.id);
    const file = match?.fileId ? fileMap.get(match.fileId) : undefined;
    const status = calculateDocumentStatus(req, match, tender.submission_deadline);

    return [
      req.order,
      `"${req.id}"`,
      `"${req.title_en.replace(/"/g, '""')}"`,
      `"${req.title_bn.replace(/"/g, '""')}"`,
      req.mandatory ? 'Yes' : 'No',
      req.has_expiry ? 'Yes' : 'No',
      file ? `"${file.name.replace(/"/g, '""')}"` : 'None',
      file ? file.pageCount : 0,
      match?.expiryDate || 'N/A',
      tender.submission_deadline,
      status
    ].join(',');
  });

  const metadata = [
    `"Tender ID",${tender.tender_id}`,
    `"Tender Title","${tender.title.replace(/"/g, '""')}"`,
    `"Procuring Entity","${tender.procuring_entity.replace(/"/g, '""')}"`,
    `"Bidder","${tender.bidder.replace(/"/g, '""')}"`,
    `"Submission Deadline",${tender.submission_deadline}`,
    `"Export Date",${new Date().toISOString().split('T')[0]}`,
    ''
  ].join('\n');

  const csvContent = '\uFEFF' + metadata + headers.join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${tender.tender_id}_Checklist.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
