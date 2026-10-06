import { Requirement, RequirementMatch, DocumentStatus, UploadedFile } from '../types';

/**
 * Calculates the exact status for a given requirement according to Section 5.
 */
export function calculateDocumentStatus(
  req: Requirement,
  match: RequirementMatch | undefined,
  submissionDeadline: string,
  isDuplicateBlocked: boolean = false
): DocumentStatus {
  const hasMatchedFile = Boolean(match && match.fileId);

  // If no file is matched
  if (!hasMatchedFile) {
    if (req.mandatory) {
      return 'Missing';
    } else {
      return 'Not provided';
    }
  }

  // If a file is matched
  if (req.has_expiry) {
    if (!match?.expiryDate || match.expiryDate.trim() === '') {
      return 'Expiry date needed';
    }

    // Expiry date comparison (YYYY-MM-DD):
    // "If a document expires on the same day as the submission deadline, it is still OK."
    // "Expired: The expiry date is before the submission deadline."
    if (match.expiryDate < submissionDeadline) {
      return 'Expired';
    }
  }

  // If matched file has a duplicate block or corruption
  if (isDuplicateBlocked) {
    // Duplicate violation blocks package
    return 'Missing'; // treated as blocking
  }

  return 'OK';
}

/**
 * Checks if a status blocks package generation
 */
export function isBlockingStatus(status: DocumentStatus): boolean {
  return status === 'Missing' || status === 'Expiry date needed' || status === 'Expired';
}

/**
 * Identifies duplicate files by SHA-256 hash
 */
export function markDuplicateFiles(files: UploadedFile[]): UploadedFile[] {
  const hashCount = new Map<string, string[]>();

  for (const f of files) {
    if (!f.hash) continue;
    const existing = hashCount.get(f.hash) || [];
    existing.push(f.name);
    hashCount.set(f.hash, existing);
  }

  return files.map(file => {
    const matchingNames = hashCount.get(file.hash) || [];
    const isDuplicate = matchingNames.length > 1;
    const otherNames = matchingNames.filter(n => n !== file.name);

    return {
      ...file,
      isDuplicate,
      duplicateOfNames: isDuplicate ? (otherNames.length > 0 ? otherNames : [file.name]) : undefined,
    };
  });
}

/**
 * Verifies if any duplicate files are matched to different documents
 * Task 4.6: "Do not allow them to be matched to different documents"
 */
export function findDuplicateMatchConflicts(
  matches: RequirementMatch[],
  uploadedFiles: UploadedFile[]
): { hasConflict: boolean; conflictingFiles: string[] } {
  const matchedFileIds = matches.filter(m => m.fileId).map(m => m.fileId as string);
  const matchedFiles = uploadedFiles.filter(f => matchedFileIds.includes(f.id));

  const seenHashes = new Map<string, string>();
  const conflicts: string[] = [];

  for (const file of matchedFiles) {
    if (!file.hash) continue;
    if (seenHashes.has(file.hash)) {
      const original = seenHashes.get(file.hash)!;
      conflicts.push(`"${file.name}" is identical in content to "${original}"`);
    } else {
      seenHashes.set(file.hash, file.name);
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflictingFiles: conflicts,
  };
}

/**
 * Returns summary of all blocking issues to display to the user
 */
export function getBlockingIssuesSummary(
  requirements: Requirement[],
  matches: RequirementMatch[],
  uploadedFiles: UploadedFile[],
  deadline: string,
  lang: 'en' | 'bn' = 'en'
): string[] {
  const issues: string[] = [];
  const matchMap = new Map<string, RequirementMatch>();
  matches.forEach(m => matchMap.set(m.requirementId, m));

  const fileMap = new Map<string, UploadedFile>();
  uploadedFiles.forEach(f => fileMap.set(f.id, f));

  for (const req of requirements) {
    const match = matchMap.get(req.id);
    const status = calculateDocumentStatus(req, match, deadline);
    const docTitle = lang === 'bn' ? req.title_bn : req.title_en;

    if (status === 'Missing') {
      issues.push(
        lang === 'bn'
          ? `[${req.id}] ${docTitle}: বাধ্যতামূলক নথি, কোনো ফাইল সংযুক্ত করা হয়নি`
          : `[${req.id}] ${docTitle}: Required document has no matched file`
      );
    } else if (status === 'Expiry date needed') {
      issues.push(
        lang === 'bn'
          ? `[${req.id}] ${docTitle}: মেয়াদের তারিখ প্রদান করা আবশ্যক`
          : `[${req.id}] ${docTitle}: Expiry date must be entered`
      );
    } else if (status === 'Expired') {
      issues.push(
        lang === 'bn'
          ? `[${req.id}] ${docTitle}: মেয়াদোত্তীর্ণ (${match?.expiryDate} < ${deadline})`
          : `[${req.id}] ${docTitle}: Expired on ${match?.expiryDate} (Submission deadline: ${deadline})`
      );
    }

    if (match?.fileId) {
      const file = fileMap.get(match.fileId);
      if (file?.isCorrupt) {
        issues.push(
          lang === 'bn'
            ? `[${req.id}] সংযুক্ত ফাইল "${file.name}" নষ্ট বা পাসওয়ার্ড সুরক্ষিত`
            : `[${req.id}] Matched file "${file.name}" is corrupt or password protected`
        );
      }
    }
  }

  // Check duplicate match conflicts
  const duplicateConflicts = findDuplicateMatchConflicts(matches, uploadedFiles);
  if (duplicateConflicts.hasConflict) {
    duplicateConflicts.conflictingFiles.forEach(c => {
      issues.push(
        lang === 'bn'
          ? `ডুপ্লিকেট ফাইল ত্রুটি: ${c} (একই ফাইল ভিন্ন নথিতে ব্যবহার নিষিদ্ধ)`
          : `Duplicate content error: ${c} (Duplicate files cannot be matched to documents)`
      );
    });
  }

  return issues;
}
