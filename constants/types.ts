// Document Types
export interface Document {
  id: string;
  name: string;
  uri: string;
  categoryId: string;
  folderId?: string;
  preview?: string;
  thumbnail?: string;
  type: string;
  size: number;
  isVerified: boolean;
  isImportant?: boolean;
  metadata?: DocumentMetadata;
  createdAt: string;
  verifiedAt?: string;
}

export interface DocumentMetadata {
  documentNumber?: string;
  name?: string;
  dob?: string;
  address?: string;
  issueDate?: string;
  expiryDate?: string;
  otherFields?: Record<string, string>;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  documentCount?: number;
}

// Folder Types
export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  documents: string[];
}

// OCR Result Types
export interface OcrResult {
  success: boolean;
  error?: string;
  confidence?: number;
  data?: {
    type: string;
    documentNumber: string;
    name: string;
    dob: string;
    address: string;
    issueDate: string;
    expiryDate: string;
    confident: boolean;
    scanResult?: {
      uri: string;
    };
  };
}

// Document Template Types
export interface DocumentTemplate {
  id: string;
  name: string;
  icon: string;
  color: string;
  fields: TemplateField[];
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'date' | 'number' | 'address';
  required: boolean;
  validation?: RegExp | string;
  errorMessage?: string;
}

// Document Analyzer Types
export interface AnalysisResult {
  documentId: string;
  insights: string[];
  securityScore: number;
  validityScore: number;
  expirationAlert?: {
    isExpiring: boolean;
    daysLeft?: number;
    message: string;
  };
  recommendations: string[];
  createdAt: string;
}

// Document Scan Types
export interface ScanResult {
  uri: string;
  width: number;
  height: number;
  corners?: {
    topLeft: Point;
    topRight: Point;
    bottomRight: Point;
    bottomLeft: Point;
  };
  originalUri?: string;
}

export interface Point {
  x: number;
  y: number;
}

// UI State Types
export interface DocumentsState {
  documents: Document[];
  categories: Category[];
  folders: Folder[];
  templates: DocumentTemplate[];
  selectedDocument: Document | null;
  selectedCategory: Category | null;
  selectedFolder: Folder | null;
  isLoading: boolean;
  error: string | null;
}

// Modal Types
export interface ModalState {
  isVisible: boolean;
  type: 'upload' | 'scan' | 'template' | 'verify' | 'view' | 'organize' | 'analyze' | 'share';
  data?: any;
} 