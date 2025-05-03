import { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Plus, Edit, ArrowLeft, Save, Eye } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Link, useSearchParams, useLocation, useNavigate } from "react-router-dom";

// Import our new components
import { ResumeProvider, useResumeContext } from "@/components/resume-editor/ResumeContext";
import { DraggableSection } from "@/components/resume-editor/DraggableSection";
import { DraggableItem } from "@/components/resume-editor/DraggableItem";
import { ResumeDropZone } from "@/components/resume-editor/ResumeDropZone";
import { ReorderableResume } from "@/components/resume-editor/ReorderableResume";
import { HybridResumeEditor } from "@/components/resume-editor/HybridResumeEditor";
import { AddSkillDialog } from "@/components/resume-editor/AddSkillDialog";
import { PersonalInfoEditor } from "@/components/resume-editor/PersonalInfoEditor";
import { ZoomControls } from "@/components/resume-editor/ZoomControls";
import { generateId } from "@/components/resume-editor/utils";
import { templateService, Template } from "@/services/template.service";
import { resumeAPI, ApiResumeData } from "@/services/api.service";
import { SaveResumeDialog } from "@/components/resume-editor/SaveResumeDialog"; // Import the new dialog
import { SkillItem } from "@/components/resume-editor/ResumeContext"; // Import SkillItem
import { ExperienceItem, EducationItem, ProjectItem, CertificationItem } from "@/components/resume-editor/ResumeContext"; // Import specific item types from context or types file

// Main Editor component
function EditorContent() {
  // Get URL parameters
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get('template');
  const resumeIdParam = searchParams.get('resumeId'); // Get resumeId from URL
  const location = useLocation();
  const navigate = useNavigate(); // Add navigate hook
  
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
    pageFormat,
    setPageFormat,
    selectedTemplate,
    setSelectedTemplate,
    templateStyles
  } = useResumeContext();

  // Local state
  const [isAddSkillDialogOpen, setIsAddSkillDialogOpen] = useState(false);
  const resumeRef = useRef(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // State for current resume ID (from DB)
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState<boolean>(false); // Loading state for resume fetch
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false); // State for save dialog
  const [currentResumeTitle, setCurrentResumeTitle] = useState<string>('');
  const [resumeData, setResumeData] = useState<ApiResumeData | null>(null);

  // --- Effect to Load Resume Data --- 
  useEffect(() => {
    const loadResume = async () => {
      if (resumeIdParam) {
        console.log(`Loading resume with ID: ${resumeIdParam}`);
        setIsLoadingResume(true);
        try {
          const loadedResume: ApiResumeData = await resumeAPI.getResumeById(resumeIdParam);
          console.log('Loaded Resume Data:', loadedResume);

          if (!loadedResume) {
            toast.error("Resume not found.");
            navigate('/my-resumes'); // Redirect if not found
            return;
          }

          // --- Populate Context State --- 
          setResumeId(loadedResume._id);
          setSelectedTemplate(loadedResume.template);
          
          // Store the full resume data
          setResumeData(loadedResume);
          
          // Set the current resume title
          setCurrentResumeTitle(loadedResume.title);
          console.log(`Set current resume title to: ${loadedResume.title}`);

          // --- Merge loaded sections into userData ---
          setUserData(prevUserData => {
            const mergedSections = { ...prevUserData.sections };
            
            // Helper to update or add loaded items to an existing array
            const updateOrAdd = (targetArray: any[] = [], loadedItems: any[] = []) => {
              const targetMap = new Map(targetArray.map(item => [item.id, item]));
              loadedItems.forEach(loadedItem => {
                // Add or overwrite item from loaded data
                targetMap.set(loadedItem.id, loadedItem); 
              });
              return Array.from(targetMap.values());
            };

            // Merge loaded Experience into existing
            mergedSections.experience = updateOrAdd(
              prevUserData.sections.experience, 
              loadedResume.sections?.experience
            );
             // Merge loaded Education into existing
            mergedSections.education = updateOrAdd(
              prevUserData.sections.education, 
              loadedResume.sections?.education
            );
             // Merge loaded Projects into existing
            mergedSections.projects = updateOrAdd(
              prevUserData.sections.projects, 
              loadedResume.sections?.projects
            );
              // Merge loaded Certifications into existing
            mergedSections.certifications = updateOrAdd(
              prevUserData.sections.certifications, 
              loadedResume.sections?.certifications
            );
              // Merge loaded Skills into existing skills
            const loadedSkillsAsUserDataFormat = loadedResume.sections?.skills?.map(s => ({ id: s.name, name: s.name, level: 50 })) ?? [];
            const updatedSkills = updateOrAdd(
                prevUserData.skills, 
                loadedSkillsAsUserDataFormat
            );

            return {
              ...prevUserData,
              // Keep existing personal info from prevUserData unless explicitly loaded (optional)
              name: loadedResume.data?.name ?? prevUserData.name,
              title: loadedResume.data?.jobTitle ?? prevUserData.title,
              email: loadedResume.data?.email ?? prevUserData.email,
              location: loadedResume.data?.location ?? prevUserData.location,
              links: {
                  ...prevUserData.links,
                  linkedin: loadedResume.data?.linkedin ?? prevUserData.links?.linkedin,
                  portfolio: loadedResume.data?.website ?? prevUserData.links?.portfolio,
              },
              sections: mergedSections, // Use the correctly merged sections
              skills: updatedSkills // Use the correctly merged skills
            };
          });
          // --- End Merge ---

          // Populate resume content state (This remains largely the same)
          console.log("[loadResume] Raw loadedResume.sections.education:", loadedResume.sections?.education);
          
          // --- Explicitly build loadedSections --- 
          let sectionsForState: any[] = [];
          if (loadedResume.sections?.experience) {
            sectionsForState = sectionsForState.concat(
              loadedResume.sections.experience.map(item => ({ ...item, itemType: 'experience' }))
            );
          }
          if (loadedResume.sections?.education) {
            sectionsForState = sectionsForState.concat(
              loadedResume.sections.education.map(item => ({ ...item, itemType: 'education' }))
            );
          }
          if (loadedResume.sections?.projects) {
            sectionsForState = sectionsForState.concat(
              loadedResume.sections.projects.map(item => ({
                ...item,
                itemType: 'projects',
                name: item.name,
                role: item.role,
                period: item.period,
                description: item.description,
                id: item.id || generateId('proj')
              }))
            );
          }
          if (loadedResume.sections?.certifications) {
            sectionsForState = sectionsForState.concat(
              loadedResume.sections.certifications.map(item => ({ ...item, itemType: 'certifications' }))
            );
          }
          // Add other standard sections if needed
          console.log("[loadResume] Final sectionsForState set to resumeContent:", sectionsForState); // Use new variable name in log

          // Derive section order from loaded sections or use a default
          const derivedSectionOrder = sectionsForState.map(s => s.itemType).filter((value, index, self) => self.indexOf(value) === index); // Use sectionsForState
          // Or use a fixed default: const defaultOrder = ['experience', 'education', 'skills', 'projects', 'certifications'];

          // --- Use Saved or Derived Section Order --- 
          const loadedSectionOrder = loadedResume.sectionOrder && loadedResume.sectionOrder.length > 0
            ? loadedResume.sectionOrder 
            : derivedSectionOrder; 

          // Map loaded skills and generate initial paragraph
          const loadedSkills: SkillItem[] = loadedResume.sections?.skills?.map(s => ({ 
            id: s.name, 
            name: s.name,
            level: 50 
          })) ?? [];
          const initialSkillsParagraph = generateSkillsParagraph(loadedSkills);

          const newResumeContent = {
            personalInfo: { // Map to PersonalInfo structure
               name: loadedResume.data?.name ?? '',
               title: loadedResume.data?.jobTitle ?? '',
               email: loadedResume.data?.email ?? '',
               location: loadedResume.data?.location ?? '',
               phone: loadedResume.data?.phone ?? undefined, // Add optional phone
               summary: loadedResume.data?.summary ?? undefined, // Add optional summary
               links: { // Map links
                 linkedin: loadedResume.data?.linkedin ?? undefined,
                 portfolio: loadedResume.data?.website ?? undefined, // Map website to portfolio
                 additionalLinks: [], // Assuming not saved/loaded per resume
               }
            },
            sections: sectionsForState, // Use the explicitly built array
            selectedSkills: loadedSkills, // Use mapped skills
            skillsParagraph: initialSkillsParagraph, // Set initial paragraph
            sectionOrder: loadedSectionOrder, // Use loaded or derived order
          };
          setResumeContent(newResumeContent);
          
          toast.success(`Resume "${loadedResume.title}" loaded successfully.`);

        } catch (error) {
          console.error("Failed to load resume:", error);
          toast.error("Failed to load resume. Please try again.");
          // Redirect back if loading fails
          navigate('/my-resumes'); 
        } finally {
          setIsLoadingResume(false);
        }
      } else {
        // If no resumeIdParam, ensure local resumeId state is null (for new resumes)
        setResumeId(null);
        // Optionally reset context state here if needed when navigating to /editor for a new resume
        // resetResumeContext(); // Hypothetical function
        // Ensure skills paragraph is null for new resumes
        setResumeContent(prev => ({
          ...prev,
          selectedSkills: [],
          skillsParagraph: null,
          // Reset other fields as necessary
        }));
      }
    };

    loadResume();
  }, [resumeIdParam, setUserData, setResumeContent, setSelectedTemplate, navigate]);

  // --- End Load Resume Effect --- 

  // Fetch template data when templateParam or selectedTemplate changes
  useEffect(() => {
    const templateIdToFetch = selectedTemplate || templateParam;
    const fetchTemplate = async () => {
      if (!templateIdToFetch) {
        // ... handle default template ...
        return;
      }
      try {
        setTemplateLoading(true);
        setTemplateError(null);
        const fetchedTemplateData = await templateService.getTemplateById(templateIdToFetch);
        // Fix: Use fetchedTemplateData instead of templateData
        if (!fetchedTemplateData || !fetchedTemplateData.styles) { 
          throw new Error('Invalid template data received');
        }
        setTemplate(fetchedTemplateData); 
      } catch (error) {
        console.error('Error fetching template:', error);
        setTemplateError('Failed to load template. Using default styling.');
        // ... fallback logic ...
      } finally {
        setTemplateLoading(false);
      }
    };
    fetchTemplate();
  }, [templateParam, selectedTemplate]);

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

  // Handle generated resume data from AI
  useEffect(() => {
    if (location.state?.generatedResume) {
      const { generatedResume } = location.state;
      
      // Convert AI-generated resume data to editor format
      const generatedSkills: SkillItem[] = generatedResume.resumeData.sections.skills || [];
      const generatedSkillsParagraph = generateSkillsParagraph(generatedSkills);
      
      const newResumeContent = {
        personalInfo: {
          name: userData.name || '',
          title: userData.title || '',
          email: userData.email || '',
          location: userData.location || '',
          links: userData.links || {}
        },
        sections: [
          ...(generatedResume.resumeData.sections.experience || []).map(exp => ({
            ...exp,
            itemType: 'experience'
          })),
          ...(generatedResume.resumeData.sections.education || []).map(edu => ({
            ...edu,
            itemType: 'education'
          })),
          ...(generatedResume.resumeData.sections.projects || []).map(proj => ({
            ...proj,
            itemType: 'projects'
          })),
          ...(generatedResume.resumeData.sections.certifications || []).map(cert => ({
            ...cert,
            itemType: 'certifications'
          }))
        ],
        selectedSkills: generatedSkills, // Use generated skills
        skillsParagraph: generatedSkillsParagraph, // Set generated paragraph
        sectionOrder: ['experience', 'education', 'skills', 'projects', 'certifications']
      };

      setResumeContent(newResumeContent);
      
      // Clear the state to prevent re-processing on re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setResumeContent, userData]);

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
    
    setResumeContent(prev => {
      console.log("[Editor.tsx] Updating sectionOrder from:", prev.sectionOrder, "to:", newOrder);
      return {
        ...prev,
        sectionOrder: newOrder
      };
    });
  };
  
  // Handle dropping an item onto the resume
  const handleDrop = useCallback((item) => {
    console.log("--- handleDrop START ---"); // Log start
    console.log("Dropping item:", item);
    console.log("Current resumeContent.sections IDs BEFORE check:", 
      resumeContent.sections.map(s => s.id) // Log current IDs
    );

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
      // Check if a similar item already exists based on content
      console.log("Calling checkForDuplicate with:", item, resumeContent.sections.map(s => s.id)); // Log before check
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
    console.log("--- handleDrop END ---"); // Log end
  }, [resumeContent, setResumeContent]);
  
  // Helper function to check if an item is a duplicate
  const checkForDuplicate = useCallback((newItem, existingSections) => {
    console.log("Checking for duplicate:", newItem);
    console.log("Against existing sections:", existingSections);

    // Find if an item with the same CONTENT already exists in the resume preview
    const duplicateInResume = existingSections.find(section => {
        if (section.itemType !== newItem.itemType) return false;
        
        // Compare based on content, not ID
        switch (newItem.itemType) {
            case 'experience':
                const expSection = section as any;
                const expNewItem = newItem as any;
                return expSection.company?.toLowerCase() === expNewItem.company?.toLowerCase() &&
                       expSection.title?.toLowerCase() === expNewItem.title?.toLowerCase() &&
                       expSection.period === expNewItem.period;
            case 'education':
                const eduSection = section as any;
                const eduNewItem = newItem as any;
                // Log specific fields being compared
                console.log(`[checkForDuplicate EDU] Comparing:`, 
                  `\n  Section: Inst=${eduSection.institution}, Deg=${eduSection.degree}, Year=${eduSection.year}`,
                  `\n  NewItem: Inst=${eduNewItem.institution}, Deg=${eduNewItem.degree}, Year=${eduNewItem.year}`
                );
                return eduSection.institution?.toLowerCase() === eduNewItem.institution?.toLowerCase() &&
                       eduSection.degree?.toLowerCase() === eduNewItem.degree?.toLowerCase() &&
                       eduSection.year === eduNewItem.year; // Use year for comparison
            case 'projects':
                const projSection = section as any;
                const projNewItem = newItem as any;
                return projSection.name?.toLowerCase() === projNewItem.name?.toLowerCase() &&
                       projSection.role?.toLowerCase() === projNewItem.role?.toLowerCase();
            case 'certifications':
                const certSection = section as any;
                const certNewItem = newItem as any;
                return certSection.name?.toLowerCase() === certNewItem.name?.toLowerCase() &&
                       certSection.issuer?.toLowerCase() === certNewItem.issuer?.toLowerCase();
            default:
                return false;
        }
    });

    console.log("Duplicate found in resume content:", duplicateInResume);
    return !!duplicateInResume; // Return true if a duplicate based on content exists in the resume
  }, []);
  
  // Remove a section from the resume
  const removeSection = useCallback((id) => {
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
  }, [resumeContent, setResumeContent]);
  
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
      year: "20XX - 20XX",
      description: "Describe your education, achievements, GPA, etc.",
      itemType: "education"
    };
    
    // Check if a similar education already exists in userData
    const isDuplicateInUserData = userData.sections.education && userData.sections.education.some(edu => 
      edu.institution.toLowerCase() === newEducation.institution.toLowerCase() &&
      edu.degree.toLowerCase() === newEducation.degree.toLowerCase() &&
      edu.year === newEducation.year
    );
    
    // Also check if it already exists in resumeContent
    const isDuplicateInResume = resumeContent.sections.some(section => {
      if (section.itemType !== 'education') return false;
      
      // Type assertion to access education-specific properties
      const eduSection = section as any;
      
      return eduSection.institution?.toLowerCase() === newEducation.institution.toLowerCase() &&
             eduSection.degree?.toLowerCase() === newEducation.degree.toLowerCase() &&
             eduSection.year === newEducation.year;
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
  
  // Helper function to generate comma-separated skills string
  const generateSkillsParagraph = (skills: SkillItem[]): string | null => {
    if (!skills || skills.length === 0) {
      return null;
    }
    // Extract names, maintaining the order in the array, and join with ', '
    return skills.map(skill => skill.name).join(', '); 
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
          toast.error("This skill is already selected");
          return prev; 
        }
        
        // Add skill
        selectedSkills.push(skill);
      }
      
      let newSectionOrder = [...prev.sectionOrder];
      if (selectedSkills.length > 0 && !newSectionOrder.includes('skills')) {
        newSectionOrder.push('skills');
      } else if (selectedSkills.length === 0 && newSectionOrder.includes('skills')) {
        newSectionOrder = newSectionOrder.filter(type => type !== 'skills');
      }
      
      // Update skillsParagraph
      const newSkillsParagraph = generateSkillsParagraph(selectedSkills);
      
      return {
        ...prev,
        selectedSkills,
        skillsParagraph: newSkillsParagraph, // Update paragraph
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
      
      let newSectionOrder = [...prev.sectionOrder];
      if (!newSectionOrder.includes('skills')) {
        newSectionOrder.push('skills');
      }
      
      // Update skillsParagraph
      const newSkillsParagraph = generateSkillsParagraph(selectedSkills);
      
      return {
        ...prev,
        selectedSkills,
        skillsParagraph: newSkillsParagraph, // Update paragraph
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
      let itemsToReorder;
      let keyToUpdate;
      let requiresParagraphUpdate = false; // Flag for skills

      if (sectionType === 'skills') {
        itemsToReorder = [...prev.selectedSkills];
        keyToUpdate = 'selectedSkills';
        requiresParagraphUpdate = true; // Skills are being reordered
      } else {
        // Find the correct section array based on itemType
        const section = prev.sections.find(s => s.itemType === sectionType);
        if (!section) return prev; // Should not happen

        // Assuming sections store their items directly (adjust if structure differs)
        // This part needs verification based on actual structure if items aren't direct children
        itemsToReorder = [...prev.sections.filter(s => s.itemType === sectionType)];
        keyToUpdate = 'sections'; // We'll need to update the whole sections array
      }

      if (!itemsToReorder) return prev;

      const [removed] = itemsToReorder.splice(sourceIndex, 1);
      itemsToReorder.splice(destinationIndex, 0, removed);

      if (keyToUpdate === 'sections') {
        // Rebuild the sections array if we modified a standard section
        const otherSections = prev.sections.filter(s => s.itemType !== sectionType);
        const updatedSections = [...otherSections, ...itemsToReorder];
        
        // We might need to re-sort updatedSections based on sectionOrder here
        // For simplicity, assuming direct update works for now.

        return { ...prev, sections: updatedSections };
      } else if (keyToUpdate === 'selectedSkills') {
         // Update skillsParagraph if skills were reordered
         const newSkillsParagraph = requiresParagraphUpdate 
           ? generateSkillsParagraph(itemsToReorder as SkillItem[]) 
           : prev.skillsParagraph;

         return { 
           ...prev, 
           selectedSkills: itemsToReorder as SkillItem[],
           skillsParagraph: newSkillsParagraph // Update paragraph
         };
      }
      
      return prev; // Should not reach here ideally
    });
  };

  // Move section up
  const moveSectionUp = (index) => {
    console.log("Moving section UP, index:", index);
    if (index > 0) {
      reorderSections(index, index - 1);
    }
  };

  // Move section down
  const moveSectionDown = (index) => {
    console.log("Moving section DOWN, index:", index);
    if (index < resumeContent.sectionOrder.length - 1) {
      reorderSections(index, index + 1);
    }
  };

  // Move item up within a section
  const moveItemUp = (sectionType, index) => {
    console.log("Moving item UP, type:", sectionType, "index:", index);
    if (index > 0) {
      reorderSectionItems(sectionType, index, index - 1);
    }
  };

  // Move item down within a section
  const moveItemDown = (sectionType, index) => {
    console.log("Moving item DOWN, type:", sectionType, "index:", index);
    let itemCount;
    if (sectionType === 'skills') {
      itemCount = resumeContent.selectedSkills.length;
    } else {
      itemCount = resumeContent.sections.filter(s => s.itemType === sectionType).length;
    }
    
    if (index < itemCount - 1) {
      reorderSectionItems(sectionType, index, index + 1);
    }
  };
  
  // Renamed from saveResumeState, now accepts name from dialog
  const handleConfirmSave = async (newName: string): Promise<ApiResumeData | null> => {
    console.log("Saving resume state with name:", newName);
    // Add a loading state for saving if needed
    const savingToast = toast.loading("Saving project...");

    // Construct data using newName
    const resumeDataToSave = {
      title: newName, // Use name from dialog
      template: selectedTemplate || 'default',
      data: { 
        name: resumeContent.personalInfo?.name,
        jobTitle: resumeContent.personalInfo?.title,
        email: resumeContent.personalInfo?.email,
        phone: resumeContent.personalInfo?.phone,
        linkedin: resumeContent.personalInfo?.links?.linkedin,
        website: resumeContent.personalInfo?.links?.portfolio,
        location: resumeContent.personalInfo?.location,
        summary: resumeContent.personalInfo?.summary,
      },
      sections: { 
        experience: resumeContent.sections
          .filter(s => s.itemType === 'experience')
          .map(exp => ({
            id: (exp as ExperienceItem).id, 
            title: (exp as ExperienceItem).title, 
            company: (exp as ExperienceItem).company, 
            period: (exp as ExperienceItem).period, 
            description: (exp as ExperienceItem).description,
          })),
        education: resumeContent.sections
          .filter(s => s.itemType === 'education')
          .map(edu => ({ 
            id: (edu as EducationItem).id, 
            institution: (edu as EducationItem).institution, 
            degree: (edu as EducationItem).degree,
            year: (edu as EducationItem).year,
            description: (edu as EducationItem).description,
          })),
        skills: resumeContent.selectedSkills?.map(skill => ({ name: skill.name })) ?? [], 
        projects: resumeContent.sections
          .filter(s => s.itemType === 'projects')
          .map(proj => ({ 
            id: (proj as ProjectItem).id, 
            name: (proj as ProjectItem).name, 
            description: (proj as ProjectItem).description, 
            role: (proj as ProjectItem).role,
          })),
        certifications: resumeContent.sections
          .filter(s => s.itemType === 'certifications')
           .map(cert => ({ 
             id: (cert as CertificationItem).id, 
             name: (cert as CertificationItem).name, 
             issuer: (cert as CertificationItem).issuer, 
             date: (cert as CertificationItem).date,
           })),
      },
    };
    
    // --- Debugging Log ---
    console.log("[handleConfirmSave] Education data being sent to backend:", resumeDataToSave.sections.education);

    console.log("Data to save:", resumeDataToSave);

    try {
      let savedResume: ApiResumeData | null = null; 
      if (resumeId) {
        savedResume = await resumeAPI.updateResume(resumeId, resumeDataToSave);
        if (savedResume) { 
          toast.success(`Resume "${savedResume.title}" updated successfully!`);
          setCurrentResumeTitle(savedResume.title); // Update title state
        } else {
          toast.error("Failed to update resume.");
        }
      } else {
        savedResume = await resumeAPI.createResume(resumeDataToSave);
        if (savedResume?._id) { 
          setResumeId(savedResume._id); // Set the new ID
          setCurrentResumeTitle(savedResume.title); // Update title state
          toast.success(`Resume "${savedResume.title}" saved successfully!`);
          // Update URL without reload to reflect new state (optional but good UX)
          navigate(`/editor?resumeId=${savedResume._id}`, { replace: true });
        } else {
           toast.error("Failed to save new resume.");
        }
      }
      // Close dialog only on success
      if (savedResume) {
          setIsSaveDialogOpen(false); 
          return savedResume; // Return saved data
      }
      return null; // Return null if save wasn't fully successful

    } catch (error) {
      console.error("Failed to save resume:", error);
      toast.error("Failed to save resume. Please try again.");
      return null; // Return null on error
    } finally {
      toast.dismiss(savingToast);
    }
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

  // --- Function to open the save dialog --- 
  const openSaveDialog = () => {
     // Pre-fill with current title if it exists (from loaded or previously saved)
     // Or generate a default title based on personal info name
     const titleToEdit = currentResumeTitle || 
                         resumeContent?.personalInfo?.name 
                         ? `${resumeContent.personalInfo.name}'s Resume` 
                         : "Untitled Resume"; // Changed default
     setCurrentResumeTitle(titleToEdit);
     setIsSaveDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container py-8 pb-16">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {/* Add link back to My Resumes if loaded from there */}
            {resumeIdParam && (
              <Link to="/my-resumes" className="p-2 rounded-md hover:bg-accent">
                 <ArrowLeft size={16} />
              </Link>
            )}
            <h1 className="text-2xl font-bold">Resume Builder</h1>
            {templateError && (
              <span className="text-sm text-destructive">{templateError}</span>
            )}
          </div>
          
          <div className="flex gap-2">
            {/* Add Preview Button Here */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { 
                if (resumeId) {
                  window.open(`/preview/${resumeId}`, '_blank'); 
                } else {
                  toast.error("Please save the resume first to enable preview.");
                }
              }}
              disabled={!resumeId || isLoadingResume} 
              title="Preview in new tab"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            {/* Existing Save Button */}
            <Button onClick={openSaveDialog} variant="default">
              <Save className="mr-2 h-4 w-4" />
              Save Project
            </Button>
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
              />
            </div>
            
            {templateLoading ? (
              <p>Loading template...</p>
            ) : templateError ? (
              <p className="text-red-500">{templateError}</p>
            ) : (
              <HybridResumeEditor
                onDrop={handleDrop}
                resumeContent={resumeContent}
                removeSection={removeSection}
                moveSectionUp={moveSectionUp}
                moveSectionDown={moveSectionDown}
                moveItemUp={moveItemUp}
                moveItemDown={moveItemDown}
                setResumeContent={setResumeContent}
                resumeRef={resumeRef}
                zoomLevel={zoomLevel}
                selectedTemplate={template}
              />
            )}
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
      
      {/* Render the Save Dialog */}
      <SaveResumeDialog 
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleConfirmSave} // Pass the renamed save handler
        currentName={currentResumeTitle} 
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
