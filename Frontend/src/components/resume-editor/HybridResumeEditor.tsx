import React from 'react';
import { useDrop } from 'react-dnd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Trash, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeContent, SkillItem } from './ResumeContext';

interface HybridResumeEditorProps {
  onDrop: (item: any) => void;
  resumeContent: ResumeContent;
  removeSection: (id: string) => void;
  reorderSections: (sourceIndex: number, destinationIndex: number) => void;
  reorderSectionItems: (sectionType: string, sourceIndex: number, destinationIndex: number) => void;
  setResumeContent: React.Dispatch<React.SetStateAction<ResumeContent>>;
  resumeRef: React.RefObject<HTMLDivElement>;
  zoomLevel: number;
}

// Custom styles for dragging items within sections
const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  
  // styles we need to apply on draggables
  ...draggableStyle,
  
  // If dragging, we want to ensure it stays in the same horizontal position
  // and add smooth transitions for a better drop experience
  ...(isDragging && {
    left: 'auto',
    width: draggableStyle.width,
    margin: '0 auto',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    transform: `${draggableStyle.transform} scale(1.02)`,
    zIndex: 9999,
  }),
  
  // Add transition for smooth drop animation
  transition: isDragging 
    ? draggableStyle.transition 
    : 'box-shadow 0.2s ease, transform 0.2s ease, background-color 0.2s ease',
});

// Custom styles for section dragging
const getSectionStyle = (isDragging, draggableStyle) => ({
  // basic styles
  userSelect: 'none',
  
  // styles we need to apply on draggables
  ...draggableStyle,
  
  // If dragging, we want to ensure it stays in the same horizontal position
  // and add smooth transitions for a better drop experience
  ...(isDragging && {
    left: 'auto',
    width: draggableStyle.width,
    margin: '0 auto',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    transform: `${draggableStyle.transform} scale(1.01)`,
    zIndex: 9999,
  }),
  
  // Add transition for smooth drop animation
  transition: isDragging 
    ? draggableStyle.transition 
    : 'box-shadow 0.3s ease, transform 0.3s ease, background-color 0.3s ease',
});

export const HybridResumeEditor: React.FC<HybridResumeEditorProps> = ({ 
  onDrop, 
  resumeContent, 
  removeSection, 
  reorderSections, 
  reorderSectionItems,
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
              className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-muted/80 transition-colors"
            >
              {skill.name}
            </div>
          ))}
        </div>
      );
    }

    return (
      <Droppable droppableId={`section-${type}`} type={`section-items-${type}`} direction="vertical">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-3 mt-2 ${snapshot.isDraggingOver ? 'bg-muted/30 rounded-md p-2 -mx-2' : ''}`}
            style={{
              transition: 'background-color 0.2s ease, padding 0.2s ease, margin 0.2s ease',
            }}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`p-3 border border-transparent hover:border-border rounded-md bg-card group ${snapshot.isDragging ? 'shadow-lg border-primary/20' : 'hover:shadow-md'}`}
                    style={getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                  >
                    {type === 'experience' && (
                      <div>
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">{item.company}</h4>
                            <p className="text-sm italic">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.period}</p>
                          </div>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing mr-1 p-1 hover:bg-muted rounded">
                              <GripVertical size={14} />
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
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing mr-1 p-1 hover:bg-muted rounded">
                              <GripVertical size={14} />
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
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing mr-1 p-1 hover:bg-muted rounded">
                              <GripVertical size={14} />
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
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing mr-1 p-1 hover:bg-muted rounded">
                              <GripVertical size={14} />
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
      className={`bg-white border rounded-md shadow-sm p-8 w-full max-w-[21cm] mx-auto transition-all ${isOver ? 'ring-2 ring-primary' : ''}`}
      style={{ 
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top center',
        minHeight: '29.7cm',
        width: '21cm',
        margin: '0 auto',
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
      
      {/* Draggable Sections */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections" type="section" direction="vertical">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-6 ${snapshot.isDraggingOver ? 'bg-muted/20 p-4 -mx-4 rounded-md' : ''}`}
              style={{
                transition: 'background-color 0.3s ease, padding 0.3s ease, margin 0.3s ease',
              }}
            >
              {allSections.map(([type, items], index) => (
                <Draggable key={type as string} draggableId={type as string} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`pb-4 border-b last:border-b-0 group ${snapshot.isDragging ? 'bg-background/90 rounded-md shadow-lg border border-primary/20' : ''}`}
                      style={getSectionStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold">
                          {renderSectionTitle(type as string)}
                        </h3>
                        <div {...provided.dragHandleProps} className="ml-2 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical size={14} />
                        </div>
                      </div>
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