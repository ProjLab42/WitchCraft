import React, { useEffect } from 'react';
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
  // Get template styles from context
  const { templateStyles } = useResumeContext();
  
  // Log when template styles change
  useEffect(() => {
    if (templateStyles) {
      console.log('Template styles applied in ResumeDropZone:', templateStyles);
    }
  }, [templateStyles]);
  
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

  // Render section title with appropriate styling
  const renderSectionTitle = (type: string) => {
    const title = type.charAt(0).toUpperCase() + type.slice(1);
    
    // Apply template styles if available
    const titleStyle = templateStyles ? {
      fontSize: templateStyles.sectionTitleSize || '16px',
      fontWeight: templateStyles.sectionTitleWeight || 'bold',
      color: templateStyles.primaryColor || '#333333',
      fontFamily: templateStyles.fontFamily || 'Arial, sans-serif',
    } : {};
    
    const lineStyle = templateStyles ? {
      backgroundColor: templateStyles.lineColor || '#dddddd',
      height: '1px',
      width: '100%',
      marginTop: '4px',
      marginBottom: '12px'
    } : {};
    
    return (
      <div className="mb-4">
        <h3 style={titleStyle}>{title}</h3>
        <div style={lineStyle}></div>
      </div>
    );
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

  // Render header with appropriate styling based on template
  const renderHeader = () => {
    const { name, title, email, phone, location, links } = resumeContent.personalInfo;
    
    // Default styles
    const headerStyle = {
      textAlign: 'center',
      marginBottom: '20px',
      fontFamily: templateStyles?.fontFamily || 'Arial, sans-serif',
    };
    
    // Common link styles
    const linkStyle = {
      textDecoration: 'none',
      color: 'inherit',
      cursor: 'pointer',
    };
    
    // Apply template-specific header styles
    if (templateStyles) {
      const headerType = templateStyles.headerStyle || 'centered';
      
      switch (headerType) {
        case 'centered-with-accent':
          return (
            <div style={headerStyle as React.CSSProperties}>
              <div 
                style={{ 
                  backgroundColor: templateStyles.accentColor || '#2563eb',
                  height: templateStyles.accentHeight || '5px',
                  width: '100%',
                  marginBottom: '15px'
                }}
              ></div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: templateStyles.primaryColor || '#333333',
                margin: '0 0 5px 0'
              }}>
                {name}
              </h1>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'normal',
                color: templateStyles.secondaryColor || '#666666',
                margin: '0 0 10px 0'
              }}>
                {title}
              </h2>
              <div style={{ 
                fontSize: '12px',
                color: templateStyles.secondaryColor || '#666666',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <a href={`mailto:${email}`} style={linkStyle}>{email}</a>
                {phone && <span>• {phone}</span>}
                {location && <span>• {location}</span>}
              </div>
              {links && (
                <div style={{ 
                  fontSize: '12px',
                  color: templateStyles.accentColor || '#2563eb',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px',
                  marginTop: '5px'
                }}>
                  {links.linkedin && <a href={links.linkedin} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.linkedin}</a>}
                  {links.portfolio && <span>• <a href={links.portfolio} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.portfolio}</a></span>}
                  {links.additionalLinks && links.additionalLinks.map((link, index) => (
                    <span key={index}>• <a href={link.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>{link.label}</a></span>
                  ))}
                </div>
              )}
            </div>
          );
          
        case 'centered-with-gradient':
          return (
            <div style={headerStyle as React.CSSProperties}>
              <div 
                style={{ 
                  background: `linear-gradient(to right, ${templateStyles.gradientColors?.[0] || '#8b5cf6'}, ${templateStyles.gradientColors?.[1] || '#ec4899'})`,
                  height: templateStyles.accentHeight || '5px',
                  width: '100%',
                  marginBottom: '15px'
                }}
              ></div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: templateStyles.primaryColor || '#333333',
                margin: '0 0 5px 0'
              }}>
                {name}
              </h1>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'normal',
                color: templateStyles.secondaryColor || '#666666',
                margin: '0 0 10px 0'
              }}>
                {title}
              </h2>
              <div style={{ 
                fontSize: '12px',
                color: templateStyles.secondaryColor || '#666666',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <a href={`mailto:${email}`} style={linkStyle}>{email}</a>
                {phone && <span>• {phone}</span>}
                {location && <span>• {location}</span>}
              </div>
              {links && (
                <div style={{ 
                  fontSize: '12px',
                  color: templateStyles.accentColor || '#8b5cf6',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px',
                  marginTop: '5px'
                }}>
                  {links.linkedin && <a href={links.linkedin} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.linkedin}</a>}
                  {links.portfolio && <span>• <a href={links.portfolio} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.portfolio}</a></span>}
                  {links.additionalLinks && links.additionalLinks.map((link, index) => (
                    <span key={index}>• <a href={link.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>{link.label}</a></span>
                  ))}
                </div>
              )}
            </div>
          );
          
        case 'centered-minimal':
          return (
            <div style={headerStyle as React.CSSProperties}>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: templateStyles.primaryColor || '#333333',
                margin: '0 0 5px 0'
              }}>
                {name}
              </h1>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'normal',
                color: templateStyles.secondaryColor || '#666666',
                margin: '0 0 10px 0'
              }}>
                {title}
              </h2>
              <div style={{ 
                fontSize: '12px',
                color: templateStyles.secondaryColor || '#666666',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <a href={`mailto:${email}`} style={linkStyle}>{email}</a>
                {phone && <span>• {phone}</span>}
                {location && <span>• {location}</span>}
              </div>
              {links && (
                <div style={{ 
                  fontSize: '12px',
                  color: templateStyles.secondaryColor || '#666666',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px',
                  marginTop: '5px'
                }}>
                  {links.linkedin && <a href={links.linkedin} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.linkedin}</a>}
                  {links.portfolio && <span>• <a href={links.portfolio} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.portfolio}</a></span>}
                  {links.additionalLinks && links.additionalLinks.map((link, index) => (
                    <span key={index}>• <a href={link.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>{link.label}</a></span>
                  ))}
                </div>
              )}
            </div>
          );
          
        case 'centered':
        default:
          return (
            <div style={headerStyle as React.CSSProperties}>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: templateStyles.primaryColor || '#333333',
                margin: '0 0 5px 0'
              }}>
                {name}
              </h1>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'normal',
                color: templateStyles.secondaryColor || '#666666',
                margin: '0 0 10px 0'
              }}>
                {title}
              </h2>
              <div style={{ 
                fontSize: '12px',
                color: templateStyles.secondaryColor || '#666666',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <a href={`mailto:${email}`} style={linkStyle}>{email}</a>
                {phone && <span>• {phone}</span>}
                {location && <span>• {location}</span>}
              </div>
              {links && (
                <div style={{ 
                  fontSize: '12px',
                  color: templateStyles.accentColor || '#2563eb',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px',
                  marginTop: '5px'
                }}>
                  {links.linkedin && <a href={links.linkedin} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.linkedin}</a>}
                  {links.portfolio && <span>• <a href={links.portfolio} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.portfolio}</a></span>}
                  {links.additionalLinks && links.additionalLinks.map((link, index) => (
                    <span key={index}>• <a href={link.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>{link.label}</a></span>
                  ))}
                </div>
              )}
            </div>
          );
      }
    }
    
    // Default header if no template styles
    return (
      <div style={headerStyle as React.CSSProperties}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{name}</h1>
        <h2 style={{ fontSize: '16px', fontWeight: 'normal', margin: '0 0 10px 0' }}>{title}</h2>
        <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <a href={`mailto:${email}`} style={linkStyle}>{email}</a>
          {phone && <span>• {phone}</span>}
          {location && <span>• {location}</span>}
        </div>
        {links && (
          <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '5px' }}>
            {links.linkedin && <a href={links.linkedin} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.linkedin}</a>}
            {links.portfolio && <span>• <a href={links.portfolio} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.portfolio}</a></span>}
            {links.additionalLinks && links.additionalLinks.map((link, index) => (
              <span key={index}>• <a href={link.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>{link.label}</a></span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render skills section
  const renderSkills = () => {
    if (!selectedSkills.length) return null;
    
    const skillStyle = templateStyles ? {
      display: 'inline-block',
      margin: '0 8px 8px 0',
      padding: '4px 10px',
      borderRadius: '16px',
      fontSize: '12px',
      backgroundColor: templateStyles.accentColor ? `${templateStyles.accentColor}15` : '#f0f4ff',
      color: templateStyles.accentColor || '#2563eb',
      fontFamily: templateStyles.fontFamily || 'Arial, sans-serif',
    } : {};
    
    return (
      <div className="mb-6">
        {renderSectionTitle('skills')}
        <div className="flex flex-wrap">
          {selectedSkills.map(skill => (
            <div key={skill.id} style={skillStyle as React.CSSProperties}>
              {skill.name}
            </div>
          ))}
        </div>
      </div>
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
        {renderHeader()}
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
                      {type === 'skills' ? renderSkills() : renderSectionContent(type as string, items)}
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