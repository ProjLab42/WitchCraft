import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Download, Plus, Edit, ArrowLeft } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Link, useSearchParams } from "react-router-dom";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

// Import our new components
import { ResumeProvider, useResumeContext } from "@/components/resume-editor/ResumeContext";
import { DraggableSection } from "@/components/resume-editor/DraggableSection";
import { DraggableItem } from "@/components/resume-editor/DraggableItem";
import { ResumeDropZone } from "@/components/resume-editor/ResumeDropZone";
import { ReorderableResume } from "@/components/resume-editor/ReorderableResume";
import { HybridResumeEditor } from "@/components/resume-editor/HybridResumeEditor";
import { AddSkillDialog } from "@/components/resume-editor/AddSkillDialog";
import { ExportDialog } from "@/components/resume-editor/ExportDialog";
import { PersonalInfoEditor } from "@/components/resume-editor/PersonalInfoEditor";
import { ZoomControls } from "@/components/resume-editor/ZoomControls";
import { exportAsPDF, exportAsDOCX, generateId } from "@/components/resume-editor/utils";
import { templateService, Template } from "@/services/template.service";
import { resumeAPI } from "@/services/api.service";

// Main Editor component
function EditorContent() {
  // Get URL parameters
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get('template');
  
  // Template state
  const [template, setTemplate] = useState<Template | null>(null);
  const [templateLoading, setTemplateLoading] = useState<boolean>(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  
  // Get all state from context
  const {
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
    autoScalingEnabled,
    setAutoScalingEnabled,
    pageFormat,
    setPageFormat,
    isExportDialogOpen,
    setIsExportDialogOpen,
    selectedTemplate,
    setSelectedTemplate
  } = useResumeContext();

  // Local state
  const [isAddSkillDialogOpen, setIsAddSkillDialogOpen] = useState(false);
  const resumeRef = useRef(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // State for current resume ID (from DB)
  const [resumeId, setResumeId] = useState<string | null>(null);

  // Fetch template data when templateParam changes
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateParam) {
        // If no template is specified, use the first default template
        try {
          const templates = await templateService.getAllTemplates();
          if (templates && templates.length > 0) {
            const defaultTemplate = await templateService.getTemplateById(templates[0].id);
            setTemplate(defaultTemplate);
            setSelectedTemplate(templates[0].id);
          }
        } catch (error) {
          console.error('Error fetching default template:', error);
          setTemplateError('Failed to load default template. Using basic styling.');
        }
        return;
      }
      
      try {
        setTemplateLoading(true);
        setTemplateError(null);
        
        console.log('Fetching template with ID:', templateParam);
        const templateData = await templateService.getTemplateById(templateParam);
        console.log('Template data received:', templateData);
        
        if (!templateData || !templateData.styles) {
          throw new Error('Invalid template data received');
        }
        
        setTemplate(templateData);
        setSelectedTemplate(templateParam);
      } catch (error) {
        console.error('Error fetching template:', error);
        setTemplateError('Failed to load template. Using default styling.');
        
        // Try to load a default template as fallback
        try {
          const templates = await templateService.getAllTemplates();
          if (templates && templates.length > 0) {
            const defaultTemplate = await templateService.getTemplateById(templates[0].id);
            setTemplate(defaultTemplate);
          }
        } catch (innerError) {
          console.error('Error fetching fallback template:', innerError);
        }
      } finally {
        setTemplateLoading(false);
      }
    };
    
    fetchTemplate();
  }, [templateParam, setSelectedTemplate]);

  // Clean up duplicates on component mount
  useEffect(() => {
    // Only run on initial mount
    const initialCleanup = setTimeout(() => {
      cleanupDuplicates();
    }, 500);
    
    return () => clearTimeout(initialCleanup);
  }, []);

  // Set the template from URL parameter when component mounts
  useEffect(() => {
    if (templateParam && templateParam !== selectedTemplate) {
      setSelectedTemplate(templateParam);
      toast.success(`Template "${templateParam}" applied`);
    }
  }, [templateParam, selectedTemplate, setSelectedTemplate]);

  // Function to clean up existing duplicates
  const cleanupDuplicates = () => {
    console.log("Cleaning up duplicates...");
    
    // Group sections by type
    const sectionsByType = resumeContent.sections.reduce((acc, section) => {
      if (!acc[section.itemType]) {
        acc[section.itemType] = [];
      }
      acc[section.itemType].push(section);
      return acc;
    }, {} as Record<string, any[]>);
    
    console.log("Sections grouped by type:", sectionsByType);
    
    // Check for duplicates in each section type
    let hasDuplicates = false;
    const cleanedSections = [];
    const duplicateIds = new Set<string>();
    
    // For each section type, find duplicates and keep only unique items
    Object.entries(sectionsByType).forEach(([type, sections]) => {
      const uniqueItems = new Map<string, any>();
      
      // First pass: identify unique items by their content
      sections.forEach((section: any) => {
        let key = '';
        
        // Create a unique key based on section type
        switch (type) {
          case 'experience':
            key = `${section.company?.toLowerCase()}-${section.title?.toLowerCase()}-${section.period}`;
            break;
          case 'education':
            key = `${section.institution?.toLowerCase()}-${section.degree?.toLowerCase()}-${section.period}`;
            break;
          case 'projects':
            key = `${section.name?.toLowerCase()}-${section.role?.toLowerCase()}`;
            break;
          case 'certifications':
            key = `${section.name?.toLowerCase()}-${section.issuer?.toLowerCase()}`;
            break;
          default:
            key = section.id;
        }
        
        // If we've seen this key before, it's a duplicate
        if (uniqueItems.has(key)) {
          duplicateIds.add(section.id);
          hasDuplicates = true;
        } else {
          uniqueItems.set(key, section);
        }
      });
      
      // Add all unique items to the cleaned sections
      uniqueItems.forEach((section) => {
        cleanedSections.push(section);
      });
    });
    
    console.log("Duplicate IDs found:", [...duplicateIds]);
    console.log("Cleaned sections:", cleanedSections);
    
    // If we found duplicates, update with the cleaned sections
    if (hasDuplicates) {
      // Update resumeContent with the cleaned sections
      setResumeContent(prev => ({
        ...prev,
        sections: cleanedSections
      }));
      
      toast.success("Duplicate items have been removed");
    }
  };
  
  // Toggle section open/closed
  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Reorder sections in the resume
  const reorderSections = (sourceIndex, destinationIndex) => {
    const newOrder = [...resumeContent.sectionOrder];
    const [removed] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(destinationIndex, 0, removed);
    
    setResumeContent(prev => ({
      ...prev,
      sectionOrder: newOrder
    }));
  };
  
  // Handle dropping an item onto the resume
  const handleDrop = (item) => {
    console.log("Dropping item:", item);
    console.log("Current resumeContent.sections:", resumeContent.sections);
    
    // Check if the item already exists in the resume by ID
    const existingItemIndex = resumeContent.sections.findIndex(
      section => section.id === item.id
    );
    
    console.log("Existing item index:", existingItemIndex);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedSections = [...resumeContent.sections];
      updatedSections[existingItemIndex] = { ...item };
      
      setResumeContent(prev => ({
        ...prev,
        sections: updatedSections
      }));
      
      toast.success("Item updated");
    } else {
      // Check if a similar item already exists in the resume
      // We'll check based on content similarity rather than just ID
      const isDuplicate = checkForDuplicate(item, resumeContent.sections);
      
      console.log("Is duplicate check result:", isDuplicate);
      
      if (isDuplicate) {
        toast.error("This item already exists in your resume");
        return;
      }
      
      // Add new item
      setResumeContent(prev => {
        // Create a new sections array with the new item
        const newSections = [...prev.sections, { ...item }];
        
        // Create or update the section order if needed
        let newSectionOrder = [...(prev.sectionOrder || [])];
        if (!newSectionOrder.includes(item.itemType)) {
          newSectionOrder.push(item.itemType);
        }
        
        console.log("New sections after adding:", newSections);
        
        return {
          ...prev,
          sections: newSections,
          sectionOrder: newSectionOrder
        };
      });
      
      // Run cleanup to remove any duplicates that might have been created
      setTimeout(() => {
        cleanupDuplicates();
      }, 100);
      
      toast.success("Item added to resume");
    }
  };
  
  // Helper function to check if an item is a duplicate
  const checkForDuplicate = (newItem, existingSections) => {
    console.log("Checking for duplicate:", newItem);
    console.log("Against existing sections:", existingSections);
    
    // For each section type, we'll define what makes an item a duplicate
    switch (newItem.itemType) {
      case 'experience':
        const expDuplicates = existingSections.filter(section => {
          if (section.itemType !== 'experience') return false;
          
          // Type assertion to access experience-specific properties
          const expSection = section as any;
          const expNewItem = newItem as any;
          
          return expSection.company?.toLowerCase() === expNewItem.company?.toLowerCase() &&
                 expSection.title?.toLowerCase() === expNewItem.title?.toLowerCase() &&
                 expSection.period === expNewItem.period;
        });
        console.log("Experience duplicates found:", expDuplicates);
        return expDuplicates.length > 0;
        
      case 'education':
        const eduDuplicates = existingSections.filter(section => {
          if (section.itemType !== 'education') return false;
          
          // Type assertion to access education-specific properties
          const eduSection = section as any;
          const eduNewItem = newItem as any;
          
          return eduSection.institution?.toLowerCase() === eduNewItem.institution?.toLowerCase() &&
                 eduSection.degree?.toLowerCase() === eduNewItem.degree?.toLowerCase() &&
                 eduSection.period === eduNewItem.period;
        });
        console.log("Education duplicates found:", eduDuplicates);
        return eduDuplicates.length > 0;
        
      case 'projects':
        const projDuplicates = existingSections.filter(section => {
          if (section.itemType !== 'projects') return false;
          
          // Type assertion to access project-specific properties
          const projSection = section as any;
          const projNewItem = newItem as any;
          
          return projSection.name?.toLowerCase() === projNewItem.name?.toLowerCase() &&
                 projSection.role?.toLowerCase() === projNewItem.role?.toLowerCase();
        });
        console.log("Project duplicates found:", projDuplicates);
        return projDuplicates.length > 0;
        
      case 'certifications':
        const certDuplicates = existingSections.filter(section => {
          if (section.itemType !== 'certifications') return false;
          
          // Type assertion to access certification-specific properties
          const certSection = section as any;
          const certNewItem = newItem as any;
          
          return certSection.name?.toLowerCase() === certNewItem.name?.toLowerCase() &&
                 certSection.issuer?.toLowerCase() === certNewItem.issuer?.toLowerCase();
        });
        console.log("Certification duplicates found:", certDuplicates);
        return certDuplicates.length > 0;
        
      default:
        return false;
    }
  };
  
  // Remove a section from the resume
  const removeSection = (id) => {
    console.log("Removing section with ID:", id);
    
    // First, find the section to remove to get its type
    const sectionToRemove = resumeContent.sections.find(section => section.id === id);
    console.log("Section to remove:", sectionToRemove);
    
    if (!sectionToRemove) {
      toast.error("Item not found");
      return;
    }
    
    // Update resumeContent
    setResumeContent(prev => {
      // Filter out the section
      const newSections = prev.sections.filter(section => section.id !== id);
      console.log("New sections after removal:", newSections);
      
      // Check if we need to update the section order
      let newSectionOrder = [...prev.sectionOrder];
      
      // If this was the last item of its type, remove the type from the order
      const sectionType = sectionToRemove.itemType;
      const hasMoreOfType = newSections.some(section => section.itemType === sectionType);
      
      if (!hasMoreOfType && sectionType !== 'skills') {
        newSectionOrder = newSectionOrder.filter(type => type !== sectionType);
      }
      
      return {
        ...prev,
        sections: newSections,
        sectionOrder: newSectionOrder
      };
    });
    
    toast.success("Item removed from resume");
  };
  
  // Add a new experience item
  const addExperience = () => {
    const newExperience = {
      id: generateId('exp'),
      company: "New Company",
      title: "Job Title",
      period: "20XX - Present",
      description: "Describe your responsibilities and achievements",
      itemType: "experience"
    };
    
    // Check if a similar experience already exists in userData
    const isDuplicateInUserData = userData.sections.experience && userData.sections.experience.some(exp => 
      exp.company.toLowerCase() === newExperience.company.toLowerCase() &&
      exp.title.toLowerCase() === newExperience.title.toLowerCase() &&
      exp.period === newExperience.period
    );
    
    // Also check if it already exists in resumeContent
    const isDuplicateInResume = resumeContent.sections.some(section => {
      if (section.itemType !== 'experience') return false;
      
      // Type assertion to access experience-specific properties
      const expSection = section as any;
      
      return expSection.company?.toLowerCase() === newExperience.company.toLowerCase() &&
             expSection.title?.toLowerCase() === newExperience.title.toLowerCase() &&
             expSection.period === newExperience.period;
    });
    
    if (isDuplicateInUserData || isDuplicateInResume) {
      toast.error("A similar experience already exists");
      return;
    }
    
    // Add to user data
    setUserData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        experience: [...(prev.sections.experience || []), newExperience]
      }
    }));
    
    toast.success("New experience added");
  };
  
  // Add a new education item
  const addEducation = () => {
    const newEducation = {
      id: generateId('edu'),
      institution: "University Name",
      degree: "Degree Name",
      period: "20XX - 20XX",
      description: "Describe your education, achievements, GPA, etc.",
      itemType: "education"
    };
    
    // Check if a similar education already exists in userData
    const isDuplicateInUserData = userData.sections.education && userData.sections.education.some(edu => 
      edu.institution.toLowerCase() === newEducation.institution.toLowerCase() &&
      edu.degree.toLowerCase() === newEducation.degree.toLowerCase() &&
      edu.period === newEducation.period
    );
    
    // Also check if it already exists in resumeContent
    const isDuplicateInResume = resumeContent.sections.some(section => {
      if (section.itemType !== 'education') return false;
      
      // Type assertion to access education-specific properties
      const eduSection = section as any;
      
      return eduSection.institution?.toLowerCase() === newEducation.institution.toLowerCase() &&
             eduSection.degree?.toLowerCase() === newEducation.degree.toLowerCase() &&
             eduSection.period === newEducation.period;
    });
    
    if (isDuplicateInUserData || isDuplicateInResume) {
      toast.error("A similar education already exists");
      return;
    }
    
    // Add to user data
    setUserData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        education: [...(prev.sections.education || []), newEducation]
      }
    }));
    
    toast.success("New education added");
  };
  
  // Delete an item from the left panel
  const deleteItemFromPanel = (type: string, id: string) => {
    setUserData(prev => {
      const updatedSections = { ...prev.sections };
      
      if (updatedSections[type as keyof typeof updatedSections]) {
        const sectionArray = updatedSections[type as keyof typeof updatedSections] as any[];
        const updatedArray = sectionArray.filter(item => item.id !== id);
        
        // Update the section with the filtered array
        updatedSections[type as keyof typeof updatedSections] = updatedArray as any;
      }
      
      return {
        ...prev,
        sections: updatedSections
      };
    });
    
    // Also remove from resume if it's there
    const isInResume = resumeContent.sections.some(section => section.id === id);
    if (isInResume) {
      removeSection(id);
    }
    
    toast.success("Item deleted");
  };
  
  // Toggle a skill selection
  const toggleSkill = (skill) => {
    setResumeContent(prev => {
      const selectedSkills = [...prev.selectedSkills];
      const skillIndex = selectedSkills.findIndex(s => s.id === skill.id);
      
      if (skillIndex >= 0) {
        // Remove skill
        selectedSkills.splice(skillIndex, 1);
      } else {
        // Check if a skill with the same name already exists in selected skills
        const duplicateSkill = selectedSkills.find(s => 
          s.name.toLowerCase() === skill.name.toLowerCase()
        );
        
        if (duplicateSkill) {
          // Don't add duplicate and show a toast message
          toast.error("This skill is already selected");
          return prev; // Return previous state unchanged
        }
        
        // Add skill
        selectedSkills.push(skill);
      }
      
      // Update section order if needed
      let newSectionOrder = [...prev.sectionOrder];
      if (selectedSkills.length > 0 && !newSectionOrder.includes('skills')) {
        newSectionOrder.push('skills');
      } else if (selectedSkills.length === 0 && newSectionOrder.includes('skills')) {
        newSectionOrder = newSectionOrder.filter(type => type !== 'skills');
      }
      
      return {
        ...prev,
        selectedSkills,
        sectionOrder: newSectionOrder
      };
    });
  };
  
  // Add a new skill
  const addSkill = (skillName) => {
    // Check if a skill with the same name already exists
    const isDuplicate = userData.skills.some(skill => 
      skill.name.toLowerCase() === skillName.toLowerCase()
    );
    
    if (isDuplicate) {
      toast.error("This skill already exists");
      return;
    }
    
    const newSkill = {
      id: generateId('skill'),
      name: skillName,
      level: 75
    };
    
    // Add to user data
    setUserData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
    
    // Also select it
    setResumeContent(prev => {
      // Check if a skill with the same name already exists in selected skills
      const duplicateSkill = prev.selectedSkills.find(s => 
        s.name.toLowerCase() === skillName.toLowerCase()
      );
      
      if (duplicateSkill) {
        toast.warning("This skill is already selected");
        return prev;
      }
      
      const selectedSkills = [...prev.selectedSkills, newSkill];
      
      // Update section order if needed
      let newSectionOrder = [...prev.sectionOrder];
      if (!newSectionOrder.includes('skills')) {
        newSectionOrder.push('skills');
      }
      
      
      return {
        ...prev,
        selectedSkills,
        sectionOrder: newSectionOrder
      };
    });
    
    toast.success(`Skill "${skillName}" added`);
  };
  
  // Add a new project
  const addProject = () => {
    const newProject = {
      id: generateId('proj'),
      name: "Project Name",
      role: "Your Role",
      period: "20XX",
      description: "Describe the project, your role, technologies used, and outcomes",
      itemType: "projects"
    };
    
    // Check if a similar project already exists in userData
    const isDuplicateInUserData = userData.sections.projects && userData.sections.projects.some(proj => 
      proj.name.toLowerCase() === newProject.name.toLowerCase() &&
      proj.role.toLowerCase() === newProject.role.toLowerCase()
    );
    
    // Also check if it already exists in resumeContent
    const isDuplicateInResume = resumeContent.sections.some(section => {
      if (section.itemType !== 'projects') return false;
      
      // Type assertion to access project-specific properties
      const projSection = section as any;
      
      return projSection.name?.toLowerCase() === newProject.name.toLowerCase() &&
             projSection.role?.toLowerCase() === newProject.role.toLowerCase();
    });
    
    if (isDuplicateInUserData || isDuplicateInResume) {
      toast.error("A similar project already exists");
      return;
    }
    
    // Add to user data
    setUserData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        projects: [...(prev.sections.projects || []), newProject]
      }
    }));
    
    toast.success("New project added");
  };
  
  // Add a new certification
  const addCertification = () => {
    const newCertification = {
      id: generateId('cert'),
      name: "Certification Name",
      issuer: "Issuing Organization",
      date: "Month 20XX",
      description: "Describe what you learned and skills acquired",
      itemType: "certifications"
    };
    
    // Check if a similar certification already exists in userData
    const isDuplicateInUserData = userData.sections.certifications && userData.sections.certifications.some(cert => 
      cert.name.toLowerCase() === newCertification.name.toLowerCase() &&
      cert.issuer.toLowerCase() === newCertification.issuer.toLowerCase()
    );
    
    // Also check if it already exists in resumeContent
    const isDuplicateInResume = resumeContent.sections.some(section => {
      if (section.itemType !== 'certifications') return false;
      
      // Type assertion to access certification-specific properties
      const certSection = section as any;
      
      return certSection.name?.toLowerCase() === newCertification.name.toLowerCase() &&
             certSection.issuer?.toLowerCase() === newCertification.issuer.toLowerCase();
    });
    
    if (isDuplicateInUserData || isDuplicateInResume) {
      toast.error("A similar certification already exists");
      return;
    }
    
    // Add to user data
    setUserData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        certifications: [...(prev.sections.certifications || []), newCertification]
      }
    }));
    
    toast.success("New certification added");
  };
  
  // Handle editing personal info
  const handleEditPersonalInfo = () => {
    setEditedPersonalInfo({
      ...resumeContent.personalInfo
    });
    setIsEditingPersonalInfo(true);
  };
  
  // Handle saving personal info
  const handleSavePersonalInfo = () => {
    setResumeContent(prev => ({
      ...prev,
      personalInfo: { ...editedPersonalInfo }
    }));
    
    setIsEditingPersonalInfo(false);
    toast.success("Personal information updated");
  };
  
  // Handle canceling personal info edit
  const handleCancelPersonalInfo = () => {
    setIsEditingPersonalInfo(false);
  };
  
  // Handle personal info field changes
  const handlePersonalInfoChange = (field, value) => {
    setEditedPersonalInfo(prev => {
      // Handle nested fields like links.linkedin
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      
      // Handle regular fields
      return {
        ...prev,
        [field]: value
      };
    });
  };
  
  // Reorder items within a section
  const reorderSectionItems = (sectionType, sourceIndex, destinationIndex) => {
    setResumeContent(prev => {
      // Get all items of this section type
      const sectionItems = prev.sections.filter(
        section => section.itemType === sectionType
      );
      
      // Reorder the items
      const newSectionItems = [...sectionItems];
      const [removed] = newSectionItems.splice(sourceIndex, 1);
      newSectionItems.splice(destinationIndex, 0, removed);
      
      // Create a new sections array with the reordered items
      const otherSections = prev.sections.filter(
        section => section.itemType !== sectionType
      );
      
      return {
        ...prev,
        sections: [...otherSections, ...newSectionItems]
      };
    });
  };
  
  // Delete a skill
  const deleteSkill = (skillId) => {
    // Remove from user data
    setUserData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== skillId)
    }));
    
    // Remove from selected skills if selected
    setResumeContent(prev => {
      const selectedSkills = prev.selectedSkills.filter(skill => skill.id !== skillId);
      
      // Update section order if needed
      let newSectionOrder = [...prev.sectionOrder];
      if (selectedSkills.length === 0 && newSectionOrder.includes('skills')) {
        newSectionOrder = newSectionOrder.filter(type => type !== 'skills');
      }
      
      return {
        ...prev,
        selectedSkills,
        sectionOrder: newSectionOrder
      };
    });
    
    toast.success("Skill deleted");
  };
  
  // Open export dialog
  const openExportDialog = () => {
    setIsExportDialogOpen(true);
  };
  
  // Close export dialog
  const closeExportDialog = () => {
    setIsExportDialogOpen(false);
  };
  
  // Handle page format change
  const handlePageFormatChange = (value) => {
    setPageFormat(value);
  };
  
  // Save the current resume state to the server
  const saveResumeState = async () => {
    try {
      console.log("Preparing resume data for save...");
      
      // Create properly formatted resume data according to backend schema
      const resumeData = {
        title: resumeContent.personalInfo.name 
          ? `${resumeContent.personalInfo.name}'s Resume` 
          : 'Untitled Resume',
        template: template?.name || 'default',
        format: pageFormat || 'A4',
        lastEdited: new Date(),
        
        // Format personal info data according to backend schema
        data: {
          name: resumeContent.personalInfo.name || '',
          jobTitle: resumeContent.personalInfo.title || '',
          email: resumeContent.personalInfo.email || '',
          linkedin: resumeContent.personalInfo.links?.linkedin || '',
          website: resumeContent.personalInfo.links?.portfolio || '',
          // Only include optional fields if they exist in PersonalInfo
          ...(resumeContent.personalInfo.phone && { phone: resumeContent.personalInfo.phone }),
          ...(resumeContent.personalInfo.summary && { summary: resumeContent.personalInfo.summary }),
          ...(resumeContent.personalInfo.location && { location: resumeContent.personalInfo.location })
        },
        
        // Format sections according to backend schema
        sections: {
          experience: resumeContent.sections.filter(s => s.itemType === 'experience') || [],
          education: resumeContent.sections.filter(s => s.itemType === 'education') || [],
          skills: resumeContent.selectedSkills || [],
          projects: resumeContent.sections.filter(s => s.itemType === 'projects') || [],
          certifications: resumeContent.sections.filter(s => s.itemType === 'certifications') || []
        }
      };
      
      console.log("Prepared data:", resumeData);
      
      let savedResume;
      
      if (resumeId) {
        console.log("Updating existing resume with ID:", resumeId);
        // Update existing resume
        savedResume = await resumeAPI.updateResume(resumeId, resumeData);
        console.log("Resume updated successfully:", savedResume);
      } else {
        console.log("Creating new resume...");
        // Create new resume
        savedResume = await resumeAPI.createResume(resumeData);
        console.log("New resume created:", savedResume);
        if (savedResume && savedResume._id) {
          setResumeId(savedResume._id);
        }
      }
      
      return savedResume;
    } catch (error) {
      console.error('Error saving resume:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status
      });
      return null;
    }
  };
  
  // Export as PDF
  const handleExportPDF = async () => {
    let success = false;
    
    // Show loading toast
    const loadingToast = toast.loading("Exporting resume as PDF...");
    
    try {
      console.log("Starting PDF export process");
      // First save the current resume state to get an ID
      console.log("Current resume content:", resumeContent);
      const savedResume = await saveResumeState();
      console.log("Save resume result:", savedResume);
      
      if (savedResume && savedResume._id) {
        // Use server-side PDF generation
        console.log("Using server-side PDF generation with resume ID:", savedResume._id);
        success = await resumeAPI.downloadResume(
          savedResume._id, 
          'pdf',
          template?.name // Pass current template name
        );
        
        if (success) {
          toast.success("Resume exported as PDF");
          closeExportDialog();
        } else {
          toast.error("Failed to export PDF. Please try again.");
        }
      } else {
        toast.error("Failed to save resume. Please try again.");
      }
    } catch (error) {
      console.error("PDF export error:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
    }
    
    return success;
  };
  
  // Export as DOCX
  const handleExportDOCX = async () => {
    let success = false;
    
    // Show loading toast
    const loadingToast = toast.loading("Exporting resume as DOCX...");
    
    try {
      // First try to save the current resume state to get an ID
      const savedResume = await saveResumeState();
      
      if (savedResume && savedResume._id) {
        // Use server-side DOCX generation
        success = await resumeAPI.downloadResume(
          savedResume._id, 
          'docx',
          template?.name // Pass current template name
        );
      } else {
        // Fallback to client-side generation if we couldn't save
        console.warn("Falling back to client-side DOCX generation");
        success = await exportAsDOCX(resumeContent, pageFormat);
      }
      
      if (success) {
        toast.success("Resume exported as DOCX");
        closeExportDialog();
      } else {
        toast.error("Failed to export DOCX");
      }
    } catch (error) {
      console.error("DOCX export error:", error);
      // Fallback to client-side generation on error
      try {
        success = await exportAsDOCX(resumeContent, pageFormat);
        if (success) {
          toast.success("Resume exported as DOCX (fallback method)");
          closeExportDialog();
        } else {
          toast.error("Failed to export DOCX");
        }
      } catch (fallbackError) {
        console.error("Fallback DOCX export error:", fallbackError);
        toast.error("Failed to export DOCX");
      }
    } finally {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
    }
    
    return success;
  };
  
  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleToggleAutoScaling = (enabled: boolean) => {
    setAutoScalingEnabled(enabled);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container py-8 pb-16">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Resume Builder</h1>
            {templateError && (
              <span className="text-sm text-destructive">{templateError}</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={openExportDialog}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            <Link to="/templates">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Templates
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-[350px_1fr] gap-6">
          {/* Left sidebar */}
          <div className="space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
            {/* Personal Info Section */}
            <DraggableSection 
              title="Personal Information" 
              isOpen={openSections.personalInfo}
              toggleOpen={() => toggleSection('personalInfo')}
            >
              {isEditingPersonalInfo ? (
                <PersonalInfoEditor
                  personalInfo={resumeContent.personalInfo}
                  editedPersonalInfo={editedPersonalInfo}
                  onSave={handleSavePersonalInfo}
                  onCancel={handleCancelPersonalInfo}
                  onChange={handlePersonalInfoChange}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{userData.name}</h4>
                      <p className="text-sm text-muted-foreground">{userData.title}</p>
                      <p className="text-xs text-muted-foreground">{userData.email}</p>
                      <p className="text-xs text-muted-foreground">{userData.location}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleEditPersonalInfo}>
                      <Edit size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </DraggableSection>
            
            {/* Experience Section */}
            <DraggableSection 
              title="Experience" 
              isOpen={openSections.experience}
              toggleOpen={() => toggleSection('experience')}
            >
              <div className="space-y-4">
                {userData.sections.experience && userData.sections.experience.map(item => (
                  <DraggableItem 
                    key={item.id} 
                    item={item} 
                    type="experience" 
                    onDrop={handleDrop}
                    userData={userData}
                    setUserData={setUserData}
                    resumeContent={resumeContent}
                    onDelete={(id) => deleteItemFromPanel('experience', id)}
                  />
                ))}
                
                <Button variant="outline" size="sm" className="w-full" onClick={addExperience}>
                  <Plus className="mr-1 h-4 w-4" /> Add Experience
                </Button>
              </div>
            </DraggableSection>
            
            {/* Education Section */}
            <DraggableSection 
              title="Education" 
              isOpen={openSections.education}
              toggleOpen={() => toggleSection('education')}
            >
              <div className="space-y-4">
                {userData.sections.education && userData.sections.education.map(item => (
                  <DraggableItem 
                    key={item.id} 
                    item={item} 
                    type="education" 
                    onDrop={handleDrop}
                    userData={userData}
                    setUserData={setUserData}
                    resumeContent={resumeContent}
                    onDelete={(id) => deleteItemFromPanel('education', id)}
                  />
                ))}
                
                <Button variant="outline" size="sm" className="w-full" onClick={addEducation}>
                  <Plus className="mr-1 h-4 w-4" /> Add Education
                </Button>
              </div>
            </DraggableSection>
            
            {/* Skills Section */}
            <DraggableSection 
              title="Skills" 
              isOpen={openSections.skills}
              toggleOpen={() => toggleSection('skills')}
            >
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {userData.skills.map(skill => {
                    const isSelected = resumeContent.selectedSkills.some(s => s.id === skill.id);
                    return (
                      <div 
                        key={skill.id} 
                        className={`px-3 py-1 rounded-full text-sm cursor-pointer flex items-center gap-1 ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill.name}
                      </div>
                    );
                  })}
                </div>
                
                <Button variant="outline" size="sm" className="w-full" onClick={() => setIsAddSkillDialogOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" /> Add Skill
                </Button>
              </div>
            </DraggableSection>
            
            {/* Projects Section */}
            <DraggableSection 
              title="Projects" 
              isOpen={openSections.projects}
              toggleOpen={() => toggleSection('projects')}
            >
              <div className="space-y-4">
                {userData.sections.projects && userData.sections.projects.map(item => (
                  <DraggableItem 
                    key={item.id} 
                    item={item} 
                    type="projects" 
                    onDrop={handleDrop}
                    userData={userData}
                    setUserData={setUserData}
                    resumeContent={resumeContent}
                    onDelete={(id) => deleteItemFromPanel('projects', id)}
                  />
                ))}
                
                <Button variant="outline" size="sm" className="w-full" onClick={addProject}>
                  <Plus className="mr-1 h-4 w-4" /> Add Project
                </Button>
              </div>
            </DraggableSection>
            
            {/* Certifications Section */}
            <DraggableSection 
              title="Certifications" 
              isOpen={openSections.certifications}
              toggleOpen={() => toggleSection('certifications')}
            >
              <div className="space-y-4">
                {userData.sections.certifications && userData.sections.certifications.map(item => (
                  <DraggableItem 
                    key={item.id} 
                    item={item} 
                    type="certifications" 
                    onDrop={handleDrop}
                    userData={userData}
                    setUserData={setUserData}
                    resumeContent={resumeContent}
                    onDelete={(id) => deleteItemFromPanel('certifications', id)}
                  />
                ))}
                
                <Button variant="outline" size="sm" className="w-full" onClick={addCertification}>
                  <Plus className="mr-1 h-4 w-4" /> Add Certification
                </Button>
              </div>
            </DraggableSection>
          </div>
          
          {/* Right side - Resume preview */}
          <div className="flex flex-col overflow-y-auto max-h-[calc(100vh-180px)] overflow-x-visible">
            <div className="w-full flex flex-col md:flex-row justify-between items-center mb-4">
              <ZoomControls 
                zoomLevel={zoomLevel}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                autoScalingEnabled={autoScalingEnabled}
                onToggleAutoScaling={handleToggleAutoScaling}
              />
            </div>
            
            <HybridResumeEditor
              onDrop={handleDrop}
              resumeContent={resumeContent}
              removeSection={removeSection}
              reorderSections={reorderSections}
              reorderSectionItems={reorderSectionItems}
              setResumeContent={setResumeContent}
              resumeRef={resumeRef}
              zoomLevel={zoomLevel}
              selectedTemplate={template}
            />
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Add Skill Dialog */}
      <AddSkillDialog
        isOpen={isAddSkillDialogOpen}
        onClose={() => setIsAddSkillDialogOpen(false)}
        onAdd={addSkill}
      />
      
      {/* Export Dialog */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={closeExportDialog}
        pageFormat={pageFormat}
        onPageFormatChange={handlePageFormatChange}
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
      />
      
      {/* Add a loading indicator for template loading */}
      {templateLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading template...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap the Editor with providers
export default function Editor() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ResumeProvider>
        <EditorContent />
      </ResumeProvider>
    </DndProvider>
  );
}