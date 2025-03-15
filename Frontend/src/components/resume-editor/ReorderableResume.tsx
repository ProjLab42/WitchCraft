import React from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { Edit, Trash, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeContent, SkillItem } from './ResumeContext';
import { useDrop } from 'react-dnd';

interface ReorderableResumeProps {
  resumeContent: ResumeContent;
  removeSection: (id: string) => void;
  setResumeContent: React.Dispatch<React.SetStateAction<ResumeContent>>;
  resumeRef: React.RefObject<HTMLDivElement>;
  zoomLevel: number;
  onDrop: (item: any) => void;
}

// Animation variants for sections and items
const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  hover: { scale: 1.01, transition: { duration: 0.1 } }
};

const itemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
  hover: { scale: 1.01, boxShadow: "0 4px 8px rgba(0,0,0,0.1)", transition: { duration: 0.1 } }
};

export const ReorderableResume: React.FC<ReorderableResumeProps> = ({
  resumeContent,
  removeSection,
  setResumeContent,
  resumeRef,
  zoomLevel,
  onDrop
}) => {
  // Set up drop target for items from the left panel
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'RESUME_ITEM',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Get all selected skills
  const selectedSkills = resumeContent.selectedSkills || [];

  // Group sections by type
  const groupedSections = resumeContent.sections.reduce((acc, section) => {
    if (!acc[section.itemType]) {
      acc[section.itemType] = [];
    }
    acc[section.itemType].push(section);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Create ordered sections array
  let allSections = [];
  
  // If we have a custom order, use it
  if (resumeContent.sectionOrder && resumeContent.sectionOrder.length > 0) {
    resumeContent.sectionOrder.forEach(sectionType => {
      if (sectionType === 'skills' && selectedSkills.length > 0) {
        allSections.push({ type: 'skills', items: selectedSkills });
      } else if (groupedSections[sectionType]) {
        allSections.push({ type: sectionType, items: groupedSections[sectionType] });
      }
    });
    
    // Add any sections that might not be in the order yet
    Object.entries(groupedSections).forEach(([type, items]) => {
      if (!resumeContent.sectionOrder.includes(type)) {
        allSections.push({ type, items });
      }
    });
    
    // Add skills if not already added
    if (!resumeContent.sectionOrder.includes('skills') && selectedSkills.length > 0) {
      allSections.push({ type: 'skills', items: selectedSkills });
    }
  } else {
    // Default ordering if no custom order exists
    Object.entries(groupedSections).forEach(([type, items]) => {
      allSections.push({ type, items });
    });
    
    if (selectedSkills.length > 0) {
      allSections.push({ type: 'skills', items: selectedSkills });
    }
  }

  // Handle reordering of sections
  const handleSectionReorder = (newOrder) => {
    // Extract just the section types from the reordered sections
    const newSectionOrder = newOrder.map(section => section.type);
    
    setResumeContent(prev => ({
      ...prev,
      sectionOrder: newSectionOrder
    }));
  };

  // Handle reordering of items within a section
  const handleItemsReorder = (sectionType, newItems) => {
    if (sectionType === 'skills') {
      // Handle skills reordering
      setResumeContent(prev => ({
        ...prev,
        selectedSkills: newItems
      }));
      return;
    }

    // For other section types, we need to update the sections array
    // while preserving items from other section types
    setResumeContent(prev => {
      // Get all items that are not of this section type
      const otherSections = prev.sections.filter(
        section => section.itemType !== sectionType
      );
      
      // Combine with the reordered items
      return {
        ...prev,
        sections: [...otherSections, ...newItems]
      };
    });
  };

  // Render section title
  const renderSectionTitle = (type: string) => {
    switch (type) {
      case 'experience':
        return 'Experience';
      case 'education':
        return 'Education';
      case 'projects':
        return 'Projects';
      case 'certifications':
        return 'Certifications';
      case 'skills':
        return 'Skills';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Render section content
  const renderSectionContent = (type: string, items: any[]) => {
    if (type === 'skills') {
      return (
        <Reorder.Group 
          axis="x" 
          values={items} 
          onReorder={(newItems) => handleItemsReorder(type, newItems)}
          className="flex flex-wrap gap-2 mt-2"
        >
          {items.map((skill: SkillItem) => (
            <Reorder.Item
              key={skill.id}
              value={skill}
              dragListener={true}
              dragControls={useDragControls()}
              className="px-3 py-1 bg-muted rounded-full text-sm cursor-grab active:cursor-grabbing"
            >
              {skill.name}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      );
    }

    return (
      <Reorder.Group 
        axis="y" 
        values={items} 
        onReorder={(newItems) => handleItemsReorder(type, newItems)}
        className="space-y-3 mt-2"
      >
        {items.map((item) => (
          <Reorder.Item
            key={item.id}
            value={item}
            dragListener={true}
            dragControls={useDragControls()}
            className="p-3 border rounded-md bg-card cursor-grab active:cursor-grabbing"
          >
            {type === 'experience' && (
              <div>
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{item.company}</h4>
                    <p className="text-sm italic">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.period}</p>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical size={14} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(item.id);
                      }}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
                <p className="text-sm mt-2">{item.description}</p>
              </div>
            )}
            
            {type === 'education' && (
              <div>
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{item.institution}</h4>
                    <p className="text-sm italic">{item.degree}</p>
                    <p className="text-xs text-muted-foreground">{item.period}</p>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical size={14} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(item.id);
                      }}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
                <p className="text-sm mt-2">{item.description}</p>
              </div>
            )}
            
            {type === 'projects' && (
              <div>
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm italic">{item.role}</p>
                    <p className="text-xs text-muted-foreground">{item.period}</p>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical size={14} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(item.id);
                      }}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
                <p className="text-sm mt-2">{item.description}</p>
              </div>
            )}
            
            {type === 'certifications' && (
              <div>
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm italic">{item.issuer}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical size={14} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(item.id);
                      }}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
                <p className="text-sm mt-2">{item.description}</p>
              </div>
            )}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    );
  };

  return (
    <div 
      ref={(node) => {
        // Combine the drop ref for react-dnd with the resumeRef
        drop(node);
        if (resumeRef) {
          // @ts-ignore - This is a valid way to set the ref
          resumeRef.current = node;
        }
      }}
      className={`bg-white border rounded-md shadow-sm p-8 w-full max-w-[21cm] mx-auto transition-all ${isOver ? 'ring-2 ring-primary' : ''}`}
      style={{ 
        transform: `scale(${zoomLevel})`, 
        transformOrigin: 'top center',
        minHeight: '29.7cm',
        width: '21cm'
      }}
    >
      {/* Personal Info */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">{resumeContent.personalInfo.name}</h1>
        <p className="text-lg text-muted-foreground">{resumeContent.personalInfo.title}</p>
        
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
          {resumeContent.personalInfo.email && (
            <p>{resumeContent.personalInfo.email}</p>
          )}
          {resumeContent.personalInfo.location && (
            <p>{resumeContent.personalInfo.location}</p>
          )}
        </div>
        
        <div className="flex gap-2 mt-2">
          {resumeContent.personalInfo.links?.linkedin && (
            <p className="text-sm">LinkedIn: {resumeContent.personalInfo.links.linkedin}</p>
          )}
          {resumeContent.personalInfo.links?.portfolio && (
            <p className="text-sm">Portfolio: {resumeContent.personalInfo.links.portfolio}</p>
          )}
          {resumeContent.personalInfo.links?.additionalLinks?.map((link, index) => (
            <p key={index} className="text-sm">{link.label}: {link.url}</p>
          ))}
        </div>
      </div>
      
      {/* Reorderable Sections */}
      <Reorder.Group 
        axis="y" 
        values={allSections} 
        onReorder={handleSectionReorder}
        className="space-y-6"
      >
        {allSections.map((section) => (
          <Reorder.Item
            key={section.type}
            value={section}
            dragListener={true}
            dragControls={useDragControls()}
            className="pb-4 border-b last:border-b-0 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold">
                {renderSectionTitle(section.type)}
              </h3>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 ml-2 cursor-grab active:cursor-grabbing"
              >
                <GripVertical size={14} />
              </Button>
            </div>
            {renderSectionContent(section.type, section.items)}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}; 