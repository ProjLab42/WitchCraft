import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  ParsedResume, 
  ParsedPersonalInfo, 
  ParsingStatus, 
  ResumeParserContextType 
} from '@/types/resume-parser';
import { parseResumeFile, saveParsedResumeToProfile } from '@/services/resume-parser.service';
import { 
  evaluateDocumentForATS, 
  RawATSAnalysisResult, 
  convertToStandardATSResult,
  evaluateResumeContent
} from '@/services/ats-industry-standard.service';
import { ATSScoreResult } from '@/services/ats-scorer.service';
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
  // State for ATS score
  const [atsScore, setAtsScore] = useState<ATSScoreResult | null>(null);
  // State for industry-standard ATS analysis
  const [atsRawAnalysis, setAtsRawAnalysis] = useState<RawATSAnalysisResult | null>(null);

  // Parse a resume file
  const parseResume = async (file: File): Promise<void> => {
    try {
      setParsingStatus(ParsingStatus.UPLOADING);
      
      // Reset previous state
      setParsedResume(null);
      setAtsScore(null);
      setAtsRawAnalysis(null);
      
      // Short delay to show uploading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // Analyze the document for ATS compatibility using the industry standard service
        console.log('Analyzing document for industry-standard ATS compatibility...');
        const rawATSAnalysis = await evaluateDocumentForATS(file);
        setAtsRawAnalysis(rawATSAnalysis);
        
        // Extract and analyze content directly using industry standard approach
        console.log('Extracting and analyzing content...');
        const contentAnalysis = await evaluateResumeContent(file, rawATSAnalysis);
        setAtsRawAnalysis(contentAnalysis);
        
        // Convert the complete analysis to standard ATS score format for UI display
        const standardAtsScore = convertToStandardATSResult(contentAnalysis);
        setAtsScore(standardAtsScore);
      } catch (atsError) {
        console.error('Error during ATS analysis:', atsError);
        // Continue with parsing even if ATS analysis fails
      }
      
      // Now start the actual parsing for our application
      setParsingStatus(ParsingStatus.PARSING);
      
      try {
        // Call the resume parser service
        console.log('Starting resume parsing process...');
        const parsedData = await parseResumeFile(file);
        
        // Update state with parsed data
        setParsedResume(parsedData);
        setParsingStatus(ParsingStatus.COMPLETED);
        
        toast.success('Resume parsed successfully!');
      } catch (parseError) {
        console.error('Error during resume parsing:', parseError);
        setParsingStatus(ParsingStatus.ERROR);
        toast.error('Error parsing resume content. We still analyzed your document for ATS compatibility.');
      }
    } catch (error) {
      console.error('Error in overall resume processing:', error);
      setParsingStatus(ParsingStatus.ERROR);
      toast.error('Failed to process resume. Please try again with a different file.');
    }
  };

  // Update a parsed item in a specific section
  const updateParsedItem = <T extends keyof ParsedResume>(
    section: T,
    index: number,
    updates: Partial<ParsedResume[T] extends Array<infer U> ? U : never>
  ): void => {
    if (!parsedResume) return;

    setParsedResume(prevState => {
      if (!prevState) return prevState;

      // Create deep copy of the section
      const updatedSection = [...(prevState[section] as any)];
      
      // Apply updates to the specific item
      updatedSection[index] = {
        ...updatedSection[index],
        ...updates
      };

      // Return updated state
      return {
        ...prevState,
        [section]: updatedSection
      };
    });
  };

  // Update personal info section
  const updateParsedPersonalInfo = (updates: Partial<ParsedPersonalInfo>): void => {
    if (!parsedResume) return;
    
    setParsedResume(prevState => {
      if (!prevState) return prevState;
      
      return {
        ...prevState,
        personalInfo: {
          ...prevState.personalInfo,
          ...updates
        }
      };
    });
  };

  // Select/deselect all items in a section
  const toggleSectionSelection = (section: keyof ParsedResume, selected: boolean): void => {
    if (!parsedResume) return;
    
    setParsedResume(prevState => {
      if (!prevState) return prevState;
      
      const sectionData = prevState[section];
      if (!Array.isArray(sectionData)) return prevState;
      
      // Map through the section and update the selected state for each item
      const updatedSection = sectionData.map(item => ({
        ...item,
        selected
      }));
      
      return {
        ...prevState,
        [section]: updatedSection
      };
    });
  };

  // Select all items in all sections
  const selectAllItems = (): void => {
    if (!parsedResume) return;
    
    // Sections that have selectable items
    const selectableSections = ['experience', 'education', 'skills', 'projects', 'certifications'];
    
    // Select all items in each section
    selectableSections.forEach(section => {
      toggleSectionSelection(section as keyof ParsedResume, true);
    });
  };

  // Deselect all items in all sections
  const deselectAllItems = (): void => {
    if (!parsedResume) return;
    
    // Sections that have selectable items
    const selectableSections = ['experience', 'education', 'skills', 'projects', 'certifications'];
    
    // Deselect all items in each section
    selectableSections.forEach(section => {
      toggleSectionSelection(section as keyof ParsedResume, false);
    });
  };

  // Save the selected items to the user profile
  const saveSelectedItems = async (): Promise<boolean> => {
    if (!parsedResume) return false;
    
    try {
      await saveParsedResumeToProfile(parsedResume);
      return true;
    } catch (error) {
      console.error('Error saving resume data:', error);
      toast.error('Failed to save resume data. Please try again.');
      return false;
    }
  };

  // Provide the context value
  const contextValue: ResumeParserContextType = {
    parsedResume,
    parsingStatus,
    atsScore,
    atsRawAnalysis,
    parseResume,
    updateParsedItem,
    updateParsedPersonalInfo,
    selectAllItems,
    deselectAllItems,
    saveSelectedItems
  };

  return (
    <ResumeParserContext.Provider value={contextValue}>
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