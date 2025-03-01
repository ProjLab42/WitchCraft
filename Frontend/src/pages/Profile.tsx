import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2, Save, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock user data
const mockUser = {
  name: "Jane Doe",
  email: "jane.doe@example.com",
  title: "Full Stack Developer",
  location: "San Francisco, CA",
  bio: "Passionate developer with 5+ years of experience building web applications. Specializing in React, TypeScript, and Node.js.",
  avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=jane",
  sections: {
    experience: [
      {
        id: "exp1",
        title: "Senior Developer",
        company: "Tech Solutions Inc.",
        period: "2021 - Present",
        description: "Led development of multiple client projects. Implemented CI/CD pipelines and mentored junior developers."
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
        description: "Focus on software engineering and distributed systems."
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
        link: "https://github.com/janedoe/ecommerce"
      },
      {
        id: "proj2",
        name: "Task Management App",
        description: "Developed a task management application with real-time updates using Socket.io.",
        link: "https://github.com/janedoe/taskmanager"
      }
    ],
    // Custom sections
    customSections: {}
  }
};

const Profile = () => {
  const [user, setUser] = useState(mockUser);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    title: user.title,
    email: user.email,
    location: user.location,
    bio: user.bio
  });

  const [newItem, setNewItem] = useState({
    type: "",
    data: {}
  });
  
  const [selectedTab, setSelectedTab] = useState("experience");
  const [customSectionKeys, setCustomSectionKeys] = useState([]);

  // Initialize custom section keys from user data
  useState(() => {
    if (user.sections.customSections) {
      setCustomSectionKeys(Object.keys(user.sections.customSections));
    }
  });

  const handleProfileUpdate = () => {
    setUser({ ...user, ...profileForm });
    setEditingProfile(false);
  };

  const handleAddItem = (type) => {
    let newId = `${type}${Date.now()}`;
    let newData = {};
    
    switch (type) {
      case "experience":
        newData = {
          id: newId,
          title: newItem.data.title || "",
          company: newItem.data.company || "",
          period: newItem.data.period || "",
          description: newItem.data.description || ""
        };
        break;
      case "education":
        newData = {
          id: newId,
          degree: newItem.data.degree || "",
          institution: newItem.data.institution || "",
          year: newItem.data.year || "",
          description: newItem.data.description || ""
        };
        break;
      case "skills":
        newData = {
          id: newId,
          name: newItem.data.name || ""
        };
        break;
      case "projects":
        newData = {
          id: newId,
          name: newItem.data.name || "",
          description: newItem.data.description || "",
          link: newItem.data.link || ""
        };
        break;
      default:
        // For custom sections
        if (type.startsWith("custom-")) {
          const sectionKey = type.replace("custom-", "");
          newData = {
            id: newId,
            title: newItem.data.title || "",
            description: newItem.data.description || ""
          };
          
          setUser({
            ...user,
            sections: {
              ...user.sections,
              customSections: {
                ...user.sections.customSections,
                [sectionKey]: [
                  ...(user.sections.customSections[sectionKey] || []),
                  newData
                ]
              }
            }
          });
          setNewItem({ type: "", data: {} });
          return;
        }
    }

    setUser({
      ...user,
      sections: {
        ...user.sections,
        [type]: [...user.sections[type], newData]
      }
    });
    
    setNewItem({ type: "", data: {} });
  };

  const handleDeleteItem = (type, id) => {
    if (type.startsWith("custom-")) {
      const sectionKey = type.replace("custom-", "");
      setUser({
        ...user,
        sections: {
          ...user.sections,
          customSections: {
            ...user.sections.customSections,
            [sectionKey]: user.sections.customSections[sectionKey].filter(item => item.id !== id)
          }
        }
      });
    } else {
      setUser({
        ...user,
        sections: {
          ...user.sections,
          [type]: user.sections[type].filter(item => item.id !== id)
        }
      });
    }
  };

  const handleAddCustomSection = (sectionName) => {
    // Create a slug-like key from the section name
    const sectionKey = sectionName.toLowerCase().replace(/\s+/g, '-');
    
    // Update user data with the new custom section
    setUser({
      ...user,
      sections: {
        ...user.sections,
        customSections: {
          ...user.sections.customSections,
          [sectionKey]: []
        }
      }
    });
    
    // Add to tab list
    setCustomSectionKeys([...customSectionKeys, sectionKey]);
    
    // Select the new tab
    setSelectedTab(`custom-${sectionKey}`);
  };

  const handleDeleteCustomSection = (sectionKey) => {
    // Create a new customSections object without the deleted section
    const { [sectionKey]: _, ...remainingCustomSections } = user.sections.customSections;
    
    // Update user data
    setUser({
      ...user,
      sections: {
        ...user.sections,
        customSections: remainingCustomSections
      }
    });
    
    // Update customSectionKeys
    setCustomSectionKeys(customSectionKeys.filter(key => key !== sectionKey));
    
    // If we're deleting the currently selected tab, select "experience" instead
    if (selectedTab === `custom-${sectionKey}`) {
      setSelectedTab("experience");
    }
  };

  // Format section name for display (convert from slug to title case)
  const formatSectionName = (key) => {
    return key
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Profile</CardTitle>
              {!editingProfile ? (
                <Button variant="ghost" size="icon" onClick={() => setEditingProfile(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" onClick={handleProfileUpdate}>
                  <Save className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            {!editingProfile ? (
              <>
                <div className="text-center">
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.title}</p>
                  <p className="text-sm">{user.location}</p>
                  <p className="text-sm">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm">{user.bio}</p>
                </div>
              </>
            ) : (
              <div className="w-full space-y-3">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={profileForm.name} 
                    onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={profileForm.title} 
                    onChange={e => setProfileForm({...profileForm, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={profileForm.email} 
                    type="email" 
                    onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={profileForm.location} 
                    onChange={e => setProfileForm({...profileForm, location: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={profileForm.bio} 
                    rows={3}
                    onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Profile Sections</h2>
            <AddSectionDialog onAdd={handleAddCustomSection} />
          </div>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <ScrollArea className="w-full" type="scroll">
              <TabsList className="w-full mb-6 flex flex-nowrap overflow-x-auto">
                <TabsTrigger value="experience" className="flex-shrink-0">Experience</TabsTrigger>
                <TabsTrigger value="education" className="flex-shrink-0">Education</TabsTrigger>
                <TabsTrigger value="skills" className="flex-shrink-0">Skills</TabsTrigger>
                <TabsTrigger value="projects" className="flex-shrink-0">Projects</TabsTrigger>
                
                {/* Custom Section Tabs */}
                {customSectionKeys.map(key => (
                  <TabsTrigger 
                    key={key} 
                    value={`custom-${key}`}
                    className="flex-shrink-0 group relative"
                  >
                    {formatSectionName(key)}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomSection(key);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
            
            {/* Experience Tab */}
            <TabsContent value="experience">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Experience</h3>
                  <AddExperienceDialog onAdd={(data) => {
                    setNewItem({ type: "experience", data });
                    handleAddItem("experience");
                  }} />
                </div>
                
                {user.sections.experience.length > 0 ? (
                  user.sections.experience.map(exp => (
                    <Card key={exp.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle>{exp.title}</CardTitle>
                            <CardDescription>{exp.company} | {exp.period}</CardDescription>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteItem("experience", exp.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p>{exp.description}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No experience items added yet.</p>
                )}
              </div>
            </TabsContent>
            
            {/* Education Tab */}
            <TabsContent value="education">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Education</h3>
                  <AddEducationDialog onAdd={(data) => {
                    setNewItem({ type: "education", data });
                    handleAddItem("education");
                  }} />
                </div>
                
                {user.sections.education.length > 0 ? (
                  user.sections.education.map(edu => (
                    <Card key={edu.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle>{edu.degree}</CardTitle>
                            <CardDescription>{edu.institution} | {edu.year}</CardDescription>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteItem("education", edu.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p>{edu.description}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No education items added yet.</p>
                )}
              </div>
            </TabsContent>
            
            {/* Skills Tab */}
            <TabsContent value="skills">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Skills</h3>
                  <AddSkillDialog onAdd={(data) => {
                    setNewItem({ type: "skills", data });
                    handleAddItem("skills");
                  }} />
                </div>
                
                {user.sections.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.sections.skills.map(skill => (
                      <div 
                        key={skill.id} 
                        className="bg-muted text-muted-foreground px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        {skill.name}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0"
                          onClick={() => handleDeleteItem("skills", skill.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No skills added yet.</p>
                )}
              </div>
            </TabsContent>
            
            {/* Projects Tab */}
            <TabsContent value="projects">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Projects</h3>
                  <AddProjectDialog onAdd={(data) => {
                    setNewItem({ type: "projects", data });
                    handleAddItem("projects");
                  }} />
                </div>
                
                {user.sections.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.sections.projects.map(project => (
                      <Card key={project.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle>{project.name}</CardTitle>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteItem("projects", project.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-2">{project.description}</p>
                          {project.link && (
                            <a 
                              href={project.link} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-sm text-primary underline"
                            >
                              View Project
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No projects added yet.</p>
                )}
              </div>
            </TabsContent>
            
            {/* Custom Sections */}
            {customSectionKeys.map(sectionKey => (
              <TabsContent key={sectionKey} value={`custom-${sectionKey}`}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">{formatSectionName(sectionKey)}</h3>
                    <AddCustomItemDialog 
                      sectionName={formatSectionName(sectionKey)}
                      onAdd={(data) => {
                        setNewItem({ type: `custom-${sectionKey}`, data });
                        handleAddItem(`custom-${sectionKey}`);
                      }} 
                    />
                  </div>
                  
                  {user.sections.customSections[sectionKey]?.length > 0 ? (
                    user.sections.customSections[sectionKey].map(item => (
                      <Card key={item.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle>{item.title}</CardTitle>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteItem(`custom-${sectionKey}`, item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p>{item.description}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No items in this section yet. Click "Add Item" to get started.
                    </p>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Dialog components for adding new items
const AddExperienceDialog = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    title: "",
    company: "",
    period: "",
    description: ""
  });

  const handleSubmit = () => {
    onAdd(data);
    setData({ title: "", company: "", period: "", description: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Experience
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Experience</DialogTitle>
          <DialogDescription>Add a new work experience to your profile</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input 
              id="title" 
              value={data.title} 
              onChange={e => setData({...data, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input 
              id="company" 
              value={data.company} 
              onChange={e => setData({...data, company: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Input 
              id="period" 
              placeholder="e.g. 2020 - Present" 
              value={data.period} 
              onChange={e => setData({...data, period: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={data.description} 
              onChange={e => setData({...data, description: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add Experience</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddEducationDialog = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    degree: "",
    institution: "",
    year: "",
    description: ""
  });

  const handleSubmit = () => {
    onAdd(data);
    setData({ degree: "", institution: "", year: "", description: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Education
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Education</DialogTitle>
          <DialogDescription>Add educational background to your profile</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="degree">Degree</Label>
            <Input 
              id="degree" 
              value={data.degree} 
              onChange={e => setData({...data, degree: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="institution">Institution</Label>
            <Input 
              id="institution" 
              value={data.institution} 
              onChange={e => setData({...data, institution: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input 
              id="year" 
              value={data.year} 
              onChange={e => setData({...data, year: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={data.description} 
              onChange={e => setData({...data, description: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add Education</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddSkillDialog = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ name: "" });

  const handleSubmit = () => {
    onAdd(data);
    setData({ name: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Skill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Skill</DialogTitle>
          <DialogDescription>Add a new skill to your profile</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Skill Name</Label>
            <Input 
              id="name" 
              value={data.name} 
              onChange={e => setData({...data, name: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add Skill</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddProjectDialog = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    link: ""
  });

  const handleSubmit = () => {
    onAdd(data);
    setData({ name: "", description: "", link: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
          <DialogDescription>Add a new project to your profile</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input 
              id="name" 
              value={data.name} 
              onChange={e => setData({...data, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={data.description} 
              onChange={e => setData({...data, description: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Project Link</Label>
            <Input 
              id="link" 
              value={data.link} 
              onChange={e => setData({...data, link: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Dialog for adding new section
const AddSectionDialog = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [sectionName, setSectionName] = useState("");

  const handleSubmit = () => {
    if (sectionName.trim()) {
      onAdd(sectionName);
      setSectionName("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add New Section
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Section</DialogTitle>
          <DialogDescription>Add a custom section to your profile</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sectionName">Section Name</Label>
            <Input 
              id="sectionName" 
              value={sectionName} 
              onChange={e => setSectionName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add Section</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddCustomItemDialog = ({ sectionName, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    title: "",
    description: ""
  });

  const handleSubmit = () => {
    onAdd(data);
    setData({ title: "", description: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Item to {sectionName}</DialogTitle>
          <DialogDescription>Add a new item to the {sectionName} section</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={data.title} 
              onChange={e => setData({...data, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={data.description} 
              onChange={e => setData({...data, description: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Profile;