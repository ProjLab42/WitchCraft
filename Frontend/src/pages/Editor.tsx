import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, ChevronUp, FileText, Plus, Edit, Trash, X, Check, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import * as docx from 'docx';

// Mock user data
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
    additionalLinks: [
      { name: "GitHub", url: "https://github.com/janedoe" },
      { name: "Twitter", url: "https://twitter.com/janedoe" }
    ]
  },
  sections: {
    // Default sections with display names
    sectionMeta: {
      "experience": { name: "Experience", deletable: true, renamable: true },
      "education": { name: "Education", deletable: true, renamable: true },
      "skills": { name: "Skills", deletable: true, renamable: true },
      "projects": { name: "Projects", deletable: true, renamable: true },
      "certifications": { name: "Certifications", deletable: true, renamable: true }
    },
    experience: [
      {
        id: "exp1",
        title: "Senior Developer",
        company: "Tech Solutions Inc.",
        period: "2021 - Present",
        description: "Led development of multiple client projects. Implemented CI/CD pipelines and mentored junior developers.",
        bulletPoints: [
          { id: "bp-exp1-1", text: "Led a team of 5 developers on a high-profile client project" },
          { id: "bp-exp1-2", text: "Implemented CI/CD pipelines reducing deployment time by 45%" },
          { id: "bp-exp1-3", text: "Mentored 3 junior developers who were promoted within a year" }
        ]
      },
      {
        id: "exp2",
        title: "Web Developer",
        company: "Digital Creations",
        period: "2018 - 2021",
        description: "Built responsive web applications using React and Redux. Collaborated with design team to implement UI/UX improvements."
      }
    ],
    education: [
      {
        id: "edu1",
        degree: "M.S. Computer Science",
        institution: "Tech University",
        year: "2018",
        description: "Focus on software engineering and distributed systems.",
        bulletPoints: [
          { id: "bp-edu1-1", text: "Thesis: 'Efficient algorithms for distributed systems'" },
          { id: "bp-edu1-2", text: "GPA: 3.9/4.0" }
        ]
      },
      {
        id: "edu2",
        degree: "B.S. Computer Science",
        institution: "State University",
        year: "2016",
        description: "Minor in Mathematics. Dean's List all semesters."
      }
    ],
    skills: [
      { id: "skill1", name: "React" },
      { id: "skill2", name: "TypeScript" },
      { id: "skill3", name: "Node.js" },
      { id: "skill4", name: "GraphQL" },
      { id: "skill5", name: "Docker" },
      { id: "skill6", name: "AWS" }
    ],
    projects: [
      {
        id: "proj1",
        name: "E-commerce Platform",
        description: "Built a full-stack e-commerce platform with React, Node.js, and MongoDB.",
        link: "https://github.com/janedoe/ecommerce",
        bulletPoints: [
          { id: "bp-proj1-1", text: "Implemented payment processing with Stripe" },
          { id: "bp-proj1-2", text: "Built real-time inventory management system" }
        ]
      },
      {
        id: "proj2",
        name: "Task Management App",
        description: "Developed a task management application with real-time updates using Socket.io.",
        link: "https://github.com/janedoe/taskmanager"
      }
    ],
    certifications: [
      {
        id: "cert1",
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        date: "2022",
        expirationDate: "2025",
        credentialId: "AWS-123456",
        bulletPoints: [
          { id: "bp-cert1-1", text: "Passed with score of 945/1000" },
          { id: "bp-cert1-2", text: "Built cloud architecture for financial services company as part of certification" }
        ]
      },
      {
        id: "cert2",
        name: "Certified Kubernetes Administrator",
        issuer: "Cloud Native Computing Foundation",
        date: "2021",
        expirationDate: "2024",
        credentialId: "CKA-789012"
      }
    ],
    // Custom sections
    customSections: {}
  }
};

// Draggable section component
const DraggableSection = ({ title, children, isOpen, toggleOpen }) => {
  return (
    <div className="mb-6 border rounded-md overflow-hidden">
      <div 
        className="p-3 bg-muted/50 flex justify-between items-center cursor-pointer"
        onClick={toggleOpen}
      >
        <h3 className="font-semibold">{title}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>
      
      <div className={`p-3 ${isOpen ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
};

// Draggable item component
const DraggableItem = ({ item, type, onDrop, userData, setUserData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...item });
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'RESUME_ITEM',
    item: { 
      ...item, 
      itemType: type
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !isEditing, // Prevent dragging while editing
  }));
  
  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent drag from starting
    setIsEditing(true);
  };
  
  const handleSave = () => {
    // Update the item with edited values
    onDrop({ ...editedItem, itemType: type });
    
    // Update the userData state to sync with the edited item
    if (userData && setUserData) {
      setUserData(prevUserData => {
        // Create a deep copy of the sections
        const updatedSections = { ...prevUserData.sections };
        
        // Find and update the item in the appropriate section
        if (updatedSections[type]) {
          updatedSections[type] = updatedSections[type].map(sectionItem => 
            sectionItem.id === editedItem.id ? { ...editedItem } : sectionItem
          );
        }
        
        return {
          ...prevUserData,
          sections: updatedSections
        };
      });
    }
    
    setIsEditing(false);
    toast.success("Item updated successfully");
  };
  
  const handleCancel = () => {
    // Reset to original values
    setEditedItem({ ...item });
    setIsEditing(false);
  };
  
  const handleChange = (field, value) => {
    setEditedItem(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Simplified item displays based on data type
  const renderContent = () => {
    switch (type) {
      case 'experience':
        return isEditing ? (
          <div className="p-3 border rounded-md mb-2 bg-white">
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 block">Job Title</label>
                <input 
                  type="text" 
                  value={editedItem.title} 
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block">Company</label>
                <input 
                  type="text" 
                  value={editedItem.company} 
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block">Period</label>
                <input 
                  type="text" 
                  value={editedItem.period} 
                  onChange={(e) => handleChange('period', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block">Description</label>
                <textarea 
                  value={editedItem.description || ''} 
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 border rounded-md mb-2 bg-white cursor-move hover:shadow-md flex justify-between items-center">
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-gray-600">{item.company}</div>
              <div className="text-xs text-gray-500">{item.period}</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEditClick}>
              <Edit size={16} />
            </Button>
          </div>
        );
      case 'education':
        return isEditing ? (
          <div className="p-3 border rounded-md mb-2 bg-white">
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 block">Institution</label>
                <input 
                  type="text" 
                  value={editedItem.institution} 
                  onChange={(e) => handleChange('institution', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block">Degree</label>
                <input 
                  type="text" 
                  value={editedItem.degree} 
                  onChange={(e) => handleChange('degree', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block">Year</label>
                <input 
                  type="text" 
                  value={editedItem.year} 
                  onChange={(e) => handleChange('year', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block">Description</label>
                <textarea 
                  value={editedItem.description || ''} 
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 border rounded-md mb-2 bg-white cursor-move hover:shadow-md flex justify-between items-center">
            <div>
              <div className="font-medium">{item.degree}</div>
              <div className="text-sm text-gray-600">{item.institution}</div>
              <div className="text-xs text-gray-500">{item.year}</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEditClick}>
              <Edit size={16} />
            </Button>
          </div>
        );
      case 'skills':
        return isEditing ? (
          <div className="p-3 border rounded-md mb-2 bg-white">
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 block">Skill Name</label>
                <input 
                  type="text" 
                  value={editedItem.name} 
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 border rounded-md mb-2 bg-white cursor-move hover:shadow-md flex justify-between items-center">
            <div className="font-medium">{item.name}</div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEditClick}>
              <Edit size={16} />
            </Button>
          </div>
        );
      case 'projects':
        return isEditing ? (
          <div className="p-3 border rounded-md mb-2 bg-white">
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 block">Project Name</label>
                <input 
                  type="text" 
                  value={editedItem.name} 
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block">Description</label>
                <textarea 
                  value={editedItem.description || ''} 
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block">Link (optional)</label>
                <input 
                  type="text" 
                  value={editedItem.link || ''} 
                  onChange={(e) => handleChange('link', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 border rounded-md mb-2 bg-white cursor-move hover:shadow-md flex justify-between items-center">
            <div className="font-medium">{item.name}</div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEditClick}>
              <Edit size={16} />
            </Button>
          </div>
        );
      case 'certifications':
        return isEditing ? (
          <div className="p-3 border rounded-md mb-2 bg-white">
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 block">Certification Name</label>
                <input 
                  type="text" 
                  value={editedItem.name} 
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block">Issuer</label>
                <input 
                  type="text" 
                  value={editedItem.issuer} 
                  onChange={(e) => handleChange('issuer', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block">Date</label>
                <input 
                  type="text" 
                  value={editedItem.date} 
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 border rounded-md mb-2 bg-white cursor-move hover:shadow-md flex justify-between items-center">
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-600">{item.issuer}</div>
              <div className="text-xs text-gray-500">{item.date}</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEditClick}>
              <Edit size={16} />
            </Button>
          </div>
        );
      default:
        return (
          <div className="p-2 border rounded-md mb-2 bg-white cursor-move hover:shadow-md">
            {JSON.stringify(item)}
          </div>
        );
    }
  };
  
  return (
    <div 
      ref={drag} 
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`${isEditing ? 'cursor-default' : 'cursor-move'}`}
    >
      {renderContent()}
    </div>
  );
};

// Resume drop zone component
const ResumeDropZone = ({ onDrop, resumeContent, removeSection, reorderSections, userData, setUserData, setResumeContent, resumeRef, zoomLevel }) => {
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
  }, {});
  
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
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination, type } = result;
    
    // Handle section reordering
    if (type === 'section') {
      reorderSections(source.index, destination.index);
      return;
    }
    
    // Handle skills reordering in the resume view
    if (type === 'items-skills-resume') {
      const skillItems = [...resumeContent.selectedSkills];
      const [removed] = skillItems.splice(source.index, 1);
      skillItems.splice(destination.index, 0, removed);
      
      // Update resumeContent with the reordered skills
      setResumeContent(prev => ({
        ...prev,
        selectedSkills: skillItems
      }));
      
      toast.success("Reordered skills");
      return;
    }
    
    // Handle item reordering within a section
    if (type.startsWith('items-')) {
      const sectionType = type.replace('items-', '');
      
      // Get the items for this section
      const sectionItems = [...resumeContent.sections.filter(item => item.itemType === sectionType)];
      
      // Reorder the items
      const [removed] = sectionItems.splice(source.index, 1);
      sectionItems.splice(destination.index, 0, removed);
      
      // Update resumeContent with the reordered items
      setResumeContent(prev => {
        // Filter out the items of this section type
        const otherSections = prev.sections.filter(item => item.itemType !== sectionType);
        
        // Add back the reordered items
        return {
          ...prev,
          sections: [...otherSections, ...sectionItems]
        };
      });
      
      // Update userData with the reordered items
      setUserData(prevUserData => {
        // Create a deep copy of the sections
        const updatedSections = { ...prevUserData.sections };
        
        // Get the items for this section from userData
        const userDataSectionItems = [...updatedSections[sectionType]];
        
        // Find the items by ID to ensure we're reordering the correct ones
        const itemIds = sectionItems.map(item => item.id);
        
        // Create a new array with the items in the correct order
        const reorderedItems = [];
        
        // Add items in the new order
        itemIds.forEach(id => {
          const item = userDataSectionItems.find(item => item.id === id);
          if (item) {
            reorderedItems.push(item);
          }
        });
        
        // Add any remaining items that weren't in the resume
        userDataSectionItems.forEach(item => {
          if (!itemIds.includes(item.id)) {
            reorderedItems.push(item);
          }
        });
        
        // Update the section with the reordered items
        updatedSections[sectionType] = reorderedItems;
        
        return {
          ...prevUserData,
          sections: updatedSections
        };
      });
      
      toast.success(`Reordered ${sectionType} items`);
    }
  };

  return (
    <div 
      ref={(el) => {
        drop(el);
        if (resumeRef) resumeRef.current = el;
      }}
      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
      className={`mt-0 bg-white shadow-md border rounded-md paper-texture w-full mx-auto transition-all ${isOver ? 'border-primary shadow-lg' : 'border-gray-100'}`}
    >
      <div className="p-10" style={{ minHeight: '1100px' }}>
        {/* Professional header */}
        <div className="text-center mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{resumeContent.personalInfo.name}</h1>
          <p className="text-xl text-gray-600 font-medium mb-3">{resumeContent.personalInfo.title}</p>
          
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            {resumeContent.personalInfo.email && (
              <span className="flex items-center gap-1">
                {resumeContent.personalInfo.email}
              </span>
            )}
            {resumeContent.personalInfo.location && (
              <span className="flex items-center gap-1">
                {resumeContent.personalInfo.location}
              </span>
            )}
            {resumeContent.personalInfo.links?.linkedin && (
              <span className="flex items-center gap-1">
                {resumeContent.personalInfo.links.linkedin}
              </span>
            )}
          </div>
        </div>
        
        {/* Resume content sections */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="resume-sections" type="section">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-8"
              >
                {allSections.map(([sectionType, items], sectionIndex) => (
                  <Draggable 
                    key={`section-${sectionType}`} 
                    draggableId={`section-${sectionType}`} 
                    index={sectionIndex}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="mb-8 group relative"
                      >
                        {/* Section header with drag handle */}
                        <div 
                          {...provided.dragHandleProps}
                          className="flex items-center cursor-move mb-4"
                        >
                          <h2 className="text-xl font-bold text-gray-800 border-b pb-2 w-full capitalize">
                            {sectionType}
                          </h2>
                        </div>
                        
                        {/* Section items */}
                        {sectionType === 'skills' ? (
                          <Droppable 
                            droppableId={`droppable-skills-resume`} 
                            type={`items-skills-resume`}
                            direction="horizontal"
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex flex-wrap gap-3"
                              >
                                {(items as Array<{id: string, name: string}>).map((skill, index) => (
                                  <Draggable
                                    key={skill.id}
                                    draggableId={`resume-skill-${skill.id}`}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="bg-gray-100 px-3 py-1.5 rounded-md flex items-center cursor-move"
                                      >
                                        <span className="text-gray-700 text-sm">{skill.name}</span>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        ) : (
                          <Droppable 
                            droppableId={`droppable-${sectionType}`} 
                            type={`items-${sectionType}`}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="space-y-6"
                              >
                                {(items as Array<any>).map((item, itemIndex) => (
                                  <Draggable
                                    key={item.id || `item-${itemIndex}`}
                                    draggableId={item.id || `item-${itemIndex}`}
                                    index={itemIndex}
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className="mb-6 group relative"
                                      >
                                        <div 
                                          {...provided.dragHandleProps}
                                          className="absolute left-0 top-1/2 -translate-x-full -ml-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                                        >
                                          <div className="h-6 w-3 flex flex-col justify-center items-center">
                                            <div className="w-1 h-1 rounded-full bg-gray-400 mb-0.5"></div>
                                            <div className="w-1 h-1 rounded-full bg-gray-400 mb-0.5"></div>
                                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                          </div>
                                        </div>
                                        
                                        {sectionType === 'experience' && (
                                          <div className="mb-2">
                                            <div className="flex justify-between items-baseline mb-1">
                                              <h3 className="font-semibold text-gray-800 text-lg">{item.company}</h3>
                                              <span className="text-gray-600 text-sm">{item.period}</span>
                                            </div>
                                            <div className="text-gray-700 font-medium mb-2">{item.title}</div>
                                            {item.description && (
                                              <p className="text-sm text-gray-600">{item.description}</p>
                                            )}
                                          </div>
                                        )}
                                        
                                        {sectionType === 'education' && (
                                          <div className="mb-2">
                                            <div className="flex justify-between items-baseline mb-1">
                                              <h3 className="font-semibold text-gray-800 text-lg">{item.institution}</h3>
                                              <span className="text-gray-600 text-sm">{item.year}</span>
                                            </div>
                                            <div className="text-gray-700 font-medium mb-2">{item.degree}</div>
                                            {item.description && (
                                              <p className="text-sm text-gray-600">{item.description}</p>
                                            )}
                                          </div>
                                        )}
                                        
                                        {sectionType === 'projects' && (
                                          <div className="mb-2">
                                            <h3 className="font-semibold text-gray-800 text-lg mb-1">{item.name}</h3>
                                            {item.description && (
                                              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                            )}
                                            {item.link && (
                                              <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                                                {item.link}
                                              </a>
                                            )}
                                          </div>
                                        )}
                                        
                                        {sectionType === 'certifications' && (
                                          <div className="mb-2">
                                            <div className="flex justify-between items-baseline mb-1">
                                              <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                                              <span className="text-gray-600 text-sm">{item.date}</span>
                                            </div>
                                            <div className="text-gray-700 font-medium">{item.issuer}</div>
                                          </div>
                                        )}
                                        
                                        {/* Remove button */}
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-6 w-6 absolute bottom-0 right-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => removeSection(item.id)}
                                        >
                                          <X size={12} />
                                        </Button>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        )}
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
    </div>
  );
};

// Updated Editor component
export default function Editor() {
  const [openSections, setOpenSections] = useState({
    personalInfo: true,
    experience: true,
    education: true,
    skills: true,
    projects: false,
    certifications: false,
  });
  
  // Add state for user data
  const [userData, setUserData] = useState(mockUser);
  
  // Resume content to be built with dragged items
  const [resumeContent, setResumeContent] = useState({
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
  
  // Add state for personal info editing with proper typing
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [editedPersonalInfo, setEditedPersonalInfo] = useState<typeof resumeContent.personalInfo>({
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
  
  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  // Add state for selected skills
  const [selectedSkills, setSelectedSkills] = useState([]);
  
  // Define the reorderSections function
  const reorderSections = (sourceIndex, destinationIndex) => {
    setResumeContent(prev => {
      // Get current section types from allSections
      const sectionTypes = [...prev.sectionOrder];
      
      // If sectionOrder is empty, initialize it from current sections
      if (sectionTypes.length === 0) {
        // Get unique section types from sections
        const uniqueTypes = [...new Set(prev.sections.map(section => section.itemType))];
        
        // Add skills if they exist
        if (prev.selectedSkills?.length > 0 && !uniqueTypes.includes('skills')) {
          uniqueTypes.push('skills');
        }
        
        // Use these types as initial order
        sectionTypes.push(...uniqueTypes);
      }
      
      // Perform the reordering
      const [removed] = sectionTypes.splice(sourceIndex, 1);
      sectionTypes.splice(destinationIndex, 0, removed);
      
      // Return updated state with new section order
      return {
        ...prev,
        sectionOrder: sectionTypes
      };
    });
    
    toast.success("Sections reordered");
  };
  
  const handleDrop = (item) => {
    setResumeContent(prev => {
      // Check if this is an update to an existing item
      const isUpdate = prev.sections.some(section => section.id === item.id);
      
      let updatedSections;
      
      if (isUpdate) {
        // Update the existing item
        updatedSections = prev.sections.map(section => 
          section.id === item.id ? { ...item } : section
        );
        
        // Show success message outside this function to avoid multiple toasts
      } else {
        // Add the item to sections
        updatedSections = [...prev.sections, item];
        
        // Update section order if needed
        let updatedOrder = [...prev.sectionOrder];
        if (!updatedOrder.includes(item.itemType)) {
          updatedOrder.push(item.itemType);
        }
        
        // Show success message outside this function to avoid multiple toasts
        toast.success(`Added ${item.itemType} item to resume`);
        
        return {
          ...prev,
          sections: updatedSections,
          sectionOrder: updatedOrder
        };
      }
      
      return {
        ...prev,
        sections: updatedSections
      };
    });
  };
  
  const removeSection = (id) => {
    // Find the section to be removed to get its type
    const sectionToRemove = resumeContent.sections.find(section => section.id === id);
    
    if (sectionToRemove) {
      // Update resumeContent
      setResumeContent(prev => ({
        ...prev,
        sections: prev.sections.filter(section => section.id !== id)
      }));
      
      // Update userData
      setUserData(prev => {
        const sectionType = sectionToRemove.itemType;
        
        // Create a deep copy of the sections
        const updatedSections = { ...prev.sections };
        
        // Remove the item from the appropriate section if it exists
        if (updatedSections[sectionType]) {
          updatedSections[sectionType] = updatedSections[sectionType].filter(item => item.id !== id);
        }
        
        return {
          ...prev,
          sections: updatedSections
        };
      });
      
      toast.success("Item removed from resume");
    }
  };
  
  // Function to add a new experience
  const addExperience = () => {
    const newExperience = {
      id: `exp-${Date.now()}`,
      title: "New Position",
      company: "Company Name",
      period: "Start - End",
      description: "Description of your role and responsibilities",
      bulletPoints: []
    };
    
    // Update resumeContent
    setResumeContent(prev => ({
      ...prev,
      sections: [...prev.sections, {
        itemType: 'experience',
        ...newExperience
      }]
    }));
    
    // Update userData
    setUserData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        experience: [...prev.sections.experience, newExperience]
      }
    }));
    
    toast.success("Added new experience");
  };

  // Function to add a new education entry
  const addEducation = () => {
    const newEducation = {
      id: `edu-${Date.now()}`,
      degree: "Degree Name",
      institution: "Institution Name",
      year: "Graduation Year",
      description: "Description of your education"
    };
    
    // Update resumeContent
    setResumeContent(prev => ({
      ...prev,
      sections: [...prev.sections, {
        itemType: 'education',
        ...newEducation
      }]
    }));
    
    // Update userData
    setUserData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        education: [...prev.sections.education, newEducation]
      }
    }));
    
    toast.success("Added new education");
  };

  // Toggle skill selection
  const toggleSkill = (skill) => {
    setResumeContent(prev => {
      const isSelected = prev.selectedSkills.some(s => s.id === skill.id);
      let updatedSkills;
      let updatedOrder = [...prev.sectionOrder];
      
      if (isSelected) {
        // Remove skill
        updatedSkills = prev.selectedSkills.filter(s => s.id !== skill.id);
        
        // Remove skills from order if no skills left
        if (updatedSkills.length === 0 && updatedOrder.includes('skills')) {
          updatedOrder = updatedOrder.filter(type => type !== 'skills');
        }
      } else {
        // Add skill
        updatedSkills = [...prev.selectedSkills, skill];
        
        // Add skills to order if not already there
        if (!updatedOrder.includes('skills')) {
          updatedOrder.push('skills');
        }
      }
      
      return {
        ...prev,
        selectedSkills: updatedSkills,
        sectionOrder: updatedOrder
      };
    });
  };

  // Create a new AddSkillDialog component
  const AddSkillDialog = ({ onAdd }) => {
    const [skillName, setSkillName] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (skillName.trim()) {
        onAdd(skillName);
        setSkillName("");
        setIsOpen(false);
      }
    };
    
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full mt-2">
            <Plus size={16} className="mr-2" />
            Add Skill
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="skill-name" className="text-right">
                  Skill Name
                </Label>
                <Input
                  id="skill-name"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g. JavaScript, Project Management"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Skill</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Update the addSkill function to use the new dialog
  const addSkill = (skillName) => {
    const newSkill = {
      id: `skill-${Date.now()}`,
      name: skillName
    };
    
    // Add to user skills
    setUserData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        skills: [...prev.sections.skills, newSkill]
      }
    }));
    
    // Force re-render
    setOpenSections({...openSections});
    
    toast.success("Added new skill");
  };

  // Function to add a new project
  const addProject = () => {
    const newProject = {
      id: `proj-${Date.now()}`,
      name: "Project Name",
      description: "Description of your project",
      link: "https://example.com/project"
    };
    
    // Update resumeContent
    setResumeContent(prev => ({
      ...prev,
      sections: [...prev.sections, {
        itemType: 'projects',
        ...newProject
      }]
    }));
    
    // Update userData
    setUserData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        projects: [...prev.sections.projects, newProject]
      }
    }));
    
    toast.success("Added new project");
  };

  // Function to add a new certification
  const addCertification = () => {
    const newCertification = {
      id: `cert-${Date.now()}`,
      name: "Certification Name",
      issuer: "Issuing Organization",
      date: "Issue Date",
      expirationDate: "Expiration Date",
      credentialId: "Credential ID"
    };
    
    // Update resumeContent
    setResumeContent(prev => ({
      ...prev,
      sections: [...prev.sections, {
        itemType: 'certifications',
        ...newCertification
      }]
    }));
    
    // Update userData
    setUserData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        certifications: [...prev.sections.certifications, newCertification]
      }
    }));
    
    toast.success("Added new certification");
  };

  // Add this at the top of your Editor component to catch errors
  const [error, setError] = useState(null);

  // Add error boundary to your component
  useEffect(() => {
    const handleError = (error) => {
      console.error("Error in Editor component:", error);
      setError(error.message);
      // Prevent white screen by showing an error message
      toast.error("Something went wrong. Please try again.");
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Add this to your component's JSX to show errors instead of white screen
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-bold text-red-500">Something went wrong</h2>
        <p className="text-gray-600 mt-2">Please refresh the page and try again</p>
        <Button 
          className="mt-4" 
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  // Function to handle personal info edit
  const handleEditPersonalInfo = () => {
    setEditedPersonalInfo({...resumeContent.personalInfo});
    setIsEditingPersonalInfo(true);
  };
  
  // Function to save personal info changes
  const handleSavePersonalInfo = () => {
    setResumeContent(prev => ({
      ...prev,
      personalInfo: editedPersonalInfo
    }));
    
    // Update the userData state to sync with the edited personal info
    setUserData(prevUserData => ({
      ...prevUserData,
      name: editedPersonalInfo.name,
      title: editedPersonalInfo.title,
      email: editedPersonalInfo.email,
      location: editedPersonalInfo.location,
      links: {
        ...prevUserData.links,
        linkedin: editedPersonalInfo.links?.linkedin || prevUserData.links.linkedin
      }
    }));
    
    setIsEditingPersonalInfo(false);
    toast.success("Personal information updated");
  };
  
  // Function to cancel personal info edit
  const handleCancelPersonalInfo = () => {
    setIsEditingPersonalInfo(false);
  };
  
  // Function to handle personal info field changes
  const handlePersonalInfoChange = (field, value) => {
    setEditedPersonalInfo(prev => {
      if (field.includes('.')) {
        // Handle nested fields like links.linkedin
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Function to reorder items within a section in userData
  const reorderSectionItems = (sectionType, sourceIndex, destinationIndex) => {
    setUserData(prevUserData => {
      // Create a deep copy of the sections
      const updatedSections = { ...prevUserData.sections };
      
      // Get the items for this section
      const sectionItems = [...updatedSections[sectionType]];
      
      // Reorder the items
      const [removed] = sectionItems.splice(sourceIndex, 1);
      sectionItems.splice(destinationIndex, 0, removed);
      
      // Update the section with the reordered items
      updatedSections[sectionType] = sectionItems;
      
      return {
        ...prevUserData,
        sections: updatedSections
      };
    });
    
    toast.success(`Reordered ${sectionType} items`);
  };

  // Function to delete a skill from userData
  const deleteSkill = (skillId) => {
    // Update userData
    setUserData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        skills: prev.sections.skills.filter(skill => skill.id !== skillId)
      }
    }));
    
    // Update resumeContent if the skill was selected
    setResumeContent(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.filter(skill => skill.id !== skillId)
    }));
    
    toast.success("Skill deleted");
  };

  // Add state for page format
  const [pageFormat, setPageFormat] = useState('a4');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // Create a ref for the resume element
  const resumeRef = useRef(null);
  
  // Function to handle export dialog open
  const openExportDialog = () => {
    setExportDialogOpen(true);
  };
  
  // Function to handle export dialog close
  const closeExportDialog = () => {
    setExportDialogOpen(false);
  };
  
  // Function to handle page format change
  const handlePageFormatChange = (value) => {
    setPageFormat(value);
  };
  
  // Function to export resume as PDF
  const exportAsPDF = async () => {
    if (!resumeRef.current) {
      toast.error("Resume element not found");
      return;
    }
    
    try {
      toast.loading("Generating PDF...");
      
      // Get dimensions based on page format
      let width, height;
      switch (pageFormat) {
        case 'a4':
          width = 210;
          height = 297;
          break;
        case 'letter':
          width = 215.9;
          height = 279.4;
          break;
        case 'legal':
          width = 215.9;
          height = 355.6;
          break;
        default:
          width = 210;
          height = 297;
      }
      
      // Create a new PDF with the correct dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [width, height]
      });
      
      // Add personal information
      const { name, title, email, location, links } = resumeContent.personalInfo;
      
      // Calculate content amount to determine spacing
      const contentAmount = resumeContent.sections.length;
      const sectionItems = resumeContent.sections.reduce((count, section) => count + 1, 0);
      const totalItems = sectionItems + (resumeContent.selectedSkills.length > 0 ? 1 : 0);
      
      // Calculate available space
      const usableHeight = height - 30; // 30mm for margins
      
      // Calculate how much space each section should take
      // We'll allocate space proportionally based on content
      const headerSpace = Math.min(50, usableHeight * 0.15); // 15% for header, max 50mm
      const remainingSpace = usableHeight - headerSpace;
      
      // Calculate spacing between sections to fill the page
      const sectionCount = resumeContent.sectionOrder.length;
      const sectionSpacing = Math.max(8, remainingSpace * 0.05 / sectionCount); // At least 8mm between sections
      
      // Set margins
      const leftMargin = 15;
      const rightMargin = width - 15;
      const topMargin = 15;
      
      // Set font sizes - larger for less content, smaller for more content
      const contentDensity = totalItems / sectionCount;
      const headerFontSize = Math.max(16, Math.min(24, 30 - contentDensity * 2));
      const subheaderFontSize = Math.max(12, Math.min(18, 24 - contentDensity * 2));
      const normalFontSize = Math.max(9, Math.min(12, 14 - contentDensity));
      const sectionHeaderFontSize = Math.max(12, Math.min(16, 20 - contentDensity));
      const itemHeaderFontSize = Math.max(10, Math.min(14, 18 - contentDensity));
      
      // Set font styles
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(headerFontSize);
      pdf.setTextColor(0, 0, 0);
      
      // Add name centered at the top
      pdf.text(name, width / 2, topMargin, { align: 'center' });
      
      // Add title
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(subheaderFontSize);
      pdf.text(title, width / 2, topMargin + headerSpace * 0.25, { align: 'center' });
      
      // Add contact info
      pdf.setFontSize(normalFontSize);
      let contactText = '';
      if (email) contactText += email;
      if (location) contactText += contactText ? ' | ' + location : location;
      if (links?.linkedin) contactText += contactText ? ' | ' + links.linkedin : links.linkedin;
      
      pdf.text(contactText, width / 2, topMargin + headerSpace * 0.5, { align: 'center' });
      
      // Add horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(leftMargin, topMargin + headerSpace * 0.7, rightMargin, topMargin + headerSpace * 0.7);
      
      // Current Y position for content
      let yPos = topMargin + headerSpace;
      
      // Calculate total sections to distribute space
      const sectionsWithContent = resumeContent.sectionOrder.filter(sectionType => {
        if (sectionType === 'skills') return resumeContent.selectedSkills.length > 0;
        return resumeContent.sections.some(item => item.itemType === sectionType);
      });
      
      // Calculate space per section
      const spacePerSection = remainingSpace / Math.max(1, sectionsWithContent.length);
      
      // Process each section
      resumeContent.sectionOrder.forEach((sectionType, sectionIndex) => {
        // Skip empty sections
        const sectionItems = sectionType === 'skills' 
          ? resumeContent.selectedSkills 
          : resumeContent.sections.filter(item => item.itemType === sectionType);
          
        if (sectionItems.length === 0) return;
        
        // Calculate space for this section
        const isLastSection = sectionIndex === sectionsWithContent.length - 1;
        const sectionSpace = isLastSection 
          ? (height - yPos - topMargin) // Use all remaining space for last section
          : spacePerSection;
        
        // Add section header
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(sectionHeaderFontSize);
        pdf.text(sectionType.charAt(0).toUpperCase() + sectionType.slice(1), leftMargin, yPos + 8);
        
        // Space after section header
        const headerSpace = sectionSpace * 0.1;
        yPos += headerSpace;
        
        // Calculate space for items
        const itemCount = sectionItems.length;
        const spacePerItem = (sectionSpace - headerSpace) / Math.max(1, itemCount);
        
        // Add section content
        if (sectionType === 'skills' && resumeContent.selectedSkills.length > 0) {
          // Handle skills section
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(normalFontSize);
          
          const skillsText = resumeContent.selectedSkills.map(skill => skill.name).join(' | ');
          
          // Split long text into multiple lines if needed
          const splitSkills = pdf.splitTextToSize(skillsText, width - (leftMargin + 15));
          pdf.text(splitSkills, leftMargin, yPos + 8);
          
          // Move to next section
          yPos += sectionSpace - headerSpace;
        } else {
          // Handle other sections
          sectionItems.forEach((item, itemIndex) => {
            const isLastItem = itemIndex === sectionItems.length - 1;
            const itemSpace = isLastItem 
              ? (sectionSpace - headerSpace - (spacePerItem * itemIndex)) // Use remaining section space
              : spacePerItem;
            
            // Calculate line spacing based on available space
            const lineCount = item.description ? 
              (item.description.length / 80) + 3 : // Estimate 3 lines + description
              3; // Minimum 3 lines (title, subtitle, etc)
            
            const lineSpacing = Math.max(4, itemSpace / lineCount);
            
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(itemHeaderFontSize);
            
            if (sectionType === 'experience') {
              // Company and period on the same line
              pdf.text(item.company, leftMargin, yPos + 8);
              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(normalFontSize);
              pdf.text(item.period, rightMargin, yPos + 8, { align: 'right' });
              yPos += lineSpacing;
              
              // Job title
              pdf.setFont("helvetica", "italic");
              pdf.text(item.title, leftMargin, yPos + 8);
              yPos += lineSpacing;
              
              // Description
              if (item.description) {
                pdf.setFont("helvetica", "normal");
                const splitDescription = pdf.splitTextToSize(item.description, width - (leftMargin + 15));
                
                // Calculate how many lines we can fit
                const availableSpace = itemSpace - (lineSpacing * 2);
                const maxLines = Math.floor(availableSpace / (lineSpacing * 0.8));
                const linesToShow = Math.min(splitDescription.length, maxLines);
                
                pdf.text(splitDescription.slice(0, linesToShow), leftMargin, yPos + 8);
                yPos += linesToShow * (lineSpacing * 0.8);
              }
              
              // Move to next item position
              yPos += itemSpace - (lineSpacing * (item.description ? 3 : 2));
            } else if (sectionType === 'education') {
              // Institution and year on the same line
              pdf.text(item.institution, leftMargin, yPos + 8);
              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(normalFontSize);
              pdf.text(item.year, rightMargin, yPos + 8, { align: 'right' });
              yPos += lineSpacing;
              
              // Degree
              pdf.setFont("helvetica", "italic");
              pdf.text(item.degree, leftMargin, yPos + 8);
              yPos += lineSpacing;
              
              // Description
              if (item.description) {
                pdf.setFont("helvetica", "normal");
                const splitDescription = pdf.splitTextToSize(item.description, width - (leftMargin + 15));
                
                // Calculate how many lines we can fit
                const availableSpace = itemSpace - (lineSpacing * 2);
                const maxLines = Math.floor(availableSpace / (lineSpacing * 0.8));
                const linesToShow = Math.min(splitDescription.length, maxLines);
                
                pdf.text(splitDescription.slice(0, linesToShow), leftMargin, yPos + 8);
                yPos += linesToShow * (lineSpacing * 0.8);
              }
              
              // Move to next item position
              yPos += itemSpace - (lineSpacing * (item.description ? 3 : 2));
            } else if (sectionType === 'projects') {
              // Project name
              pdf.text(item.name, leftMargin, yPos + 8);
              yPos += lineSpacing;
              
              // Description
              if (item.description) {
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(normalFontSize);
                const splitDescription = pdf.splitTextToSize(item.description, width - (leftMargin + 15));
                
                // Calculate how many lines we can fit
                const availableSpace = itemSpace - (lineSpacing * 2);
                const maxLines = Math.floor(availableSpace / (lineSpacing * 0.8));
                const linesToShow = Math.min(splitDescription.length, maxLines);
                
                pdf.text(splitDescription.slice(0, linesToShow), leftMargin, yPos + 8);
                yPos += linesToShow * (lineSpacing * 0.8);
              }
              
              // Link
              if (item.link) {
                pdf.setTextColor(0, 0, 255);
                pdf.text(item.link, leftMargin, yPos + 8);
                pdf.setTextColor(0, 0, 0);
                yPos += lineSpacing;
              }
              
              // Move to next item position
              yPos += itemSpace - (lineSpacing * (item.description ? 2 : 1) - (item.link ? lineSpacing : 0));
            } else if (sectionType === 'certifications') {
              // Certification name and date on the same line
              pdf.text(item.name, leftMargin, yPos + 8);
              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(normalFontSize);
              pdf.text(item.date, rightMargin, yPos + 8, { align: 'right' });
              yPos += lineSpacing;
              
              // Issuer
              pdf.setFont("helvetica", "italic");
              pdf.text(item.issuer, leftMargin, yPos + 8);
              
              // Move to next item position
              yPos += itemSpace - lineSpacing;
            }
          });
        }
      });
      
      // Save the PDF
      pdf.save(`${resumeContent.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`);
      
      toast.dismiss();
      toast.success("PDF downloaded successfully");
      closeExportDialog();
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };
  
  // Function to export resume as DOCX
  const exportAsDOCX = async () => {
    if (!resumeRef.current) {
      toast.error("Resume element not found");
      return;
    }
    
    try {
      toast.loading("Generating DOCX...");
      
      // Create document sections array
      const docSections = [];
      
      // Add personal information section
      const { name, title, email, location, links } = resumeContent.personalInfo;
      
      // Calculate content amount to determine spacing
      const contentAmount = resumeContent.sections.length;
      const sectionItems = resumeContent.sections.reduce((count, section) => count + 1, 0);
      const totalItems = sectionItems + (resumeContent.selectedSkills.length > 0 ? 1 : 0);
      
      // Calculate spacing to fill the page
      const contentDensity = totalItems / Math.max(1, resumeContent.sectionOrder.length);
      
      // Base spacing on content density - less content means more spacing
      const baseSpacing = Math.max(120, 600 - (contentDensity * 50));
      const sectionSpacing = Math.max(200, 800 - (contentDensity * 80));
      const paragraphSpacing = Math.max(80, 300 - (contentDensity * 30));
      
      // Calculate section distribution
      const sectionsWithContent = resumeContent.sectionOrder.filter(sectionType => {
        if (sectionType === 'skills') return resumeContent.selectedSkills.length > 0;
        return resumeContent.sections.some(item => item.itemType === sectionType);
      });
      
      // Create header with personal info - larger for less content
      const nameFontSize = Math.max(24, Math.min(36, 40 - contentDensity * 2));
      const titleFontSize = Math.max(16, Math.min(24, 28 - contentDensity * 2));
      const contactFontSize = Math.max(12, Math.min(16, 20 - contentDensity * 1.5));
      
      docSections.push(
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: name,
              bold: true,
              size: nameFontSize,
              font: "Inter",
            }),
          ],
          alignment: docx.AlignmentType.CENTER,
          spacing: { after: baseSpacing },
        })
      );
      
      docSections.push(
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: title,
              size: titleFontSize,
              font: "Inter",
            }),
          ],
          alignment: docx.AlignmentType.CENTER,
          spacing: { after: baseSpacing },
        })
      );
      
      // Contact info
      const contactText = [
        email,
        location ? location : '',
        links?.linkedin ? links.linkedin : ''
      ].filter(Boolean).join(' | ');
      
      docSections.push(
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: contactText,
              size: contactFontSize,
              font: "Inter",
            }),
          ],
          alignment: docx.AlignmentType.CENTER,
          spacing: { after: baseSpacing },
        })
      );
      
      // Add horizontal line
      docSections.push(
        new docx.Paragraph({
          text: "",
          border: {
            bottom: { color: "999999", space: 1, style: docx.BorderStyle.SINGLE, size: 6 },
          },
          spacing: { after: baseSpacing },
        })
      );
      
      // Process each section
      resumeContent.sectionOrder.forEach((sectionType, sectionIndex) => {
        // Skip empty sections
        const sectionItems = sectionType === 'skills' 
          ? resumeContent.selectedSkills 
          : resumeContent.sections.filter(item => item.itemType === sectionType);
          
        if (sectionItems.length === 0) return;
        
        // Calculate if this is the last section with content
        const isLastSection = sectionIndex === sectionsWithContent.length - 1;
        
        // Section header font size - larger for less content
        const sectionHeaderSize = Math.max(20, Math.min(28, 32 - contentDensity * 2));
        
        // Add section header
        docSections.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: sectionType.charAt(0).toUpperCase() + sectionType.slice(1),
                bold: true,
                size: sectionHeaderSize,
                font: "Inter",
              }),
            ],
            spacing: { before: sectionSpacing / 2, after: sectionSpacing / 2 },
          })
        );
        
        // Add section content
        if (sectionType === 'skills' && resumeContent.selectedSkills.length > 0) {
          // Handle skills section
          const skillsText = resumeContent.selectedSkills.map(skill => skill.name).join(' | ');
          
          docSections.push(
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: skillsText,
                  font: "Inter",
                }),
              ],
              spacing: { after: isLastSection ? sectionSpacing * 2 : sectionSpacing },
            })
          );
        } else {
          // Handle other sections
          const itemCount = sectionItems.length;
          
          // Calculate spacing between items to fill the page
          // More items = less spacing
          const itemSpacing = Math.max(paragraphSpacing, 
            (sectionSpacing * 2) / Math.max(1, itemCount));
          
          sectionItems.forEach((item, itemIndex) => {
            const isLastItem = itemIndex === sectionItems.length - 1;
            const afterSpacing = isLastItem && isLastSection 
              ? sectionSpacing * 2  // Extra space after last item in last section
              : isLastItem 
                ? sectionSpacing    // Space after last item in a section
                : itemSpacing;      // Space between items
            
            // Item font sizes - larger for less content
            const itemTitleSize = Math.max(16, Math.min(24, 28 - contentDensity * 2));
            const itemSubtitleSize = Math.max(14, Math.min(20, 24 - contentDensity * 2));
            const itemTextSize = Math.max(12, Math.min(16, 20 - contentDensity * 2));
            
            if (sectionType === 'experience') {
              // Company and period
              docSections.push(
                new docx.Paragraph({
                  children: [
                    new docx.TextRun({
                      text: item.company,
                      bold: true,
                      size: itemTitleSize,
                      font: "Inter",
                    }),
                    new docx.TextRun({
                      text: `  ${item.period}`,
                      size: itemTextSize,
                      font: "Inter",
                    }),
                  ],
                  spacing: { before: itemSpacing / 2 },
                })
              );
              
              // Job title
              docSections.push(
                new docx.Paragraph({
                  children: [
                    new docx.TextRun({
                      text: item.title,
                      italics: true,
                      size: itemSubtitleSize,
                      font: "Inter",
                    }),
                  ],
                  spacing: { before: itemSpacing / 4 },
                })
              );
              
              // Description
              if (item.description) {
                docSections.push(
                  new docx.Paragraph({
                    children: [
                      new docx.TextRun({
                        text: item.description,
                        size: itemTextSize,
                        font: "Inter",
                      }),
                    ],
                    spacing: { before: itemSpacing / 4, after: afterSpacing },
                  })
                );
              } else {
                // Add spacing after if no description
                docSections.push(
                  new docx.Paragraph({
                    text: "",
                    spacing: { after: afterSpacing },
                  })
                );
              }
            } else if (sectionType === 'education') {
              // Institution and year
              docSections.push(
                new docx.Paragraph({
                  children: [
                    new docx.TextRun({
                      text: item.institution,
                      bold: true,
                      size: itemTitleSize,
                      font: "Inter",
                    }),
                    new docx.TextRun({
                      text: `  ${item.year}`,
                      size: itemTextSize,
                      font: "Inter",
                    }),
                  ],
                  spacing: { before: itemSpacing / 2 },
                })
              );
              
              // Degree
              docSections.push(
                new docx.Paragraph({
                  children: [
                    new docx.TextRun({
                      text: item.degree,
                      italics: true,
                      size: itemSubtitleSize,
                      font: "Inter",
                    }),
                  ],
                  spacing: { before: itemSpacing / 4 },
                })
              );
              
              // Description
              if (item.description) {
                docSections.push(
                  new docx.Paragraph({
                    children: [
                      new docx.TextRun({
                        text: item.description,
                        size: itemTextSize,
                        font: "Inter",
                      }),
                    ],
                    spacing: { before: itemSpacing / 4, after: afterSpacing },
                  })
                );
              } else {
                // Add spacing after if no description
                docSections.push(
                  new docx.Paragraph({
                    text: "",
                    spacing: { after: afterSpacing },
                  })
                );
              }
            } else if (sectionType === 'projects') {
              // Project name
              docSections.push(
                new docx.Paragraph({
                  children: [
                    new docx.TextRun({
                      text: item.name,
                      bold: true,
                      size: itemTitleSize,
                      font: "Inter",
                    }),
                  ],
                  spacing: { before: itemSpacing / 2 },
                })
              );
              
              // Description
              if (item.description) {
                docSections.push(
                  new docx.Paragraph({
                    children: [
                      new docx.TextRun({
                        text: item.description,
                        size: itemTextSize,
                        font: "Inter",
                      }),
                    ],
                    spacing: { before: itemSpacing / 4 },
                  })
                );
              }
              
              // Link
              if (item.link) {
                docSections.push(
                  new docx.Paragraph({
                    children: [
                      new docx.ExternalHyperlink({
                        children: [
                          new docx.TextRun({
                            text: item.link,
                            style: "hyperlink",
                            color: "0000FF",
                            underline: {
                              type: docx.UnderlineType.SINGLE,
                            },
                            size: itemTextSize,
                            font: "Inter",
                          }),
                        ],
                        link: item.link,
                      }),
                    ],
                    spacing: { before: itemSpacing / 4, after: afterSpacing },
                  })
                );
              } else {
                // Add spacing after if no link
                docSections.push(
                  new docx.Paragraph({
                    text: "",
                    spacing: { after: afterSpacing },
                  })
                );
              }
            } else if (sectionType === 'certifications') {
              // Certification name and date
              docSections.push(
                new docx.Paragraph({
                  children: [
                    new docx.TextRun({
                      text: item.name,
                      bold: true,
                      size: itemTitleSize,
                      font: "Inter",
                    }),
                    new docx.TextRun({
                      text: `  ${item.date}`,
                      size: itemTextSize,
                      font: "Inter",
                    }),
                  ],
                  spacing: { before: itemSpacing / 2 },
                })
              );
              
              // Issuer
              docSections.push(
                new docx.Paragraph({
                  children: [
                    new docx.TextRun({
                      text: item.issuer,
                      italics: true,
                      size: itemSubtitleSize,
                      font: "Inter",
                    }),
                  ],
                  spacing: { before: itemSpacing / 4, after: afterSpacing },
                })
              );
            }
          });
        }
      });
      
      // Create the document with proper page size
      const doc = new docx.Document({
        sections: [
          {
            properties: {
              page: {
                size: {
                  width: pageFormat === 'a4' ? docx.convertMillimetersToTwip(210) : 
                         pageFormat === 'letter' ? docx.convertMillimetersToTwip(215.9) : 
                         docx.convertMillimetersToTwip(215.9),
                  height: pageFormat === 'a4' ? docx.convertMillimetersToTwip(297) : 
                          pageFormat === 'letter' ? docx.convertMillimetersToTwip(279.4) : 
                          docx.convertMillimetersToTwip(355.6),
                },
                margin: {
                  top: docx.convertMillimetersToTwip(15),
                  right: docx.convertMillimetersToTwip(15),
                  bottom: docx.convertMillimetersToTwip(15),
                  left: docx.convertMillimetersToTwip(15),
                },
              },
            },
            children: docSections,
          },
        ],
      });
      
      // Generate the document as a blob
      docx.Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${resumeContent.personalInfo.name.replace(/\s+/g, '_')}_Resume.docx`);
        toast.dismiss();
        toast.success("DOCX downloaded successfully");
        closeExportDialog();
      });
    } catch (error) {
      console.error("Error generating DOCX:", error);
      toast.dismiss();
      toast.error("Failed to generate DOCX");
    }
  };

  // Add state for zoom level
  const [zoomLevel, setZoomLevel] = useState(1);
  const [previewPageSize, setPreviewPageSize] = useState('a4');
  
  // Function to handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  };
  
  // Function to handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // Function to reset zoom
  const handleResetZoom = () => {
    setZoomLevel(1);
  };
  
  // Function to handle page size change
  const handlePageSizeChange = (value) => {
    setPreviewPageSize(value);
  };

  // Function to get page dimensions based on format
  const getPageDimensions = (format) => {
    switch (format) {
      case 'a4':
        return { width: 210, height: 297 };
      case 'letter':
        return { width: 215.9, height: 279.4 };
      case 'legal':
        return { width: 215.9, height: 355.6 };
      default:
        return { width: 210, height: 297 };
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <div className="container mx-auto px-4 py-4 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold">Resume Builder</h1>
              <p className="text-gray-600">Create and customize your professional resume</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={openExportDialog}>
                <Download className="mr-2 h-4 w-4" />
                Export Resume
              </Button>
            </div>
          </div>
          
          {/* Export Dialog */}
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Export Resume</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="page-format" className="text-right">
                    Page Format
                  </Label>
                  <Select
                    value={pageFormat}
                    onValueChange={handlePageFormatChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select page format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Button onClick={exportAsPDF} className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Download as PDF
                  </Button>
                  <Button onClick={exportAsDOCX} className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Download as DOCX
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <main className="flex-1 bg-muted/30 flex flex-col">
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Left side - Sections to drag from */}
              <div className="w-full lg:w-1/3 border-r overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-bold mb-2">Resume Sections</h2>
                  <p className="text-gray-600 text-sm">Drag sections onto your resume or click to edit</p>
                </div>
                
                <div className="overflow-y-auto flex-1 p-4" style={{ overflowY: 'auto', height: 'calc(100% - 80px)' }}>
                  {/* Personal Info Section */}
                  <DraggableSection 
                    title="Personal Information" 
                    isOpen={openSections.personalInfo}
                    toggleOpen={() => toggleSection('personalInfo')}
                  >
                    {isEditingPersonalInfo ? (
                      <div className="p-3 border rounded-md mb-2 bg-white">
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500 block">Full Name</label>
                            <input 
                              type="text" 
                              value={editedPersonalInfo.name || ''} 
                              onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                              className="w-full p-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block">Professional Title</label>
                            <input 
                              type="text" 
                              value={editedPersonalInfo.title || ''} 
                              onChange={(e) => handlePersonalInfoChange('title', e.target.value)}
                              className="w-full p-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block">Email</label>
                            <input 
                              type="email" 
                              value={editedPersonalInfo.email || ''} 
                              onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                              className="w-full p-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block">Location</label>
                            <input 
                              type="text" 
                              value={editedPersonalInfo.location || ''} 
                              onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                              className="w-full p-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block">LinkedIn</label>
                            <input 
                              type="text" 
                              value={editedPersonalInfo.links?.linkedin || ''} 
                              onChange={(e) => handlePersonalInfoChange('links.linkedin', e.target.value)}
                              className="w-full p-1 border rounded text-sm"
                            />
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={handleCancelPersonalInfo}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSavePersonalInfo}>
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img src={userData.avatarUrl} alt={resumeContent.personalInfo.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-medium">{resumeContent.personalInfo.name}</div>
                            <div className="text-sm text-gray-500">{resumeContent.personalInfo.title}</div>
                          </div>
                          <Button variant="ghost" size="icon" className="ml-auto" onClick={handleEditPersonalInfo}>
                            <Edit size={16} />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="text-sm">
                            <span className="font-medium">Email:</span> {resumeContent.personalInfo.email}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Location:</span> {resumeContent.personalInfo.location}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">LinkedIn:</span> {resumeContent.personalInfo.links?.linkedin}
                          </div>
                        </div>
                      </>
                    )}
                  </DraggableSection>
                  
                  {/* Experience Section */}
                  <DraggableSection 
                    title="Experience" 
                    isOpen={openSections.experience}
                    toggleOpen={() => toggleSection('experience')}
                  >
                    <DragDropContext onDragEnd={(result) => {
                      if (!result.destination) return;
                      reorderSectionItems('experience', result.source.index, result.destination.index);
                    }}>
                      <Droppable droppableId="experience-items" type="experience-items">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {userData.sections.experience.map((exp, index) => (
                              <Draggable 
                                key={exp.id} 
                                draggableId={exp.id} 
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                  >
                                    <div className="flex items-center">
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="mr-2 cursor-move opacity-50 hover:opacity-100"
                                      >
                                        <div className="h-6 w-3 flex flex-col justify-center items-center">
                                          <div className="w-1 h-1 rounded-full bg-gray-400 mb-0.5"></div>
                                          <div className="w-1 h-1 rounded-full bg-gray-400 mb-0.5"></div>
                                          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <DraggableItem 
                                          item={exp} 
                                          type="experience" 
                                          onDrop={handleDrop} 
                                          userData={userData} 
                                          setUserData={setUserData} 
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <Button variant="ghost" size="sm" className="w-full mt-2" onClick={addExperience}>
                      <Plus size={16} className="mr-2" />
                      Add Experience
                    </Button>
                  </DraggableSection>
                  
                  {/* Education Section */}
                  <DraggableSection 
                    title="Education" 
                    isOpen={openSections.education}
                    toggleOpen={() => toggleSection('education')}
                  >
                    <DragDropContext onDragEnd={(result) => {
                      if (!result.destination) return;
                      reorderSectionItems('education', result.source.index, result.destination.index);
                    }}>
                      <Droppable droppableId="education-items" type="education-items">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {userData.sections.education.map((edu, index) => (
                              <Draggable 
                                key={edu.id} 
                                draggableId={edu.id} 
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                  >
                                    <div className="flex items-center">
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="mr-2 cursor-move opacity-50 hover:opacity-100"
                                      >
                                        <div className="h-6 w-3 flex flex-col justify-center items-center">
                                          <div className="w-1 h-1 rounded-full bg-gray-400 mb-0.5"></div>
                                          <div className="w-1 h-1 rounded-full bg-gray-400 mb-0.5"></div>
                                          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <DraggableItem 
                                          item={edu} 
                                          type="education" 
                                          onDrop={handleDrop} 
                                          userData={userData} 
                                          setUserData={setUserData} 
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <Button variant="ghost" size="sm" className="w-full mt-2" onClick={addEducation}>
                      <Plus size={16} className="mr-2" />
                      Add Education
                    </Button>
                  </DraggableSection>
                  
                  {/* Skills Section */}
                  <DraggableSection 
                    title="Skills" 
                    isOpen={openSections.skills}
                    toggleOpen={() => toggleSection('skills')}
                  >
                    <DragDropContext onDragEnd={(result) => {
                      if (!result.destination) return;
                      reorderSectionItems('skills', result.source.index, result.destination.index);
                      
                      // Also update the selected skills order in resumeContent if they're selected
                      const reorderedSkills = [...userData.sections.skills];
                      const [removed] = reorderedSkills.splice(result.source.index, 1);
                      reorderedSkills.splice(result.destination.index, 0, removed);
                      
                      setResumeContent(prev => {
                        // Create a new array with the skills in the correct order
                        const updatedSelectedSkills = [];
                        
                        // Add skills in the new order if they were already selected
                        reorderedSkills.forEach(skill => {
                          if (prev.selectedSkills.some(s => s.id === skill.id)) {
                            updatedSelectedSkills.push(skill);
                          }
                        });
                        
                        return {
                          ...prev,
                          selectedSkills: updatedSelectedSkills
                        };
                      });
                    }}>
                      <Droppable droppableId="skills-items" type="skills-items">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              {userData.sections.skills.map((skill, index) => (
                                <Draggable 
                                  key={skill.id} 
                                  draggableId={skill.id} 
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="flex items-center"
                                    >
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="mr-2 cursor-move opacity-50 hover:opacity-100"
                                      >
                                        <div className="h-6 w-3 flex flex-col justify-center items-center">
                                          <div className="w-1 h-1 rounded-full bg-gray-400 mb-0.5"></div>
                                          <div className="w-1 h-1 rounded-full bg-gray-400 mb-0.5"></div>
                                          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                        </div>
                                      </div>
                                      <div className="flex items-center flex-1">
                                        <input 
                                          type="checkbox" 
                                          id={`skill-${skill.id}`}
                                          className="mr-2"
                                          checked={resumeContent.selectedSkills.some(s => s.id === skill.id)}
                                          onChange={() => toggleSkill(skill)}
                                        />
                                        <label htmlFor={`skill-${skill.id}`} className="text-sm flex-1">{skill.name}</label>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-6 w-6 text-gray-400 hover:text-destructive"
                                          onClick={() => deleteSkill(skill.id)}
                                        >
                                          <Trash size={14} />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <AddSkillDialog onAdd={addSkill} />
                  </DraggableSection>
                  
                  {/* Projects Section */}
                  <DraggableSection 
                    title="Projects" 
                    isOpen={openSections.projects}
                    toggleOpen={() => toggleSection('projects')}
                  >
                    <DragDropContext onDragEnd={(result) => {
                      if (!result.destination) return;
                      reorderSectionItems('projects', result.source.index, result.destination.index);
                    }}>
                      <Droppable droppableId="projects-items" type="projects-items">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {userData.sections.projects.map((project, index) => (
                              <Draggable 
                                key={project.id} 
                                draggableId={project.id} 
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                  >
                                    <div className="flex items-center">
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="mr-2 cursor-move opacity-50 hover:opacity-100"
                                      >
                                        <div className="h-6 w-3 flex flex-col justify-center items-center">
                                          <div className="w-1 h-1 rounded-full bg-gray-400 mb-0.5"></div>
                                          <div className="w-1 h-1 rounded-full bg-gray-400 mb-0.5"></div>
                                          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <DraggableItem 
                                          item={project} 
                                          type="projects" 
                                          onDrop={handleDrop} 
                                          userData={userData} 
                                          setUserData={setUserData} 
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <Button variant="ghost" size="sm" className="w-full mt-2" onClick={addProject}>
                      <Plus size={16} className="mr-2" />
                      Add Project
                    </Button>
                  </DraggableSection>
                  
                  {/* Certifications Section */}
                  <DraggableSection 
                    title="Certifications" 
                    isOpen={openSections.certifications}
                    toggleOpen={() => toggleSection('certifications')}
                  >
                    <DragDropContext onDragEnd={(result) => {
                      if (!result.destination) return;
                      reorderSectionItems('certifications', result.source.index, result.destination.index);
                    }}>
                      <Droppable droppableId="certifications-items" type="certifications-items">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {userData.sections.certifications.map((cert, index) => (
                              <Draggable 
                                key={cert.id} 
                                draggableId={cert.id} 
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                  >
                                    <div className="flex items-center">
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="mr-2 cursor-move opacity-50 hover:opacity-100"
                                      >
                                        <div className="h-6 w-3 flex flex-col justify-center items-center">
                                          <div className="w-1 h-1 rounded-full bg-gray-400 mb-0.5"></div>
                                          <div className="w-1 h-1 rounded-full bg-gray-400 mb-0.5"></div>
                                          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <DraggableItem 
                                          item={cert} 
                                          type="certifications" 
                                          onDrop={handleDrop} 
                                          userData={userData} 
                                          setUserData={setUserData} 
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <Button variant="ghost" size="sm" className="w-full mt-2" onClick={addCertification}>
                      <Plus size={16} className="mr-2" />
                      Add Certification
                    </Button>
                  </DraggableSection>
                </div>
              </div>
              
              {/* Right side - Resume preview */}
              <div className="hidden lg:flex lg:w-2/3 flex-col overflow-hidden h-[calc(100vh-12rem)]">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">Resume Preview</h2>
                      <p className="text-sm text-gray-500">Drag items from the left panel</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="preview-page-size" className="mr-2 text-sm">
                          Page Size:
                        </Label>
                        <Select
                          value={previewPageSize}
                          onValueChange={handlePageSizeChange}
                        >
                          <SelectTrigger className="h-8 w-24">
                            <SelectValue placeholder="Page Size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="a4">A4</SelectItem>
                            <SelectItem value="letter">Letter</SelectItem>
                            <SelectItem value="legal">Legal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8">
                          <ZoomOut size={16} />
                        </Button>
                        <span className="text-sm w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                        <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8">
                          <ZoomIn size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleResetZoom} className="h-8 w-8">
                          <Maximize size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="flex-1 p-6 bg-gray-100 overflow-auto" 
                  style={{ 
                    height: 'calc(100% - 80px)',
                    overflowY: 'auto',
                    overflowX: 'auto'
                  }}
                >
                  <div 
                    className="flex justify-center"
                    style={{ 
                      minWidth: `${getPageDimensions(previewPageSize).width * 3}px`,
                      minHeight: `${getPageDimensions(previewPageSize).height * 3}px`,
                    }}
                  >
                    <div 
                      className="transform-gpu transition-transform duration-200"
                      style={{ 
                        width: `${getPageDimensions(previewPageSize).width * 3}px`,
                        height: `${getPageDimensions(previewPageSize).height * 3}px`,
                      }}
                    >
                      {/* Paper-like resume container */}
                      <ResumeDropZone 
                        onDrop={handleDrop} 
                        resumeContent={resumeContent} 
                        removeSection={removeSection}
                        reorderSections={reorderSections}
                        userData={userData}
                        setUserData={setUserData}
                        setResumeContent={setResumeContent}
                        resumeRef={resumeRef}
                        zoomLevel={zoomLevel}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </DndProvider>
  );
}
