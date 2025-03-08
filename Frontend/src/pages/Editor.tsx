import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, ChevronUp, FileText, Plus, Edit, Trash, X } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
    <Collapsible open={isOpen} onOpenChange={toggleOpen} className="w-full">
      <Card className="mb-4">
        <CardHeader className="p-3 cursor-pointer">
          <CollapsibleTrigger className="flex justify-between items-center w-full">
            <CardTitle className="text-md">{title}</CardTitle>
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-3 pt-0">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
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
const ResumeDropZone = ({ onDrop, resumeContent, removeSection, reorderSections, userData, setUserData }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'RESUME_ITEM',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Add state for editing items in the resume with proper typing
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editedValues, setEditedValues] = useState<any>({});

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

  // Handle drag end for reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    reorderSections(result.source.index, result.destination.index);
  };

  // Handle edit button click
  const handleEditClick = (item) => {
    setEditingItem(item);
    setEditedValues({...item});
  };

  // Handle save edited item
  const handleSaveEdit = () => {
    onDrop(editedValues);
    
    // Update the userData state to sync with the edited item
    if (userData && setUserData && editedValues.itemType) {
      setUserData(prevUserData => {
        // Create a deep copy of the sections
        const updatedSections = { ...prevUserData.sections };
        
        // Find and update the item in the appropriate section
        if (updatedSections[editedValues.itemType]) {
          updatedSections[editedValues.itemType] = updatedSections[editedValues.itemType].map(sectionItem => 
            sectionItem.id === editedValues.id ? { ...editedValues } : sectionItem
          );
        }
        
        return {
          ...prevUserData,
          sections: updatedSections
        };
      });
    }
    
    setEditingItem(null);
    toast.success("Item updated successfully");
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Render edit form based on section type
  const renderEditForm = (item, sectionType) => {
    switch (sectionType) {
      case 'experience':
        return (
          <div className="space-y-2 p-2 border rounded-md mb-3">
            <div>
              <label className="text-xs text-gray-500 block">Company</label>
              <input 
                type="text" 
                value={editedValues.company || ''} 
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full p-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Title</label>
              <input 
                type="text" 
                value={editedValues.title || ''} 
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Period</label>
              <input 
                type="text" 
                value={editedValues.period || ''} 
                onChange={(e) => handleInputChange('period', e.target.value)}
                className="w-full p-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Description</label>
              <textarea 
                value={editedValues.description || ''} 
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-1 border rounded text-sm"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        );
      case 'education':
        return (
          <div className="space-y-2 p-2 border rounded-md mb-3">
            <div>
              <label className="text-xs text-gray-500 block">Institution</label>
              <input 
                type="text" 
                value={editedValues.institution || ''} 
                onChange={(e) => handleInputChange('institution', e.target.value)}
                className="w-full p-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Degree</label>
              <input 
                type="text" 
                value={editedValues.degree || ''} 
                onChange={(e) => handleInputChange('degree', e.target.value)}
                className="w-full p-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Year</label>
              <input 
                type="text" 
                value={editedValues.year || ''} 
                onChange={(e) => handleInputChange('year', e.target.value)}
                className="w-full p-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Description</label>
              <textarea 
                value={editedValues.description || ''} 
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-1 border rounded text-sm"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-2 p-2 border rounded-md mb-3">
            <div>
              <label className="text-xs text-gray-500 block">Project Name</label>
              <input 
                type="text" 
                value={editedValues.name || ''} 
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Description</label>
              <textarea 
                value={editedValues.description || ''} 
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-1 border rounded text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Link</label>
              <input 
                type="text" 
                value={editedValues.link || ''} 
                onChange={(e) => handleInputChange('link', e.target.value)}
                className="w-full p-1 border rounded text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={drop} 
      className={`mt-0 bg-white shadow-md border rounded-md paper-texture min-h-[600px] max-w-[612px] mx-auto transition-all ${isOver ? 'border-primary shadow-lg' : 'border-gray-100'}`}
    >
      <div className="p-8">
        {/* Professional header */}
        <div className="text-center mb-6 pb-4 border-b">
          <h1 className="text-2xl font-bold text-gray-800">{resumeContent.personalInfo.name}</h1>
          <p className="text-gray-600 font-medium">{resumeContent.personalInfo.title}</p>
          
          <div className="flex justify-center gap-6 text-sm text-gray-500 mt-2">
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
          <Droppable droppableId="resume-sections">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
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
                        className="mb-6 group relative"
                      >
                        {/* Section header with drag handle */}
                        <div 
                          {...provided.dragHandleProps}
                          className="flex items-center cursor-move"
                        >
                          <h2 className="text-lg font-bold text-gray-800 border-b pb-1 mb-3 capitalize flex-grow">
                            {sectionType}
                          </h2>
                        </div>
                        
                        {/* Section items */}
                        {sectionType === 'skills' ? (
                          <div className="text-gray-700 text-sm">
                            {(items as Array<{id: string, name: string}>).map((skill, index) => (
                              <span key={skill.id}>
                                {skill.name}
                                {index < (items as Array<{id: string, name: string}>).length - 1 ? ' | ' : ''}
                              </span>
                            ))}
                          </div>
                        ) : (
                          (items as Array<any>).map((item, itemIndex) => (
                            <div key={item.id || `item-${itemIndex}`} className="mb-4 group relative">
                              {editingItem && editingItem.id === item.id ? (
                                renderEditForm(item, sectionType)
                              ) : (
                                <>
                                  {sectionType === 'experience' && (
                                    <div className="mb-3 relative group">
                                      <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold text-gray-800">{item.company}</h3>
                                        <span className="text-gray-600 text-sm">{item.period}</span>
                                      </div>
                                      <div className="text-gray-700 font-medium">{item.title}</div>
                                      {item.description && (
                                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                      )}
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleEditClick(item)}
                                      >
                                        <Edit size={12} />
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {sectionType === 'education' && (
                                    <div className="mb-3 relative group">
                                      <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold text-gray-800">{item.institution}</h3>
                                        <span className="text-gray-600 text-sm">{item.year}</span>
                                      </div>
                                      <div className="text-gray-700 font-medium">{item.degree}</div>
                                      {item.description && (
                                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                      )}
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleEditClick(item)}
                                      >
                                        <Edit size={12} />
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {sectionType === 'projects' && (
                                    <div className="mb-3 relative group">
                                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                      <p className="text-sm text-gray-600">{item.description}</p>
                                      {item.link && (
                                        <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                                          View Project
                                        </a>
                                      )}
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleEditClick(item)}
                                      >
                                        <Edit size={12} />
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {sectionType === 'certifications' && (
                                    <div className="mb-3 relative group">
                                      <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                        <span className="text-gray-600 text-sm">{item.date}</span>
                                      </div>
                                      <div className="text-gray-700 font-medium">{item.issuer}</div>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleEditClick(item)}
                                      >
                                        <Edit size={12} />
                                      </Button>
                                    </div>
                                  )}
                                </>
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
                          ))
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
  
  const handleExport = (format: 'pdf' | 'docx') => {
    toast.success(`Exporting resume as ${format.toUpperCase()}...`);
    // In a real implementation, this would call an API to generate the file
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-screen flex-col">
        <Header />
        
        <div className="flex justify-end border-b px-6 py-3">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="gap-2">
              <Download className="h-4 w-4" />
              <span>PDF</span>
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => handleExport('docx')} className="gap-2">
              <FileText className="h-4 w-4" />
              <span>DOCX</span>
            </Button>
          </div>
        </div>
        
        <main className="flex-1 bg-muted/30">
          <div className="flex min-h-[calc(100vh-12rem)]">
            {/* Left side - Sections to drag from */}
            <div className="w-full lg:w-1/2 overflow-auto p-4">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Resume Sections</h2>
                <p className="text-gray-600 text-sm mb-4">Drag sections onto your resume or click to edit</p>
              </div>
              
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
                {userData.sections.experience.map(exp => (
                  <DraggableItem 
                    key={exp.id} 
                    item={exp} 
                    type="experience" 
                    onDrop={handleDrop} 
                    userData={userData} 
                    setUserData={setUserData} 
                  />
                ))}
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
                {userData.sections.education.map(edu => (
                  <DraggableItem 
                    key={edu.id} 
                    item={edu} 
                    type="education" 
                    onDrop={handleDrop} 
                    userData={userData} 
                    setUserData={setUserData} 
                  />
                ))}
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
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {userData.sections.skills.map(skill => (
                    <div key={skill.id} className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`skill-${skill.id}`}
                        className="mr-2"
                        checked={resumeContent.selectedSkills.some(s => s.id === skill.id)}
                        onChange={() => toggleSkill(skill)}
                      />
                      <label htmlFor={`skill-${skill.id}`} className="text-sm">{skill.name}</label>
                    </div>
                  ))}
                </div>
                <AddSkillDialog onAdd={addSkill} />
              </DraggableSection>
              
              {/* Projects Section */}
              <DraggableSection 
                title="Projects" 
                isOpen={openSections.projects}
                toggleOpen={() => toggleSection('projects')}
              >
                {userData.sections.projects.map(project => (
                  <DraggableItem 
                    key={project.id} 
                    item={project} 
                    type="projects" 
                    onDrop={handleDrop} 
                    userData={userData} 
                    setUserData={setUserData} 
                  />
                ))}
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
                {userData.sections.certifications.map(cert => (
                  <DraggableItem 
                    key={cert.id} 
                    item={cert} 
                    type="certifications" 
                    onDrop={handleDrop} 
                    userData={userData} 
                    setUserData={setUserData} 
                  />
                ))}
                <Button variant="ghost" size="sm" className="w-full mt-2" onClick={addCertification}>
                  <Plus size={16} className="mr-2" />
                  Add Certification
                </Button>
              </DraggableSection>
            </div>
            
            {/* Right side - Resume preview */}
            <div className="hidden lg:block lg:w-1/2 p-8 bg-gray-100">
              <div className="sticky top-8 h-[calc(100vh-12rem)] flex flex-col">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">Resume Preview</h2>
                  <p className="text-sm text-gray-500">Drag items from the left panel</p>
                </div>
                <div className="flex-1 overflow-y-auto flex items-start justify-center">
                  {/* Paper-like resume container */}
                  <ResumeDropZone 
                    onDrop={handleDrop} 
                    resumeContent={resumeContent} 
                    removeSection={removeSection}
                    reorderSections={reorderSections}
                    userData={userData}
                    setUserData={setUserData}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </DndProvider>
  );
}
