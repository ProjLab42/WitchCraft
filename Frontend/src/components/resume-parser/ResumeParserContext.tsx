import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  ParsedResume, 
  ParsedPersonalInfo, 
  ParsingStatus, 
  ResumeParserContextType 
} from '@/types/resume-parser';
import { parseResumeFile, saveParsedResumeToProfile } from '@/services/resume-parser.service';
import { toast } from 'sonner';

// Create the context with a default undefined value
const ResumeParserContext = createContext<ResumeParserContextType | undefined>(undefined);

// Provider props interface
interface ResumeParserProviderProps {
  children: ReactNode;
}

// Provider component
export const ResumeParserProvider: React.FC<ResumeParserProviderProps> = ({ children }) => {
  // State for parsed resume data
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  // State for parsing status
  const [parsingStatus, setParsingStatus] = useState<ParsingStatus>(ParsingStatus.IDLE);

  // Parse a resume file
  const parseResume = async (file: File): Promise<void> => {
    try {
      setParsingStatus(ParsingStatus.UPLOADING);
      
      // Short delay to show uploading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setParsingStatus(ParsingStatus.PARSING);
      
      // Call the resume parser service
      const parsedData = await parseResumeFile(file);
      
      // Update state with parsed data
      setParsedResume(parsedData);
      setParsingStatus(ParsingStatus.COMPLETED);
      
      toast.success('Resume parsed successfully!');
    } catch (error) {
      console.error('Error parsing resume:', error);
      setParsingStatus(ParsingStatus.ERROR);
      toast.error('Failed to parse resume. Please try again.');
    }
  };

  // Update a parsed item in a specific section
  const updateParsedItem = <T extends keyof ParsedResume>(
    section: T,
    index: number,
    updates: Partial<ParsedResume[T][0]>
  ): void => {
    if (!parsedResume) return;

    setParsedResume(prev => {
      if (!prev) return prev;

      const sectionItems = [...prev[section]];
      sectionItems[index] = { ...sectionItems[index], ...updates };

      return {
        ...prev,
        [section]: sectionItems
      };
    });
  };

  // Update parsed personal info
  const updateParsedPersonalInfo = (updates: Partial<ParsedPersonalInfo>): void => {
    if (!parsedResume) return;

    setParsedResume(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          ...updates
        }
      };
    });
  };

  // Select all items in all sections
  const selectAllItems = (): void => {
    if (!parsedResume) return;

    setParsedResume(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        personalInfo: { ...prev.personalInfo, selected: true },
        experience: prev.experience.map(item => ({ ...item, selected: true })),
        education: prev.education.map(item => ({ ...item, selected: true })),
        skills: prev.skills.map(item => ({ ...item, selected: true })),
        projects: prev.projects.map(item => ({ ...item, selected: true })),
        certifications: prev.certifications.map(item => ({ ...item, selected: true }))
      };
    });
  };

  // Deselect all items in all sections
  const deselectAllItems = (): void => {
    if (!parsedResume) return;

    setParsedResume(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        personalInfo: { ...prev.personalInfo, selected: false },
        experience: prev.experience.map(item => ({ ...item, selected: false })),
        education: prev.education.map(item => ({ ...item, selected: false })),
        skills: prev.skills.map(item => ({ ...item, selected: false })),
        projects: prev.projects.map(item => ({ ...item, selected: false })),
        certifications: prev.certifications.map(item => ({ ...item, selected: false }))
      };
    });
  };

  // Save selected items to user profile
  const saveSelectedItems = async (): Promise<boolean> => {
    if (!parsedResume) {
      toast.error('No parsed resume data to save');
      return false;
    }

    try {
      // Filter out unselected items
      const selectedData: Partial<ParsedResume> = {
        personalInfo: parsedResume.personalInfo.selected ? parsedResume.personalInfo : undefined,
        experience: parsedResume.experience.filter(item => item.selected),
        education: parsedResume.education.filter(item => item.selected),
        skills: parsedResume.skills.filter(item => item.selected),
        projects: parsedResume.projects.filter(item => item.selected),
        certifications: parsedResume.certifications.filter(item => item.selected)
      };

      // Save to profile
      await saveParsedResumeToProfile(selectedData);
      
      toast.success('Resume data saved to your profile!');
      return true;
    } catch (error) {
      console.error('Error saving resume data:', error);
      toast.error('Failed to save resume data to profile. Please try again.');
      return false;
    }
  };

  // Context value
  const value: ResumeParserContextType = {
    parsedResume,
    parsingStatus,
    parseResume,
    updateParsedItem,
    updateParsedPersonalInfo,
    selectAllItems,
    deselectAllItems,
    saveSelectedItems
  };

  return (
    <ResumeParserContext.Provider value={value}>
      {children}
    </ResumeParserContext.Provider>
  );
};

// Custom hook to use the resume parser context
export const useResumeParser = (): ResumeParserContextType => {
  const context = useContext(ResumeParserContext);
  
  if (context === undefined) {
    throw new Error('useResumeParser must be used within a ResumeParserProvider');
  }
  
  return context;
}; 