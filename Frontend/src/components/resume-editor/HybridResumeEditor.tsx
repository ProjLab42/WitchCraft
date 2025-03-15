import React, { useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Trash, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeContent, SkillItem } from './ResumeContext';
import { Template } from '@/services/template.service';

interface HybridResumeEditorProps {
  onDrop: (item: any) => void;
  resumeContent: ResumeContent;
  removeSection: (id: string) => void;
  reorderSections: (sourceIndex: number, destinationIndex: number) => void;
  reorderSectionItems: (sectionType: string, sourceIndex: number, destinationIndex: number) => void;
  setResumeContent: React.Dispatch<React.SetStateAction<ResumeContent>>;
  resumeRef: React.RefObject<HTMLDivElement>;
  zoomLevel: number;
  selectedTemplate?: Template | null;
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
    transform: draggableStyle.transform,
    boxShadow: '0 5px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 9999,
    background: 'white',
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
    transform: draggableStyle.transform,
    boxShadow: '0 5px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 9999,
    background: 'white',
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
  zoomLevel,
  selectedTemplate 
}) => {
  const draggingItemRef = useRef(null);
  const prevTemplateId = useRef<string | null>(null);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'RESUME_ITEM',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Apply template styles when template changes
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.id !== prevTemplateId.current) {
      // Apply the template styles to the resume
      applyTemplateStyles(selectedTemplate);
      
      // Track which template we've applied
      prevTemplateId.current = selectedTemplate.id;
      
      // Update section order if template has default order
      if (selectedTemplate.sections?.defaultOrder?.length) {
        setResumeContent(prev => ({
          ...prev,
          sectionOrder: [...selectedTemplate.sections.defaultOrder]
        }));
      }
    }
  }, [selectedTemplate, setResumeContent]);

  // Function to apply template styles to the resume
  const applyTemplateStyles = (template: Template) => {
    // Ensure template has all required properties
    if (!template || !template.styles) {
      console.error('Invalid template or missing styles:', template);
      return;
    }

    // Create a style element for template-specific CSS
    const styleId = 'resume-template-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    // Get default values for missing styles
    const fontFamily = template.styles.fontFamily || { heading: 'Georgia, serif', body: 'Arial, sans-serif' };
    const fontSize = template.styles.fontSize || { name: '24px', sectionHeading: '18px', body: '14px' };
    const layout = template.styles.layout || { headerAlignment: 'left', sectionStyle: 'underlined', useColumns: false };
    const colors = template.styles.colors || { primary: '#333333', secondary: '#666666', accent: '#2563eb' };
    
    // Create CSS from template styles
    const css = `
      .resume-container {
        --heading-font: ${fontFamily.heading};
        --body-font: ${fontFamily.body};
        --name-size: ${fontSize.name};
        --heading-size: ${fontSize.sectionHeading};
        --body-size: ${fontSize.body};
        --primary-color: ${colors.primary};
        --secondary-color: ${colors.secondary};
        --accent-color: ${colors.accent};
      }
      
      .resume-container .resume-name {
        font-family: var(--heading-font);
        font-size: var(--name-size);
        color: var(--primary-color);
      }
      
      .resume-container .resume-section-heading {
        font-family: var(--heading-font);
        font-size: var(--heading-size);
        color: var(--primary-color);
      }
      
      .resume-container .resume-text {
        font-family: var(--body-font);
        font-size: var(--body-size);
        color: var(--secondary-color);
      }
      
      /* Layout specific styles */
      .resume-container.header-center .resume-header {
        text-align: center;
      }
      
      .resume-container.header-right .resume-header {
        text-align: right;
      }
      
      /* Section styles */
      .resume-container.section-underlined .resume-section-heading {
        border-bottom: 2px solid var(--accent-color);
        padding-bottom: 0.25rem;
      }
      
      .resume-container.section-boxed .resume-section-heading {
        background-color: var(--accent-color);
        color: white;
        padding: 0.25rem 0.5rem;
      }
      
      /* Column layout */
      .resume-container.use-columns .resume-content {
        display: flex;
        gap: 2rem;
      }
      
      .resume-container.use-columns .resume-main {
        flex: 2;
      }
      
      .resume-container.use-columns .resume-sidebar {
        flex: 1;
        border-left: 1px solid var(--accent-color);
        padding-left: 1rem;
      }
    `;
    
    styleEl.textContent = css;
  };

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
    
    // Reset dragging reference
    draggingItemRef.current = null;
  };
  
  // Handle drag start to track the dragging item
  const handleDragStart = (event) => {
    draggingItemRef.current = event.draggableId;
  };

  // Render section title
  const renderSectionTitle = (type: string) => {
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
    
    const title = (() => {
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
    })();
    
    return (
      <div>
        <h3 style={titleStyle}>{title}</h3>
        <div style={lineStyle}></div>
      </div>
    );
  };

  // Render section content
  const renderSectionContent = (type: string, items: any[]) => {
    if (type === 'skills') {
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
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((skill: SkillItem) => (
            <div 
              key={skill.id} 
              style={skillStyle}
              className="hover:opacity-90 transition-opacity"
            >
              {skill.name}
            </div>
          ))}
        </div>
      );
    }

    // Common styles for section items based on template
    const itemTitleStyle = templateStyles ? {
      fontWeight: 'bold',
      color: templateStyles.primaryColor || '#333333',
      fontFamily: templateStyles.fontFamily || 'Arial, sans-serif',
      fontSize: '14px',
    } : {};
    
    const itemSubtitleStyle = templateStyles ? {
      fontStyle: 'italic',
      color: templateStyles.secondaryColor || '#666666',
      fontFamily: templateStyles.fontFamily || 'Arial, sans-serif',
      fontSize: '13px',
    } : {};
    
    const itemDateStyle = templateStyles ? {
      color: templateStyles.secondaryColor || '#666666',
      fontFamily: templateStyles.fontFamily || 'Arial, sans-serif',
      fontSize: '12px',
    } : {};
    
    const itemDescriptionStyle = templateStyles ? {
      color: templateStyles.primaryColor || '#333333',
      fontFamily: templateStyles.fontFamily || 'Arial, sans-serif',
      fontSize: '13px',
      marginTop: '8px',
    } : {};

    return (
      <Droppable 
        droppableId={`section-${type}`} 
        type={`section-items-${type}`} 
        direction="vertical"
        // Reduce sensitivity of placeholder movement
        ignoreContainerClipping={false}
      >
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-3 mt-2 ${snapshot.isDraggingOver ? 'bg-muted/30 rounded-md p-2 -mx-2' : ''}`}
            style={{
              transition: 'background-color 0.2s ease, padding 0.2s ease, margin 0.2s ease',
              minHeight: '10px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => {
                  // Fix for horizontal positioning
                  if (snapshot.isDragging) {
                    provided.draggableProps.style.left = provided.draggableProps.style.offsetLeft;
                  }
                  
                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`p-3 border border-transparent hover:border-border rounded-md bg-card group ${snapshot.isDragging ? 'shadow-lg border-primary/20' : 'hover:shadow-md'}`}
                      style={{
                        ...getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        ),
                        zIndex: snapshot.isDragging ? 1000 : 1,
                        maxWidth: '100%',
                      }}
                      data-is-dragging={snapshot.isDragging ? "true" : "false"}
                    >
                      {type === 'experience' && (
                        <div>
                          <div className="flex justify-between">
                            <div>
                              <h4 style={itemTitleStyle}>{item.company}</h4>
                              <p style={itemSubtitleStyle}>{item.title}</p>
                              <p style={itemDateStyle}>{item.period}</p>
                            </div>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing mr-1 p-1 hover:bg-muted rounded-full">
                                <GripVertical size={14} className="text-muted-foreground" />
                              </div>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 text-destructive rounded-full"
                                onClick={() => removeSection(item.id)}
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                          <p style={itemDescriptionStyle}>{item.description}</p>
                        </div>
                      )}
                      
                      {type === 'education' && (
                        <div>
                          <div className="flex justify-between">
                            <div>
                              <h4 style={itemTitleStyle}>{item.institution}</h4>
                              <p style={itemSubtitleStyle}>{item.degree}</p>
                              <p style={itemDateStyle}>{item.period}</p>
                            </div>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing mr-1 p-1 hover:bg-muted rounded-full">
                                <GripVertical size={14} className="text-muted-foreground" />
                              </div>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 text-destructive rounded-full"
                                onClick={() => removeSection(item.id)}
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                          <p style={itemDescriptionStyle}>{item.description}</p>
                        </div>
                      )}
                      
                      {type === 'projects' && (
                        <div>
                          <div className="flex justify-between">
                            <div>
                              <h4 style={itemTitleStyle}>{item.name}</h4>
                              <p style={itemSubtitleStyle}>{item.role}</p>
                              <p style={itemDateStyle}>{item.period}</p>
                            </div>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing mr-1 p-1 hover:bg-muted rounded-full">
                                <GripVertical size={14} className="text-muted-foreground" />
                              </div>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 text-destructive rounded-full"
                                onClick={() => removeSection(item.id)}
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                          <p style={itemDescriptionStyle}>{item.description}</p>
                        </div>
                      )}
                      
                      {type === 'certifications' && (
                        <div>
                          <div className="flex justify-between">
                            <div>
                              <h4 style={itemTitleStyle}>{item.name}</h4>
                              <p style={itemSubtitleStyle}>{item.issuer}</p>
                              <p style={itemDateStyle}>{item.date}</p>
                            </div>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing mr-1 p-1 hover:bg-muted rounded-full">
                                <GripVertical size={14} className="text-muted-foreground" />
                              </div>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 text-destructive rounded-full"
                                onClick={() => removeSection(item.id)}
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                          <p style={itemDescriptionStyle}>{item.description}</p>
                        </div>
                      )}
                    </div>
                  );
                }}
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
                  {links.github && <span>• <a href={links.github} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.github}</a></span>}
                  {links.portfolio && <span>• <a href={links.portfolio} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.portfolio}</a></span>}
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
                  {links.github && <span>• <a href={links.github} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.github}</a></span>}
                  {links.portfolio && <span>• <a href={links.portfolio} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.portfolio}</a></span>}
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
                  {links.github && <span>• <a href={links.github} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.github}</a></span>}
                  {links.portfolio && <span>• <a href={links.portfolio} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.portfolio}</a></span>}
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
                  {links.github && <span>• <a href={links.github} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.github}</a></span>}
                  {links.portfolio && <span>• <a href={links.portfolio} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.portfolio}</a></span>}
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
            {links.github && <span>• <a href={links.github} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.github}</a></span>}
            {links.portfolio && <span>• <a href={links.portfolio} target="_blank" rel="noopener noreferrer" style={linkStyle}>{links.portfolio}</a></span>}
          </div>
        )}
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
      className={`resume-container 
        bg-white border rounded-md shadow-sm p-8 w-full max-w-[21cm] mx-auto transition-all 
        ${isOver ? 'ring-2 ring-primary' : ''}
        ${selectedTemplate && selectedTemplate.styles ? `
          header-${selectedTemplate.styles.layout?.headerAlignment || 'left'} 
          section-${selectedTemplate.styles.layout?.sectionStyle || 'underlined'}
          ${selectedTemplate.styles.layout?.useColumns ? 'use-columns' : ''}
        ` : ''}
      `}
      style={{ 
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top center',
        minHeight: '29.7cm',
        width: '21cm',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: templateStyles?.fontFamily || 'Arial, sans-serif',
        color: templateStyles?.primaryColor || '#333333',
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Custom styles for dragging */
          [data-is-dragging="true"] {
            pointer-events: all !important;
          }
          
          /* Reduce sensitivity of placeholder movements */
          .react-beautiful-dnd-placeholder {
            transition: all 0.2s ease !important;
            opacity: 0.2 !important;
            background-color: #f9fafb !important;
            border-radius: 0.375rem !important;
            margin: 0.75rem 0 !important;
          }
          
          /* Ensure dragging container doesn't spill */
          .react-beautiful-dnd-dragging {
            contain: layout !important;
          }
        `
      }} />
      
      {/* Personal Info with template-specific classes */}
      <div className="resume-header mb-6 border-b pb-4">
        <h1 className="resume-name font-bold">{resumeContent.personalInfo.name}</h1>
        <p className="resume-text text-lg text-muted-foreground">{resumeContent.personalInfo.title}</p>
        
        {/* Contact info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {resumeContent.personalInfo.email && (
            <span className="resume-text text-sm">{resumeContent.personalInfo.email}</span>
          )}
          {resumeContent.personalInfo.location && (
            <span className="resume-text text-sm">{resumeContent.personalInfo.location}</span>
          )}
          {resumeContent.personalInfo.links?.linkedin && (
            <span className="resume-text text-sm">LinkedIn: {resumeContent.personalInfo.links.linkedin}</span>
          )}
          {resumeContent.personalInfo.links?.portfolio && (
            <span className="resume-text text-sm">Portfolio: {resumeContent.personalInfo.links.portfolio}</span>
          )}
        </div>
      </div>
      
      {/* Draggable Sections */}
      <div className="resume-content">
        <div className={selectedTemplate?.styles?.layout?.useColumns ? 'resume-main' : ''}>
          <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <Droppable 
              droppableId="sections" 
              type="section" 
              direction="vertical"
              ignoreContainerClipping={false}
            >
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-6 ${snapshot.isDraggingOver ? 'bg-muted/20 p-4 -mx-4 rounded-md' : ''}`}
                  style={{
                    transition: 'background-color 0.3s ease, padding 0.3s ease, margin 0.3s ease',
                    minHeight: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {allSections.map(([type, items], index) => (
                    <Draggable key={type as string} draggableId={type as string} index={index}>
                      {(provided, snapshot) => {
                        // Fix for horizontal positioning
                        if (snapshot.isDragging) {
                          provided.draggableProps.style.left = provided.draggableProps.style.offsetLeft;
                        }
                        
                        return (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`pb-4 border-b last:border-b-0 group ${snapshot.isDragging ? 'bg-background/90 rounded-md shadow-lg border border-primary/20' : ''}`}
                            style={{
                              ...getSectionStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              ),
                              zIndex: snapshot.isDragging ? 1000 : 1,
                              maxWidth: '100%',
                            }}
                            data-is-dragging={snapshot.isDragging ? "true" : "false"}
                          >
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-semibold">
                                {renderSectionTitle(type as string)}
                              </h3>
                              <div {...provided.dragHandleProps} className="ml-2 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical size={14} className="text-muted-foreground" />
                              </div>
                            </div>
                            {renderSectionContent(type as string, items)}
                          </div>
                        );
                      }}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        
        {selectedTemplate?.styles?.layout?.useColumns && (
          <div className="resume-sidebar">
            {/* Content for the sidebar column if using columns */}
            {/* You can move certain sections here based on template */}
          </div>
        )}
      </div>
    </div>
  );
}; 