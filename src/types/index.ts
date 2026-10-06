export interface TenderInfo {
  tender_id: string;
  title: string;
  procuring_entity: string;
  bidder: string;
  submission_deadline: string; // YYYY-MM-DD
}

export interface Requirement {
  id: string;
  order: number;
  title_en: string;
  title_bn: string;
  mandatory: boolean;
  has_expiry: boolean;
}

export interface RequirementsFile {
  tender: TenderInfo;
  requirements: Requirement[];
}

export type DocumentStatus = 
  | 'Missing'
  | 'Expiry date needed'
  | 'Expired'
  | 'Not provided'
  | 'OK';

export interface UploadedFile {
  id: string;
  file?: File;
  name: string;
  size: number;
  pageCount: number;
  hash: string;
  isDuplicate: boolean;
  duplicateOfNames?: string[];
  isCorrupt: boolean;
  errorMessage?: string;
  buffer: ArrayBuffer;
}

export interface RequirementMatch {
  requirementId: string;
  fileId: string | null;
  expiryDate?: string; // YYYY-MM-DD
}

export type Language = 'en' | 'bn';

export interface PackageGenerationOptions {
  includeIndexPage: boolean;
  sealImageBuffer?: ArrayBuffer;
  sealPlacement: 'cover' | 'all' | 'last_page_each';
  sealScale: number;
  bilingualCover: boolean;
}
