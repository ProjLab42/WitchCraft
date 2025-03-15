import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Download, Plus, Edit } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Link } from "react-router-dom";

// Import our new components
import { ResumeProvider, useResumeContext } from "@/components/resume-editor/ResumeContext";
import { DraggableSection } from "@/components/resume-editor/DraggableSection";
import { DraggableItem } from "@/components/resume-editor/DraggableItem";
import { ResumeDropZone } from "@/components/resume-editor/ResumeDropZone";
import { AddSkillDialog } from "@/components/resume-editor/AddSkillDialog";
import { ExportDialog } from "@/components/resume-editor/ExportDialog";
import { PersonalInfoEditor } from "@/components/resume-editor/PersonalInfoEditor";
import { ZoomControls } from "@/components/resume-editor/ZoomControls";
import { exportAsPDF, exportAsDOCX, generateId } from "@/components/resume-editor/utils";

// Main Editor component
function EditorContent() {
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
    isExportDialogOpen,
    setIsExportDialogOpen
  } = useResumeContext();

  // Local state
  const [isAddSkillDialogOpen, setIsAddSkillDialogOpen] = useState(false);
  const resumeRef = useRef(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

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
    // Check if the item already exists in the resume
    const existingItemIndex = resumeContent.sections.findIndex(
      section => section.id === item.id
    );
    
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
      // Add new item
      setResumeContent(prev => {
        // Create a new sections array with the new item
        const newSections = [...prev.sections, { ...item }];
        
        // Create or update the section order if needed
        let newSectionOrder = [...(prev.sectionOrder || [])];
        if (!newSectionOrder.includes(item.itemType)) {
          newSectionOrder.push(item.itemType);
        }
        
        return {
          ...prev,
          sections: newSections,
          sectionOrder: newSectionOrder
        };
      });
      
      toast.success("Item added to resume");
    }
  };
  
  // Remove a section from the resume
  const removeSection = (id) => {
    setResumeContent(prev => {
      // Find the section to remove
      const sectionToRemove = prev.sections.find(section => section.id === id);
      
      // Filter out the section
      const newSections = prev.sections.filter(section => section.id !== id);
      
      // Check if we need to update the section order
      let newSectionOrder = [...prev.sectionOrder];
      
      // If this was the last item of its type, remove the type from the order
      if (sectionToRemove) {
        const sectionType = sectionToRemove.itemType;
        const hasMoreOfType = newSections.some(section => section.itemType === sectionType);
        
        if (!hasMoreOfType && sectionType !== 'skills') {
          newSectionOrder = newSectionOrder.filter(type => type !== sectionType);
        }
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
  
  // Export as PDF
  const handleExportPDF = async () => {
    const success = await exportAsPDF(resumeRef, pageFormat);
    
    if (success) {
      toast.success("Resume exported as PDF");
      closeExportDialog();
    } else {
      toast.error("Failed to export PDF");
    }
    
    return success;
  };
  
  // Export as DOCX
  const handleExportDOCX = async () => {
    const success = await exportAsDOCX(resumeContent, pageFormat);
    
    if (success) {
      toast.success("Resume exported as DOCX");
      closeExportDialog();
    } else {
      toast.error("Failed to export DOCX");
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Resume Builder</h1>
          
          <div className="flex gap-2">
            <Button onClick={openExportDialog}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            <Link to="/">
              <Button variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-[350px_1fr] gap-6">
          {/* Left sidebar */}
          <div className="space-y-6">
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
          <div className="flex flex-col">
            <div className="flex justify-end mb-4">
              <ZoomControls
                zoomLevel={zoomLevel}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
              />
            </div>
            
            <ResumeDropZone
              onDrop={handleDrop}
              resumeContent={resumeContent}
              removeSection={removeSection}
              reorderSections={reorderSections}
              reorderSectionItems={reorderSectionItems}
              userData={userData}
              setUserData={setUserData}
              setResumeContent={setResumeContent}
              resumeRef={resumeRef}
              zoomLevel={zoomLevel}
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