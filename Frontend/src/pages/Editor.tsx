import { useState, useRef } from "react";
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
    item: { ...item, itemType: type },
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
const ResumeDropZone = ({ onDrop, resumeContent }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'RESUME_ITEM',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

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
        {resumeContent.sections.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Add resume sections by dragging them here</p>
        ) : (
          <div>
            {/* Group sections by type and render them in proper order */}
            {['experience', 'education', 'skills', 'projects', 'certifications'].map(sectionType => {
              const sections = resumeContent.sections.filter(s => s.itemType === sectionType);
              if (sections.length === 0) return null;
              
              return (
                <div key={sectionType} className="mb-6">
                  <h2 className="text-lg font-bold text-gray-800 border-b pb-1 mb-3 capitalize">{sectionType}</h2>
                  
                  {sections.map((section, index) => (
                    <div key={section.id || index} className="mb-4 group relative">
                      {sectionType === 'experience' && (
                        <div className="mb-3">
                          <div className="flex justify-between">
                            <h3 className="font-semibold">{section.company}</h3>
                            <span className="text-gray-600 text-sm">{section.period}</span>
                          </div>
                          <div className="text-gray-700 font-medium">{section.title}</div>
                          {section.description && (
                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                          )}
                          {section.bulletPoints && section.bulletPoints.length > 0 && (
                            <ul className="text-sm text-gray-600 list-disc pl-5 mt-1">
                              {section.bulletPoints.map(bp => (
                                <li key={bp.id}>{bp.text}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      
                      {sectionType === 'education' && (
                        <div className="mb-3">
                          <div className="flex justify-between">
                            <h3 className="font-semibold">{section.institution}</h3>
                            <span className="text-gray-600 text-sm">{section.year}</span>
                          </div>
                          <div className="text-gray-700 font-medium">{section.degree}</div>
                          {section.description && (
                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                          )}
                          {section.bulletPoints && section.bulletPoints.length > 0 && (
                            <ul className="text-sm text-gray-600 list-disc pl-5 mt-1">
                              {section.bulletPoints.map(bp => (
                                <li key={bp.id}>{bp.text}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      
                      {sectionType === 'skills' && (
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm mr-2 mb-2">
                          {section.name}
                        </span>
                      )}
                      
                      {sectionType === 'projects' && (
                        <div className="mb-3">
                          <h3 className="font-semibold">{section.name}</h3>
                          <p className="text-sm text-gray-600">{section.description}</p>
                          {section.link && (
                            <a href={section.link} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                              View Project
                            </a>
                          )}
                          {section.bulletPoints && section.bulletPoints.length > 0 && (
                            <ul className="text-sm text-gray-600 list-disc pl-5 mt-1">
                              {section.bulletPoints.map(bp => (
                                <li key={bp.id}>{bp.text}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      
                      {sectionType === 'certifications' && (
                        <div className="mb-3">
                          <div className="flex justify-between">
                            <h3 className="font-semibold">{section.name}</h3>
                            <span className="text-gray-600 text-sm">{section.date}</span>
                          </div>
                          <div className="text-gray-700">{section.issuer}</div>
                          {section.credentialId && (
                            <div className="text-xs text-gray-500">Credential ID: {section.credentialId}</div>
                          )}
                          {section.bulletPoints && section.bulletPoints.length > 0 && (
                            <ul className="text-sm text-gray-600 list-disc pl-5 mt-1">
                              {section.bulletPoints.map(bp => (
                                <li key={bp.id}>{bp.text}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 absolute top-0 right-0 opacity-0 group-hover:opacity-100"
                        onClick={() => removeSection(resumeContent.sections.indexOf(section))}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              );
            })}
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
  
  // Resume content to be built with dragged items
  const [resumeContent, setResumeContent] = useState({
    personalInfo: {
      name: mockUser.name,
      title: mockUser.title,
      email: mockUser.email,
      location: mockUser.location,
      links: mockUser.links
    },
    sections: []
  });
  
  const handleDrop = (item) => {
    setResumeContent(prev => ({
      ...prev,
      sections: [...prev.sections, item]
    }));
    toast.success(`Added ${item.itemType} to resume`);
  };
  
  const removeSection = (index) => {
    setResumeContent(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
    toast.success("Section removed from resume");
  };
  
  const handleExport = (format: 'pdf' | 'docx') => {
    toast.success(`Exporting resume as ${format.toUpperCase()}...`);
    // In a real implementation, this would call an API to generate the file
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
                <Button variant="ghost" size="sm" className="w-full mt-2">
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
                <Button variant="ghost" size="sm" className="w-full mt-2">
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
                <div className="flex flex-wrap gap-2 mb-2">
                  {mockUser.sections.skills.map(skill => (
                    <DraggableItem key={skill.id} item={skill} type="skills" onDrop={handleDrop} />
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  <Plus size={16} className="mr-2" />
                  Add Skill
                </Button>
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
                <Button variant="ghost" size="sm" className="w-full mt-2">
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
                <Button variant="ghost" size="sm" className="w-full mt-2">
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
                  <ResumeDropZone onDrop={handleDrop} resumeContent={resumeContent} />
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
