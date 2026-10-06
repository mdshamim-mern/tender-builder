import { Requirement, UploadedFile, RequirementMatch } from '../types';

/**
 * Normalizes text for keyword matching
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Suggests matches between requirements and uploaded files
 */
export function autoMatchFiles(
  requirements: Requirement[],
  uploadedFiles: UploadedFile[],
  currentMatches: RequirementMatch[]
): { matches: RequirementMatch[]; matchedCount: number } {
  const resultMatches = [...currentMatches];
  let matchedCount = 0;

  // Track already matched file IDs
  const usedFileIds = new Set(
    currentMatches.filter(m => m.fileId).map(m => m.fileId as string)
  );

  // Filter out corrupted files and duplicates from auto-assignment
  const availableFiles = uploadedFiles.filter(
    f => !usedFileIds.has(f.id) && !f.isCorrupt
  );

  for (const req of requirements) {
    const existingIndex = resultMatches.findIndex(m => m.requirementId === req.id);
    const existingMatch = resultMatches[existingIndex];

    // Skip if requirement already has a file matched
    if (existingMatch && existingMatch.fileId) continue;

    const reqTitleTokens = normalize(req.title_en).split(' ');
    const reqId = normalize(req.id);

    let bestScore = 0;
    let bestFile: UploadedFile | null = null;

    for (const file of availableFiles) {
      if (usedFileIds.has(file.id)) continue;

      const fileNameNorm = normalize(file.name);
      let score = 0;

      // Exact ID in filename (e.g., "R01_Trade_License.pdf")
      if (fileNameNorm.includes(reqId)) {
        score += 10;
      }

      // Check keyword tokens
      for (const token of reqTitleTokens) {
        if (token.length > 2 && fileNameNorm.includes(token)) {
          score += 3;
        }
      }

      // Special domain keywords
      if (req.title_en.toLowerCase().includes('trade') && fileNameNorm.includes('trade')) score += 5;
      if (req.title_en.toLowerCase().includes('license') && fileNameNorm.includes('license')) score += 5;
      if (req.title_en.toLowerCase().includes('tin') && fileNameNorm.includes('tin')) score += 8;
      if (req.title_en.toLowerCase().includes('vat') && fileNameNorm.includes('vat')) score += 8;
      if (req.title_en.toLowerCase().includes('solvency') && fileNameNorm.includes('solvency')) score += 8;
      if (req.title_en.toLowerCase().includes('experience') && fileNameNorm.includes('experience')) score += 6;
      if (req.title_en.toLowerCase().includes('technical') && fileNameNorm.includes('tech')) score += 6;
      if (req.title_en.toLowerCase().includes('financial') && fileNameNorm.includes('fin')) score += 6;

      // Deduct score if filename explicitly has "expired" and requirement has expiry
      if (fileNameNorm.includes('expired')) {
        score -= 2;
      }

      if (score > bestScore && score >= 5) {
        bestScore = score;
        bestFile = file;
      }
    }

    if (bestFile) {
      usedFileIds.add(bestFile.id);

      // Check if filename contains a date like 2027-06-30
      let detectedExpiryDate: string | undefined = existingMatch?.expiryDate;
      const dateMatch = bestFile.name.match(/\b(202\d[-/.]\d{2}[-/.]\d{2})\b/);
      if (dateMatch && !detectedExpiryDate) {
        detectedExpiryDate = dateMatch[1].replace(/[/.]/g, '-');
      }

      const newMatch: RequirementMatch = {
        requirementId: req.id,
        fileId: bestFile.id,
        expiryDate: detectedExpiryDate,
      };

      if (existingIndex >= 0) {
        resultMatches[existingIndex] = newMatch;
      } else {
        resultMatches.push(newMatch);
      }

      matchedCount++;
    }
  }

  return { matches: resultMatches, matchedCount };
}
