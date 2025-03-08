import React from 'react';
import { useDrop } from 'react-dnd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeContext, ResumeContent, SkillItem } from './ResumeContext';

interface ResumeDropZoneProps {
  onDrop: (item: any) => void;
  resumeContent: ResumeContent;
  removeSection: (id: string) => void;
  reorderSections: (sourceIndex: number, destinationIndex: number) => void;
  reorderSectionItems: (sectionType: string, sourceIndex: number, destinationIndex: number) => void;
  userData: any;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
  setResumeContent: React.Dispatch<React.SetStateAction<ResumeContent>>;
  resumeRef: React.RefObject<HTMLDivElement>;
  zoomLevel: number;
}

export const ResumeDropZone: React.FC<ResumeDropZoneProps> = ({ 
  onDrop, 
  resumeContent, 
  removeSection, 
  reorderSections, 
  reorderSectionItems,
  userData, 
  setUserData, 
  setResumeContent, 
  resumeRef, 
  zoomLevel 
}) => {
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
        allSections.push(['skills', selectedSkills]);
      } else if (groupedSections[sectionType]) {
        allSections.push([sectionType, groupedSections[sectionType]]);
      }
    });
    
    // Add any sections that might not be in the order yet
    Object.entries(groupedSections).forEach(([type, items]) => {
      if (!resumeContent.sectionOrder.includes(type)) {
        allSections.push([type, items]);
      }
    });
    
    // Add skills if not already added
    if (!resumeContent.sectionOrder.includes('skills') && selectedSkills.length > 0) {
      allSections.push(['skills', selectedSkills]);
    }
  } else {
    // Default ordering if no custom order exists
    allSections = [...Object.entries(groupedSections)];
    if (selectedSkills.length > 0) {
      allSections.push(['skills', selectedSkills]);
    }
  }

  // Handle drag end for reordering sections
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination, type } = result;
    
    // Handle section reordering
    if (type === 'section') {
      reorderSections(source.index, destination.index);
      return;
    }
    
    // Handle item reordering within sections
    if (type.startsWith('section-items-')) {
      const sectionType = type.replace('section-items-', '');
      reorderSectionItems(sectionType, source.index, destination.index);
    }
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
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((skill: SkillItem) => (
            <div 
              key={skill.id} 
              className="px-3 py-1 bg-muted rounded-full text-sm"
            >
              {skill.name}
            </div>
          ))}
        </div>
      );
    }

    return (
      <Droppable droppableId={`section-${type}`} type={`section-items-${type}`}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3 mt-2"
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="p-3 border rounded-md bg-card"
                  >
                    {type === 'experience' && (
                      <div>
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">{item.company}</h4>
                            <p className="text-sm italic">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.period}</p>
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeSection(item.id)}
                          >
                            <Trash size={14} />
                          </Button>
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
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeSection(item.id)}
                          >
                            <Trash size={14} />
                          </Button>
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
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeSection(item.id)}
                          >
                            <Trash size={14} />
                          </Button>
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
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeSection(item.id)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                        <p className="text-sm mt-2">{item.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <div 
      ref={(node) => {
        drop(node);
        if (resumeRef && typeof resumeRef === 'object') {
          (resumeRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      className={`flex-1 p-8 border rounded-md overflow-auto transition-all ${isOver ? 'bg-muted/50' : 'bg-background'}`}
      style={{ 
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top center',
        minHeight: '29.7cm',
        width: '21cm',
        margin: '0 auto',
      }}
    >
      {/* Personal Info Section */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">{resumeContent.personalInfo.name}</h1>
        <p className="text-lg">{resumeContent.personalInfo.title}</p>
        <div className="flex justify-center gap-2 text-sm mt-1">
          <span>{resumeContent.personalInfo.email}</span>
          {resumeContent.personalInfo.location && (
            <>
              <span>•</span>
              <span>{resumeContent.personalInfo.location}</span>
            </>
          )}
        </div>
        
        {resumeContent.personalInfo.links && (
          <div className="flex justify-center gap-2 text-sm mt-1">
            {resumeContent.personalInfo.links.linkedin && (
              <a href={resumeContent.personalInfo.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary">
                LinkedIn
              </a>
            )}
            
            {resumeContent.personalInfo.links.portfolio && (
              <>
                {resumeContent.personalInfo.links.linkedin && <span>•</span>}
                <a href={resumeContent.personalInfo.links.portfolio} target="_blank" rel="noopener noreferrer" className="text-primary">
                  Portfolio
                </a>
              </>
            )}
            
            {resumeContent.personalInfo.links.additionalLinks && 
             resumeContent.personalInfo.links.additionalLinks.map((link, index) => (
              <React.Fragment key={index}>
                <span>•</span>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary">
                  {link.label}
                </a>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      
      {/* Draggable Sections */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections" type="section">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-6"
            >
              {allSections.map(([type, items], index) => (
                <Draggable key={type} draggableId={type} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="pb-4 border-b last:border-b-0"
                    >
                      <h3 className="text-lg font-semibold mb-2">
                        {renderSectionTitle(type as string)}
                      </h3>
                      {renderSectionContent(type as string, items)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}; 