import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { templateService } from '@/services/template.service';
import { useSearchParams } from 'react-router-dom';
import { profileAPI } from '@/services/api.service';
import { toast } from "@/components/ui/use-toast";

// Mock user data - move this to a separate file later if needed
const mockUser = {
  name: "Jane Doe",
  email: "jane.doe@example.com",
  title: "Full Stack Developer",
  location: "San Francisco, CA",
  bio: "Passionate developer with 5+ years of experience building web applications. Specializing in React, TypeScript, and Node.js.",
  avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=jane",
  links: {
    linkedin: "https://linkedin.com/in/janedoe",
    portfolio: "https://janedoe.dev",
    additionalLinks: []
  },
  sections: {
    experience: [
      {
        id: "exp1",
        company: "Tech Solutions Inc.",
        title: "Senior Frontend Developer",
        period: "2020 - Present",
        description: "Led the development of a React-based dashboard used by over 10,000 customers. Improved performance by 40% through code optimization.",
      },
      {
        id: "exp2",
        company: "WebDev Agency",
        title: "Frontend Developer",
        period: "2018 - 2020",
        description: "Developed responsive web applications for clients in various industries. Collaborated with designers to implement pixel-perfect UIs.",
      },
    ],
    education: [
      {
        id: "edu1",
        institution: "University of Technology",
        degree: "Master of Computer Science",
        period: "2016 - 2018",
        description: "Specialized in Human-Computer Interaction. Graduated with honors.",
      },
      {
        id: "edu2",
        institution: "State University",
        degree: "Bachelor of Science in Computer Science",
        period: "2012 - 2016",
        description: "Dean's List, 3.8 GPA. Participated in ACM programming competitions.",
      },
    ],
    projects: [
      {
        id: "proj1",
        name: "E-commerce Platform",
        role: "Lead Developer",
        period: "2021",
        description: "Built a full-stack e-commerce platform with React, Node.js, and MongoDB. Implemented payment processing with Stripe.",
      },
    ],
    certifications: [
      {
        id: "cert1",
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        date: "2022",
        description: "Professional certification for designing distributed systems on AWS.",
      },
    ],
  },
  skills: [
    { id: "skill1", name: "React", level: 90 },
    { id: "skill2", name: "TypeScript", level: 85 },
    { id: "skill3", name: "Node.js", level: 80 },
    { id: "skill4", name: "CSS/SCSS", level: 85 },
    { id: "skill5", name: "GraphQL", level: 75 },
    { id: "skill6", name: "AWS", level: 70 },
  ],
};

// Define types
export type PersonalInfo = {
  name: string;
  title: string;
  email: string;
  location: string;
  phone?: string;
  summary?: string;
  links?: {
    linkedin?: string;
    portfolio?: string;
    additionalLinks?: { label: string; url: string }[];
  };
};

export type ExperienceItem = {
  id: string;
  company: string;
  title: string;
  period: string;
  description: string;
  itemType?: string;
};

export type EducationItem = {
  id: string;
  institution: string;
  degree: string;
  period: string;
  description: string;
  itemType?: string;
};

export type ProjectItem = {
  id: string;
  name: string;
  role: string;
  period: string;
  description: string;
  itemType?: string;
};

export type CertificationItem = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
  itemType?: string;
};

export type SkillItem = {
  id: string;
  name: string;
  level: number;
};

export type ResumeSection = ExperienceItem | EducationItem | ProjectItem | CertificationItem;

export type ResumeContent = {
  personalInfo: PersonalInfo;
  sections: (ResumeSection & { itemType: string })[];
  selectedSkills: SkillItem[];
  sectionOrder: string[];
};

export type UserData = {
  name: string;
  email: string;
  title: string;
  location: string;
  bio: string;
  avatarUrl: string;
  links: {
    linkedin: string;
    portfolio: string;
    additionalLinks: { label: string; url: string }[];
  };
  sections: {
    experience: ExperienceItem[];
    education: EducationItem[];
    projects: ProjectItem[];
    certifications: CertificationItem[];
  };
  skills: SkillItem[];
};

// Context type
export interface ResumeContextType {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  resumeContent: ResumeContent;
  setResumeContent: React.Dispatch<React.SetStateAction<ResumeContent>>;
  openSections: Record<string, boolean>;
  setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isEditingPersonalInfo: boolean;
  setIsEditingPersonalInfo: React.Dispatch<React.SetStateAction<boolean>>;
  editedPersonalInfo: PersonalInfo;
  setEditedPersonalInfo: React.Dispatch<React.SetStateAction<PersonalInfo>>;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  pageFormat: string;
  setPageFormat: React.Dispatch<React.SetStateAction<string>>;
  isExportDialogOpen: boolean;
  setIsExportDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTemplate: string | null;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<string | null>>;
  templateStyles: any;
  autoScalingEnabled: boolean;
  setAutoScalingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create context
const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// Provider component
export const ResumeProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get('template');

  const [userData, setUserData] = useState<UserData>(mockUser);
  const [loading, setLoading] = useState(true);
  
  const [resumeContent, setResumeContent] = useState<ResumeContent>({
    personalInfo: {
      name: userData.name,
      title: userData.title,
      email: userData.email,
      location: userData.location,
      links: userData.links
    },
    sections: [],
    selectedSkills: [],
    sectionOrder: []
  });
  
  // Fetch user data from backend with fallback to mock data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Check if auth token exists
        const authToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='));
        
        if (!authToken) {
          console.log('No auth token found, using mock data');
          setUserData(mockUser);
          return;
        }
        
        // Fetch user profile from backend
        const fetchedUserData = await profileAPI.getProfile();
        console.log('Fetched user data:', fetchedUserData);
        
        // Merge with mock data to ensure all fields have values
        const completeUserData = mergeWithMockData(fetchedUserData);
        
        setUserData(completeUserData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Using sample data",
          description: "Could not load your profile data. Using sample data instead.",
          variant: "default"
        });
        // Fall back to mock data on error
        setUserData(mockUser);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Helper function to merge user data with mock data, using mock data as fallback
  const mergeWithMockData = (fetchedData: any): UserData => {
    // If fetchedData is empty or null, just return mock data
    if (!fetchedData) return mockUser;
    
    // Create a deep merge of user data with mock data as fallback
    const mergedData = {
      // Basic user info
      name: fetchedData.name || mockUser.name,
      email: fetchedData.email || mockUser.email,
      title: fetchedData.title || mockUser.title,
      location: fetchedData.location || mockUser.location,
      bio: fetchedData.bio || mockUser.bio,
      avatarUrl: fetchedData.avatarUrl || mockUser.avatarUrl,
      
      // Links
      links: {
        linkedin: fetchedData.links?.linkedin || mockUser.links.linkedin,
        portfolio: fetchedData.links?.portfolio || mockUser.links.portfolio,
        additionalLinks: fetchedData.links?.additionalLinks || mockUser.links.additionalLinks
      },
      
      // Sections
      sections: {
        // Experience section
        experience: fetchedData.sections?.experience || mockUser.sections.experience,
        
        // Education section
        education: fetchedData.sections?.education || mockUser.sections.education,
        
        // Projects section
        projects: fetchedData.sections?.projects || mockUser.sections.projects,
        
        // Certifications section
        certifications: fetchedData.sections?.certifications || mockUser.sections.certifications,
      },
      
      // Skills - check both locations where skills might be stored
      skills: fetchedData.sections?.skills || fetchedData.skills || mockUser.skills,
    };
    
    return mergedData as UserData;
  };
  
  // Update resumeContent when userData changes
  useEffect(() => {
    if (!loading) {
      setResumeContent(prevContent => ({
        ...prevContent,
        personalInfo: {
          name: userData.name,
          title: userData.title,
          email: userData.email,
          location: userData.location,
          links: userData.links
        }
      }));
      
      // Update edited personal info as well
      setEditedPersonalInfo({
        name: userData.name,
        title: userData.title,
        email: userData.email,
        location: userData.location,
        links: userData.links
      });
    }
  }, [userData, loading]);
  
  const [openSections, setOpenSections] = useState({
    personalInfo: true,
    experience: true,
    education: true,
    skills: true,
    projects: false,
    certifications: false,
  });
  
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [editedPersonalInfo, setEditedPersonalInfo] = useState<PersonalInfo>({
    name: '',
    title: '',
    email: '',
    location: '',
    links: {
      linkedin: '',
      portfolio: '',
      additionalLinks: []
    }
  });
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pageFormat, setPageFormat] = useState("A4");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // State for selected template
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(templateParam || 'classic');
  
  // State for template styles
  const [templateStyles, setTemplateStyles] = useState<any>(null);

  // Auto-scaling toggle
  const [autoScalingEnabled, setAutoScalingEnabled] = useState(true);

  // Effect to load template styles when selectedTemplate changes
  useEffect(() => {
    const loadTemplate = async () => {
      if (selectedTemplate) {
        try {
          const template = await templateService.getTemplateById(selectedTemplate);
          if (template && template.sections && template.styles) {
            // Update section order based on template
            setResumeContent(prev => ({
              ...prev,
              sectionOrder: [...template.sections.defaultOrder]
            }));
            
            // Set template styles
            setTemplateStyles(template.styles);
          }
        } catch (error) {
          console.error('Error loading template:', error);
        }
      }
    };
    
    loadTemplate();
  }, [selectedTemplate]);

  return (
    <ResumeContext.Provider value={{
      userData,
      setUserData,
      resumeContent,
      setResumeContent,
      openSections,
      setOpenSections,
      isEditingPersonalInfo,
      setIsEditingPersonalInfo,
      editedPersonalInfo,
      setEditedPersonalInfo,
      zoomLevel,
      setZoomLevel,
      pageFormat,
      setPageFormat,
      isExportDialogOpen,
      setIsExportDialogOpen,
      selectedTemplate,
      setSelectedTemplate,
      templateStyles,
      autoScalingEnabled,
      setAutoScalingEnabled
    }}>
      {children}
    </ResumeContext.Provider>
  );
};

// Custom hook for using the resume context
export const useResumeContext = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResumeContext must be used within a ResumeProvider');
  }
  return context;
}; 