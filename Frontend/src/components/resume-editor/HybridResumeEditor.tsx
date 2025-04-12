import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Trash, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeContent, SkillItem, useResumeContext } from './ResumeContext';
import { Template } from '@/services/template.service';
import { isResumeOverflowing, applyContentScaling } from './utils';

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
  const [isAutoScaled, setIsAutoScaled] = useState(false);
  const [scalingFactor, setScalingFactor] = useState(1);
  const [contentOverflowing, setContentOverflowing] = useState(false);
  const [isScalingStabilized, setIsScalingStabilized] = useState(true);
  const contentHeightRef = useRef<number | null>(null);
  const stabilizationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get auto-scaling toggle from context
  const { autoScalingEnabled } = useResumeContext();
  
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
        background-color: #ffffff;
        color: black;
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
        <div className="skills-section">
          <div className="flex flex-wrap gap-2 mt-2">
            {items.map((skill: SkillItem) => (
              <div 
                key={skill.id} 
                className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-muted/80 transition-colors skill-item"
              >
                {skill.name}
              </div>
            ))}
          </div>
        </div>
      );
    }

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
                        <div className="experience">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium experience-company">{item.company}</h4>
                              <p className="text-sm italic experience-title">{item.title}</p>
                              <p className="text-xs text-muted-foreground experience-period">{item.period}</p>
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
                          <p className="text-sm mt-2 experience-description">{item.description}</p>
                        </div>
                      )}
                      
                      {type === 'education' && (
                        <div className="education">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium education-institution">{item.institution}</h4>
                              <p className="text-sm italic education-degree">{item.degree}</p>
                              <p className="text-xs text-muted-foreground education-period">{item.period}</p>
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
                          <p className="text-sm mt-2 education-description">{item.description}</p>
                        </div>
                      )}
                      
                      {type === 'projects' && (
                        <div className="project">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium project-name">{item.name}</h4>
                              <p className="text-sm italic project-role">{item.role}</p>
                              <p className="text-xs text-muted-foreground project-period">{item.period}</p>
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
                          <p className="text-sm mt-2 project-description">{item.description}</p>
                        </div>
                      )}
                      
                      {type === 'certifications' && (
                        <div className="certification">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium certification-name">{item.name}</h4>
                              <p className="text-sm italic certification-issuer">{item.issuer}</p>
                              <p className="text-xs text-muted-foreground certification-date">{item.date}</p>
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
                          <p className="text-sm mt-2 certification-description">{item.description}</p>
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

  // After scaling is applied, mark content as stabilizing and set a timer
  const markContentStabilizing = useCallback(() => {
    setIsScalingStabilized(false);
    
    // Clear any existing stabilization timer
    if (stabilizationTimerRef.current) {
      clearTimeout(stabilizationTimerRef.current);
    }
    
    // Set a timer to mark content as stabilized after a delay
    stabilizationTimerRef.current = setTimeout(() => {
      setIsScalingStabilized(true);
      stabilizationTimerRef.current = null;
    }, 400);
  }, []);
  
  // Clean up the stabilization timer when component unmounts
  useEffect(() => {
    return () => {
      if (stabilizationTimerRef.current) {
        clearTimeout(stabilizationTimerRef.current);
      }
    };
  }, []);

  // Watch for changes to autoScalingEnabled and reset scaling when turned off
  useEffect(() => {
    if (!autoScalingEnabled && resumeRef.current) {
      // Reset scaling when autoscaling is toggled off (whether previously auto-scaled or not)
      const container = resumeRef.current;
      
      // Reset all styling on all elements
      const elements = container.querySelectorAll('*');
      elements.forEach(el => {
        const element = el as HTMLElement;
        element.style.fontSize = '';
        element.style.marginBottom = '';
        element.style.marginTop = '';
        element.style.paddingBottom = '';
        element.style.paddingTop = '';
        element.style.lineHeight = '';
        element.style.height = '';
        element.style.maxHeight = '';
      });
      
      // Update state
      setIsAutoScaled(false);
      setScalingFactor(1);
      
      // Force reflow to ensure changes take effect
      setTimeout(() => {
        // Check for overflow after reset
        if (container) {
          const contentHeight = container.scrollHeight;
          const containerHeight = container.clientHeight;
          setContentOverflowing(contentHeight > containerHeight);
        }
      }, 50);
    }
  }, [autoScalingEnabled]);

  // Check for content overflow and apply scaling if needed
  const handleAutoScaling = useCallback(() => {
    if (!resumeRef.current) return;
    
    // Skip auto-scaling if it's disabled
    if (!autoScalingEnabled) {
      // Just check for overflow
      const container = resumeRef.current;
      const contentHeight = container.scrollHeight;
      const containerHeight = container.clientHeight;
      setContentOverflowing(contentHeight > containerHeight);
      return;
    }
    
    // Get container dimensions
    const container = resumeRef.current;
    const contentHeight = container.scrollHeight;
    const containerHeight = container.clientHeight;
    
    // Skip scaling during content stabilization if content height is changing rapidly
    if (!isScalingStabilized && contentHeightRef.current !== null) {
      const heightChange = Math.abs(contentHeight - contentHeightRef.current);
      if (heightChange > 5) {
        // Content is still changing, update reference and skip this cycle
        contentHeightRef.current = contentHeight;
        return;
      }
    }
    
    // Update content height reference
    contentHeightRef.current = contentHeight;
    
    // Determine if content is overflowing
    const isOverflowing = contentHeight > containerHeight;
    
    // Only update overflow state if it's a significant change to avoid flickering
    if (Math.abs(contentHeight - containerHeight) > 10) {
      setContentOverflowing(isOverflowing);
    }
    
    // Apply auto-scaling if enabled and content is overflowing
    if (autoScalingEnabled && isOverflowing) {
      // If already auto-scaled and content is still overflowing,
      // we need a more aggressive scaling factor
      if (isAutoScaled) {
        // Calculate a new scaling factor but limit the minimum to 0.8
        // This prevents text from becoming too small
        const rawScalingFactor = (scalingFactor * containerHeight) / contentHeight;
        const newScalingFactor = Math.max(0.8, rawScalingFactor);
        
        if (Math.abs(newScalingFactor - scalingFactor) > 0.01) {
          // Only update if there's a significant difference to avoid fluctuations
          applyContentScaling(container, newScalingFactor);
          setScalingFactor(newScalingFactor);
          markContentStabilizing();
        }
      } else {
        // Initial scaling with a higher minimum
        const initialScalingFactor = Math.max(0.8, containerHeight / contentHeight);
        
        // Apply scaling to content
        applyContentScaling(container, initialScalingFactor);
        
        // Update UI state
        setIsAutoScaled(true);
        setScalingFactor(initialScalingFactor);
        markContentStabilizing();
      }
    } else if (!isOverflowing && isAutoScaled) {
      // Only reset if content is significantly under the container height
      if (containerHeight - contentHeight > 20) {
        // Reset scaling if content no longer overflows
        const elements = container.querySelectorAll('*');
        elements.forEach(el => {
          const element = el as HTMLElement;
          element.style.fontSize = '';
          element.style.marginBottom = '';
          element.style.marginTop = '';
          element.style.paddingBottom = '';
          element.style.paddingTop = '';
          element.style.lineHeight = '';
        });
        setIsAutoScaled(false);
        setScalingFactor(1);
        markContentStabilizing();
      }
    }
  }, [autoScalingEnabled, isAutoScaled, scalingFactor, isScalingStabilized, markContentStabilizing]);

  // Detect content overflow and apply auto-scaling when needed
  useEffect(() => {
    // Store timer reference for cleanup
    let timer: NodeJS.Timeout;
    
    // Check for overflow after a delay to ensure proper rendering
    // and debounce changes to prevent flickering
    const debouncedCheck = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleAutoScaling();
      }, 300); // Slightly longer delay to prevent rapid oscillation
    };
    
    debouncedCheck();
    
    return () => clearTimeout(timer);
  }, [resumeContent, zoomLevel, autoScalingEnabled, handleAutoScaling]);

  // Resume container styles with visual cue for stabilization
  const resumeContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '21cm',
    minHeight: '29.7cm',
    height: '29.7cm', // Fixed A4 height to clearly show overflow issues
    margin: '0 auto',
    padding: '1.5cm',
    backgroundColor: 'white',
    boxShadow: contentOverflowing && !autoScalingEnabled 
      ? 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(255, 0, 0, 0.2) 0px 0px 0px 2px'
      : 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
    borderRadius: '0.375rem',
    overflowY: 'auto',
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'top center',
    transition: `transform 0.2s ease, opacity 0.2s ease`,
    boxSizing: 'border-box',
    opacity: isAutoScaled && !isScalingStabilized ? 0.9 : 1,
    lineHeight: isAutoScaled ? '1.4' : '1.5', // Maintain good line height even when scaled
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center py-4 overflow-auto bg-slate-50 dark:bg-slate-900">
      {/* Resume container with A4 dimensions */}
      <div 
        id="resume-container"
        ref={node => {
          drop(node);
          if (resumeRef && typeof resumeRef === 'object') {
            (resumeRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        className={`resume-container 
          ${isOver ? 'ring-2 ring-primary' : ''}
          ${selectedTemplate && selectedTemplate.styles ? `
            header-${selectedTemplate.styles.layout?.headerAlignment || 'left'} 
            section-${selectedTemplate.styles.layout?.sectionStyle || 'underlined'}
            ${selectedTemplate.styles.layout?.useColumns ? 'use-columns' : ''}
          ` : ''}
          ${!autoScalingEnabled && contentOverflowing ? 'overflow-indicator' : ''}
        `}
        style={resumeContainerStyle}
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
            
            /* Indicator for auto-scaling */
            .auto-scale-indicator {
              position: absolute;
              top: -32px;
              right: 0;
              background-color: #f8f9fa;
              border: 1px solid #e2e8f0;
              border-radius: 0.375rem;
              padding: 0.25rem 0.5rem;
              font-size: 0.75rem;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              color: #64748b;
              z-index: 1000;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
              transition: opacity 0.2s ease;
            }
            
            .auto-scale-indicator.stabilizing {
              opacity: 0.7;
            }
            
            .auto-scale-indicator button {
              background-color: #e2e8f0;
              color: #475569;
              border: none;
              border-radius: 0.25rem;
              padding: 0.25rem 0.5rem;
              font-size: 0.75rem;
              cursor: pointer;
              transition: background-color 0.2s;
            }
            
            .auto-scale-indicator button:hover {
              background-color: #cbd5e1;
            }
            
            /* Indicator for content overflow */
            .overflow-warning {
              position: absolute;
              top: -32px;
              right: 0;
              background-color: #fff8f8;
              border: 1px solid #fed7d7;
              border-radius: 0.375rem;
              padding: 0.25rem 0.5rem;
              font-size: 0.75rem;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              color: #e53e3e;
              z-index: 1000;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
              transition: opacity 0.3s ease;
            }
            
            /* Visual indicator for overflowing content */
            .overflow-indicator {
              position: relative;
            }
            
            .overflow-indicator::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 30px;
              background: linear-gradient(to bottom, transparent, rgba(255, 0, 0, 0.1));
              pointer-events: none;
              z-index: 2;
              border-bottom-left-radius: 0.375rem;
              border-bottom-right-radius: 0.375rem;
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
                              className={`pb-4 border-b last:border-b-0 group resume-section ${type}-section ${snapshot.isDragging ? 'bg-background/90 rounded-md shadow-lg border border-primary/20' : ''}`}
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
                                <h3 className="text-lg font-semibold resume-section-heading">
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
        
        {/* Auto-scaling indicator - only show when stable */}
        {isAutoScaled && (
          <div className={`auto-scale-indicator ${!isScalingStabilized ? 'stabilizing' : ''}`}>
            <span>{!isScalingStabilized ? 'Adjusting...' : `Auto-scaled to ${Math.round(scalingFactor * 100)}%`}</span>
            {isScalingStabilized && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // Reset scaling
                  const container = resumeRef.current;
                  if (container) {
                    // Reset all font sizes and margins
                    const elements = container.querySelectorAll('*');
                    elements.forEach(el => {
                      const element = el as HTMLElement;
                      element.style.fontSize = '';
                      element.style.marginBottom = '';
                      element.style.marginTop = '';
                      element.style.paddingBottom = '';
                      element.style.paddingTop = '';
                      element.style.lineHeight = '';
                    });
                    setIsAutoScaled(false);
                    setScalingFactor(1);
                    markContentStabilizing();
                  }
                }}
              >
                Reset
              </button>
            )}
          </div>
        )}
        
        {/* Content overflow warning when auto-scaling is disabled */}
        {!autoScalingEnabled && contentOverflowing && isScalingStabilized && (
          <div className="overflow-warning">
            <span>Content exceeding page - turn on Auto-fit</span>
          </div>
        )}
      </div>
    </div>
  );
}; 