import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, ChevronUp, FileText, Plus, Edit, Trash } from "lucide-react";
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
const DraggableItem = ({ item, type, onDrop }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'RESUME_ITEM',
    item: { 
      ...item, 
      itemType: type
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  
  // Simplified item displays based on data type
  const renderContent = () => {
    switch (type) {
      case 'experience':
        return (
          <div className="p-2 border rounded-md mb-2 bg-white cursor-move hover:shadow-md flex justify-between items-center">
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-gray-600">{item.company}</div>
              <div className="text-xs text-gray-500">{item.period}</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit size={16} />
            </Button>
          </div>
        );
      case 'education':
        return (
          <div className="p-2 border rounded-md mb-2 bg-white cursor-move hover:shadow-md flex justify-between items-center">
            <div>
              <div className="font-medium">{item.degree}</div>
              <div className="text-sm text-gray-600">{item.institution}</div>
              <div className="text-xs text-gray-500">{item.year}</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit size={16} />
            </Button>
          </div>
        );
      case 'skills':
        return (
          <div className="p-2 border rounded-md mb-2 bg-white cursor-move hover:shadow-md flex justify-between items-center">
            <div className="font-medium">{item.name}</div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit size={16} />
            </Button>
          </div>
        );
      case 'projects':
        return (
          <div className="p-2 border rounded-md mb-2 bg-white cursor-move hover:shadow-md flex justify-between items-center">
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit size={16} />
            </Button>
          </div>
        );
      case 'certifications':
        return (
          <div className="p-2 border rounded-md mb-2 bg-white cursor-move hover:shadow-md flex justify-between items-center">
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-600">{item.issuer}</div>
              <div className="text-xs text-gray-500">{item.date}</div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit size={16} />
            </Button>
          </div>
        );
      default:
        return <div>Unknown type</div>;
    }
  };

  return (
    <div 
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="transition-all duration-200"
    >
      {renderContent()}
    </div>
  );
};

// Resume drop zone component
const ResumeDropZone = ({ onDrop, resumeContent, removeSection, reorderSections }) => {
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

  // Handle drag end for reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    reorderSections(result.source.index, result.destination.index);
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
        {allSections.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Add resume sections by dragging them here</p>
        ) : (
          <div>
            {/* Render all sections including skills */}
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
                                  {sectionType === 'experience' && (
                                    <div className="mb-3">
                                      <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold text-gray-800">{item.company}</h3>
                                        <span className="text-gray-600 text-sm">{item.period}</span>
                                      </div>
                                      <div className="text-gray-700 font-medium">{item.title}</div>
                                      {item.description && (
                                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                      )}
                                    </div>
                                  )}
                                  
                                  {sectionType === 'education' && (
                                    <div className="mb-3">
                                      <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold text-gray-800">{item.institution}</h3>
                                        <span className="text-gray-600 text-sm">{item.year}</span>
                                      </div>
                                      <div className="text-gray-700 font-medium">{item.degree}</div>
                                      {item.description && (
                                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                      )}
                                    </div>
                                  )}
                                  
                                  {sectionType === 'projects' && (
                                    <div className="mb-3">
                                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                      <p className="text-sm text-gray-600">{item.description}</p>
                                      {item.link && (
                                        <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                                          View Project
                                        </a>
                                      )}
                                    </div>
                                  )}
                                  
                                  {sectionType === 'certifications' && (
                                    <div className="mb-3">
                                      <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                        <span className="text-gray-600 text-sm">{item.date}</span>
                                      </div>
                                      <div className="text-gray-700">{item.issuer}</div>
                                      {item.credentialId && (
                                        <div className="text-xs text-gray-500">Credential ID: {item.credentialId}</div>
                                      )}
                                    </div>
                                  )}
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 absolute top-0 right-0 opacity-0 group-hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeSection(resumeContent.sections.indexOf(item));
                                    }}
                                  >
                                    <Trash size={14} />
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
        )}
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
  
  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  // Add state for selected skills
  const [selectedSkills, setSelectedSkills] = useState([]);
  
  // Resume content to be built with dragged items
  const [resumeContent, setResumeContent] = useState({
    personalInfo: {
      name: mockUser.name,
      title: mockUser.title,
      email: mockUser.email,
      location: mockUser.location,
      links: mockUser.links
    },
    sections: [],
    selectedSkills: [],
    sectionOrder: []
  });
  
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
      // Add the item to sections
      const updatedSections = [...prev.sections, item];
      
      // Update section order if needed
      let updatedOrder = [...prev.sectionOrder];
      if (!updatedOrder.includes(item.itemType)) {
        updatedOrder.push(item.itemType);
      }
      
      return {
        ...prev,
        sections: updatedSections,
        sectionOrder: updatedOrder
      };
    });
    
    toast.success(`Added ${item.itemType} item to resume`);
  };
  
  const removeSection = (index) => {
    setResumeContent(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
    toast.success("Item removed from resume");
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
    
    setResumeContent(prev => ({
      ...prev,
      sections: [...prev.sections, {
        itemType: 'experience',
        ...newExperience
      }]
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
      description: "Description of your studies",
      bulletPoints: []
    };
    
    setResumeContent(prev => ({
      ...prev,
      sections: [...prev.sections, {
        itemType: 'education',
        ...newEducation
      }]
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
    
    // Add to mock user skills
    mockUser.sections.skills.push(newSkill);
    
    // Force re-render
    setOpenSections({...openSections});
    
    toast.success("Added new skill");
  };

  // Function to add a new project
  const addProject = () => {
    const newProject = {
      id: `proj-${Date.now()}`,
      name: "New Project",
      description: "Description of your project",
      link: "",
      bulletPoints: []
    };
    
    setResumeContent(prev => ({
      ...prev,
      sections: [...prev.sections, {
        itemType: 'project',
        ...newProject
      }]
    }));
    
    toast.success("Added new project");
  };

  // Function to add a new certification
  const addCertification = () => {
    const newCertification = {
      id: `cert-${Date.now()}`,
      name: "New Certification",
      issuer: "Issuing Organization",
      date: "Issue Date",
      expirationDate: "Expiration Date",
      credentialId: "",
      bulletPoints: []
    };
    
    setResumeContent(prev => ({
      ...prev,
      sections: [...prev.sections, {
        itemType: 'certification',
        ...newCertification
      }]
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
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img src={mockUser.avatarUrl} alt={mockUser.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-medium">{mockUser.name}</div>
                    <div className="text-sm text-gray-500">{mockUser.title}</div>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <Edit size={16} />
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="text-sm">
                    <span className="font-medium">Email:</span> {mockUser.email}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Location:</span> {mockUser.location}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">LinkedIn:</span> {mockUser.links.linkedin}
                  </div>
                </div>
              </DraggableSection>
              
              {/* Experience Section */}
              <DraggableSection 
                title="Experience" 
                isOpen={openSections.experience}
                toggleOpen={() => toggleSection('experience')}
              >
                {mockUser.sections.experience.map(exp => (
                  <DraggableItem key={exp.id} item={exp} type="experience" onDrop={handleDrop} />
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
                {mockUser.sections.education.map(edu => (
                  <DraggableItem key={edu.id} item={edu} type="education" onDrop={handleDrop} />
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
                  {mockUser.sections.skills.map(skill => (
                    <div key={skill.id} className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`skill-${skill.id}`}
                        checked={resumeContent.selectedSkills?.some(s => s.id === skill.id)}
                        onChange={() => toggleSkill(skill)}
                        className="mr-2"
                      />
                      <label htmlFor={`skill-${skill.id}`}>{skill.name}</label>
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
                {mockUser.sections.projects.map(project => (
                  <DraggableItem key={project.id} item={project} type="projects" onDrop={handleDrop} />
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
                {mockUser.sections.certifications.map(cert => (
                  <DraggableItem key={cert.id} item={cert} type="certifications" onDrop={handleDrop} />
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
