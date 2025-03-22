import { ATSScoreResult } from "@/services/ats-scorer.service";

// import { BulletPoint } from "@/components/resume-editor/ResumeContext";

// Define BulletPoint interface here instead of importing it
export interface BulletPoint {
  id: string;
  text: string;
}

// Parsed resume data structure
export interface ParsedResume {
  personalInfo: ParsedPersonalInfo;
  experience: ParsedExperience[];
  education: ParsedEducation[];
  skills: ParsedSkill[];
  projects: ParsedProject[];
  certifications: ParsedCertification[];
}

export interface ParsedPersonalInfo {
  name: string;
  email: string;
  phone?: string;
  title?: string;
  location?: string;
  bio?: string;
  links?: {
    linkedin?: string;
    portfolio?: string;
    additionalLinks?: { name: string; url: string }[];
  };
  confidence: number;
  selected: boolean;
}

export interface ParsedExperience {
  id: string;
  title: string;
  company: string;
  period: string;
  description?: string;
  bulletPoints?: BulletPoint[];
  confidence: number;
  selected: boolean;
}

export interface ParsedEducation {
  id: string;
  degree: string;
  institution: string;
  year: string;
  description?: string;
  field?: string;
  gpa?: string;
  bulletPoints?: BulletPoint[];
  confidence: number;
  selected: boolean;
}

export interface ParsedSkill {
  id: string;
  name: string;
  confidence: number;
  selected: boolean;
}

export interface ParsedProject {
  id: string;
  name: string;
  description?: string;
  link?: string;
  bulletPoints?: BulletPoint[];
  confidence: number;
  selected: boolean;
}

export interface ParsedCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expirationDate?: string;
  credentialId?: string;
  bulletPoints?: BulletPoint[];
  confidence: number;
  selected: boolean;
}

// Resume parsing status
export enum ParsingStatus {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  PARSING = 'parsing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// Resume parser context
export interface ResumeParserContextType {
  parsedResume: ParsedResume | null;
  parsingStatus: ParsingStatus;
  atsScore: ATSScoreResult | null;
  parseResume: (file: File) => Promise<void>;
  updateParsedItem: <T extends keyof ParsedResume>(
    section: T,
    index: number,
    updates: Partial<ParsedResume[T] extends Array<infer U> ? U : never>
  ) => void;
  updateParsedPersonalInfo: (updates: Partial<ParsedPersonalInfo>) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
  saveSelectedItems: () => Promise<boolean>;
} 