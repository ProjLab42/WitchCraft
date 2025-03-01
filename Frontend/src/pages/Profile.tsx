import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2, Save, Plus, PenLine, ArrowLeft, GripVertical, X, Camera, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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

// BulletPointsEditor component
const BulletPointsEditor = ({ bulletPoints = [], onChange }) => {
  const [points, setPoints] = useState(bulletPoints);
  const [newPoint, setNewPoint] = useState("");

  useEffect(() => {
    setPoints(bulletPoints);
  }, [bulletPoints]);

  const addPoint = () => {
    if (newPoint.trim()) {
      const newPoints = [
        ...points,
        { id: `bp-${Date.now()}`, text: newPoint }
      ];
      setPoints(newPoints);
      onChange(newPoints);
      setNewPoint("");
    }
  };

  const removePoint = (id) => {
    const newPoints = points.filter(p => p.id !== id);
    setPoints(newPoints);
    onChange(newPoints);
  };

  const updatePoint = (id, text) => {
    const newPoints = points.map(p => 
      p.id === id ? { ...p, text } : p
    );
    setPoints(newPoints);
    onChange(newPoints);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(points);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setPoints(reordered);
    onChange(reordered);
  };

  return (
    <div className="space-y-3">
      <Label>Bullet Points</Label>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="bullet-points">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {points.map((point, index) => (
                <Draggable key={point.id} draggableId={point.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-2"
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-move text-muted-foreground"
                      >
                        <GripVertical size={16} />
                      </div>
                      <Input 
                        value={point.text}
                        onChange={(e) => updatePoint(point.id, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePoint(point.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex gap-2">
        <Input
          placeholder="Add a bullet point"
          value={newPoint}
          onChange={(e) => setNewPoint(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addPoint();
            }
          }}
          className="flex-1"
        />
        <Button type="button" onClick={addPoint}>
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
};

// Add Section Dialog
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

// All dialog components for adding and editing items
// Fix the AddEducationDialog which had a missing returned structure

// Custom Item Dialog
const AddCustomItemDialog = ({ sectionName, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    title: "",
    description: "",
    bulletPoints: []
  });

  const handleSubmit = () => {
    if (data.title.trim()) {  // Ensure at least the title is provided
      onAdd(data);
      setData({ title: "", description: "", bulletPoints: [] });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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
          
          {/* Bullet Points Editor */}
          <BulletPointsEditor
            bulletPoints={data.bulletPoints}
            onChange={(bulletPoints) => setData({...data, bulletPoints})}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!data.title.trim()}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
const EditCertificationDialog = ({ id, certification, onSave }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    name: certification.name || "",
    issuer: certification.issuer || "",
    date: certification.date || "",
    expirationDate: certification.expirationDate || "",
    credentialId: certification.credentialId || "",
    bulletPoints: certification.bulletPoints || []
  });

  useEffect(() => {
    setData({
      name: certification.name || "",
      issuer: certification.issuer || "",
      date: certification.date || "",
      expirationDate: certification.expirationDate || "",
      credentialId: certification.credentialId || "",
      bulletPoints: certification.bulletPoints || []
    });
  }, [certification]);

  const handleSubmit = () => {
    onSave({
      ...certification,
      ...data
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button id={id} className="hidden"></button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Certification</DialogTitle>
          <DialogDescription>Update your certification details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Certification Name</Label>
            <Input 
              id="edit-name" 
              value={data.name} 
              onChange={e => setData({...data, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-issuer">Issuing Organization</Label>
            <Input 
              id="edit-issuer" 
              value={data.issuer} 
              onChange={e => setData({...data, issuer: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-date">Issue Date</Label>
            <Input 
              id="edit-date" 
              value={data.date} 
              onChange={e => setData({...data, date: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-expiration">Expiration Date (Optional)</Label>
            <Input 
              id="edit-expiration" 
              value={data.expirationDate} 
              onChange={e => setData({...data, expirationDate: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-credential">Credential ID (Optional)</Label>
            <Input 
              id="edit-credential" 
              value={data.credentialId} 
              onChange={e => setData({...data, credentialId: e.target.value})}
            />
          </div>

          {/* Bullet Points Editor */}
          <BulletPointsEditor 
            bulletPoints={data.bulletPoints} 
            onChange={(bulletPoints) => setData({...data, bulletPoints})} 
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Fix the duplicate imports and component declarations
// All your necessary dialog components from your code
// (Include your AddExperienceDialog, EditExperienceDialog, AddSkillDialog, EditSkillDialog, 
// AddProjectDialog, EditProjectDialog, EditEducationDialog from your original code)

const Profile = () => {
  const [user, setUser] = useState(mockUser);
  const [editingProfile, setEditingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const regenerateAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 10);
    const newAvatarUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${randomSeed}`;
    
    setProfileForm({
      ...profileForm,
      avatarUrl: newAvatarUrl
    });
  };
  
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({
          ...profileForm,
          avatarUrl: reader.result
        });
        setAvatarFile(file);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleProfileUpdate = () => {
    setUser({
      ...user,
      name: profileForm.name,
      title: profileForm.title,
      email: profileForm.email,
      location: profileForm.location,
      bio: profileForm.bio,
      avatarUrl: profileForm.avatarUrl,
      links: {
        linkedin: profileForm.linkedin,
        portfolio: profileForm.portfolio,
        additionalLinks: profileForm.additionalLinks
      }
    });
    setEditingProfile(false);
    setAvatarFile(null);
  };
  
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    title: user.title,
    email: user.email,
    location: user.location,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    linkedin: user.links?.linkedin || "",
    portfolio: user.links?.portfolio || "",
    additionalLinks: user.links?.additionalLinks || []
  });

  const [newItem, setNewItem] = useState({
    type: "",
    data: {}
  });
  
  const [selectedTab, setSelectedTab] = useState("experience");
  const [customSectionKeys, setCustomSectionKeys] = useState([]);
  const [coreSectionKeys, setCoreSectionKeys] = useState(["experience", "education", "skills", "projects", "certifications"]);
  const [renamingSectionKey, setRenamingSectionKey] = useState("");
  const [newSectionName, setNewSectionName] = useState("");

  useEffect(() => {
    if (user.sections.customSections) {
      setCustomSectionKeys(Object.keys(user.sections.customSections));
    }
  }, []);

  // Fix for handleAddItem function
  const handleAddItem = (type) => {
    let newId = `${type}${Date.now()}`;
    let newData = {};
    
    // For custom sections
    if (type.startsWith("custom-")) {
      const sectionKey = type.replace("custom-", "");
      newData = {
        id: newId,
        title: newItem.data.title || "",
        description: newItem.data.description || "",
        bulletPoints: newItem.data.bulletPoints || []
      };
      
      // Fix: For custom sections, use the data passed to onAddItem directly
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
      return;
    }
    
    // For standard sections
    switch (type) {
      case "experience":
        newData = {
          id: newId,
          title: newItem.data.title || "",
          company: newItem.data.company || "",
          period: newItem.data.period || "",
          description: newItem.data.description || "",
          bulletPoints: newItem.data.bulletPoints || []
        };
        break;
      // other cases...
    }

    // Add the new item to the appropriate section
    setUser({
      ...user,
      sections: {
        ...user.sections,
        [type]: [...user.sections[type], newData]
      }
    });
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
    const sectionKey = sectionName.toLowerCase().replace(/\s+/g, '-');
    
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
    
    setCustomSectionKeys([...customSectionKeys, sectionKey]);
    
    setSelectedTab(`custom-${sectionKey}`);
  };

  const handleDeleteSection = (sectionKey) => {
    if (sectionKey.startsWith("custom-")) {
      const key = sectionKey.replace("custom-", "");
      
      const { [key]: _, ...remainingCustomSections } = user.sections.customSections;
      
      setUser({
        ...user,
        sections: {
          ...user.sections,
          customSections: remainingCustomSections
        }
      });
      
      setCustomSectionKeys(customSectionKeys.filter(k => k !== key));
    } else {
      const { [sectionKey]: _, ...remainingSections } = user.sections;
      const { [sectionKey]: __, ...remainingSectionMeta } = user.sections.sectionMeta;
      
      setUser({
        ...user,
        sections: {
          ...remainingSections,
          sectionMeta: remainingSectionMeta,
          customSections: user.sections.customSections
        }
      });
      
      setCoreSectionKeys(coreSectionKeys.filter(k => k !== sectionKey));
    }
    
    if (selectedTab === sectionKey) {
      const remainingCoreTabs = coreSectionKeys.filter(k => k !== sectionKey);
      const firstAvailableTab = remainingCoreTabs.length > 0 
        ? remainingCoreTabs[0] 
        : customSectionKeys.length > 0 
          ? `custom-${customSectionKeys[0]}` 
          : null;
          
      if (firstAvailableTab) {
        setSelectedTab(firstAvailableTab);
      }
    }
  };

  const handleRenameSection = (sectionKey, newName) => {
    if (sectionKey.startsWith("custom-")) {
      const key = sectionKey.replace("custom-", "");
      const newSectionKey = newName.toLowerCase().replace(/\s+/g, '-');
      
      if (newSectionKey === key) return;
      
      setUser(prevUser => {
        const sectionData = prevUser.sections.customSections[key] || [];
        const { [key]: _, ...remainingCustomSections } = prevUser.sections.customSections;
        
        return {
          ...prevUser,
          sections: {
            ...prevUser.sections,
            customSections: {
              ...remainingCustomSections,
              [newSectionKey]: sectionData
            }
          }
        };
      });
      
      setCustomSectionKeys(prev => [...prev.filter(k => k !== key), newSectionKey]);
      
      if (selectedTab === `custom-${key}`) {
        setSelectedTab(`custom-${newSectionKey}`);
      }
    } else {
      setUser(prevUser => ({
        ...prevUser,
        sections: {
          ...prevUser.sections,
          sectionMeta: {
            ...prevUser.sections.sectionMeta,
            [sectionKey]: {
              ...prevUser.sections.sectionMeta[sectionKey],
              name: newName
            }
          }
        }
      }));
    }
    
    setRenamingSectionKey("");
    setNewSectionName("");
  };

  const handleUpdateItem = (type, id, data) => {
    if (type.startsWith("custom-")) {
      const sectionKey = type.replace("custom-", "");
      setUser({
        ...user,
        sections: {
          ...user.sections,
          customSections: {
            ...user.sections.customSections,
            [sectionKey]: user.sections.customSections[sectionKey].map(item => 
              item.id === id ? { ...item, ...data } : item
            )
          }
        }
      });
    } else {
      setUser({
        ...user,
        sections: {
          ...user.sections,
          [type]: user.sections[type].map(item => 
            item.id === id ? { ...item, ...data } : item
          )
        }
      });
    }
  };

  const getSectionName = (sectionKey) => {
    if (sectionKey.startsWith("custom-")) {
      const key = sectionKey.replace("custom-", "");
      return formatSectionName(key);
    } else {
      return user.sections.sectionMeta[sectionKey]?.name || formatSectionName(sectionKey);
    }
  };

  const formatSectionName = (key) => {
    return key
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const allSectionKeys = [...coreSectionKeys, ...customSectionKeys.map(key => `custom-${key}`)];

  // First, add this state to track if tabs need to split into two rows
  const [tabsNeedTwoRows, setTabsNeedTwoRows] = useState(false);
  const tabsRef = useRef(null);

  // Add this effect to check if tabs need two rows
  useEffect(() => {
    const checkTabsWidth = () => {
      if (tabsRef.current) {
        const container = tabsRef.current;
        const containerWidth = container.clientWidth;
        let totalTabsWidth = 0;
        
        // Get all direct children that are tab triggers
        const tabElements = container.querySelectorAll('.tab-trigger');
        tabElements.forEach(tab => {
          totalTabsWidth += tab.offsetWidth;
        });
        
        // Add some buffer for padding/margins
        setTabsNeedTwoRows(totalTabsWidth > (containerWidth - 20));
      }
    };
    
    checkTabsWidth();
    
    // Also check on window resize
    window.addEventListener('resize', checkTabsWidth);
    return () => window.removeEventListener('resize', checkTabsWidth);
  }, [allSectionKeys.length]);

  return (
    <>
      <div className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
                <circle cx="19" cy="5" r="1" />
                <path d="m17 6 2.5-2.5" />
                <path d="m20.5 8.5-2-2" />
              </svg>
              <h1 className="text-xl font-bold">WitchCraft</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={editingProfile ? profileForm.avatarUrl : user.avatarUrl} />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                {editingProfile && (
                  <div className="absolute -bottom-3 flex justify-center w-full gap-2">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-8 w-8 rounded-full bg-background"
                      onClick={triggerFileInput}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-8 w-8 rounded-full bg-background"
                      onClick={regenerateAvatar}
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              
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
                  
                  {(user.links?.linkedin || user.links?.portfolio || user.links?.additionalLinks?.length > 0) && (
                    <div className="w-full space-y-2 pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Links</p>
                      <div className="flex flex-wrap gap-2">
                        {user.links?.linkedin && (
                          <a 
                            href={user.links.linkedin}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                            </svg>
                            LinkedIn
                          </a>
                        )}
                        {user.links?.portfolio && (
                          <a 
                            href={user.links.portfolio}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                            Portfolio
                          </a>
                        )}
                        {user.links?.additionalLinks?.map((link, i) => (
                          <a 
                            key={i}
                            href={link.url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                            {link.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full space-y-3 mt-4">
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
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input 
                      id="linkedin" 
                      value={profileForm.linkedin} 
                      onChange={e => setProfileForm({...profileForm, linkedin: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="portfolio">Portfolio</Label>
                    <Input 
                      id="portfolio" 
                      value={profileForm.portfolio} 
                      onChange={e => setProfileForm({...profileForm, portfolio: e.target.value})}
                    />
                  </div>
                  <AdditionalLinksEditor
                    links={profileForm.additionalLinks}
                    onChange={(additionalLinks) => setProfileForm({...profileForm, additionalLinks})}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Profile Sections</h2>
              <AddSectionDialog onAdd={handleAddCustomSection} />
            </div>
            
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <ScrollArea className="w-full" type="scroll">
                <div className="relative w-full mb-6">
                  <TabsList 
                    ref={tabsRef}
                    className={`w-full ${tabsNeedTwoRows ? 'flex-wrap h-auto py-1' : 'flex-nowrap'} overflow-visible bg-muted/80`}
                  >
                    {allSectionKeys.map(key => {
                      const isCustomSection = key.startsWith("custom-");
                      const actualKey = isCustomSection ? key.replace("custom-", "") : key;
                      const isRenamingThis = renamingSectionKey === key;
                      
                      return (
                        <div key={key} className="relative flex-shrink-0 my-1">
                          {isRenamingThis ? (
                            <div className="flex items-center p-2">
                              <Input
                                value={newSectionName}
                                onChange={e => setNewSectionName(e.target.value)}
                                className="h-8 w-32"
                                autoFocus
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    handleRenameSection(key, newSectionName);
                                  } else if (e.key === 'Escape') {
                                    setRenamingSectionKey("");
                                    setNewSectionName("");
                                  }
                                }}
                                onBlur={() => {
                                  if (newSectionName.trim()) {
                                    handleRenameSection(key, newSectionName);
                                  } else {
                                    setRenamingSectionKey("");
                                    setNewSectionName("");
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <TabsTrigger 
                              value={key}
                              className="tab-trigger flex-shrink-0 min-w-[160px] justify-between group"
                            >
                              <span>{getSectionName(key)}</span>
                              <span className="opacity-0 group-hover:opacity-100 flex gap-1 ml-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-5 w-5 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRenamingSectionKey(key);
                                    setNewSectionName(getSectionName(key));
                                  }}
                                >
                                  <PenLine className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-5 w-5 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSection(key);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </span>
                            </TabsTrigger>
                          )}
                        </div>
                      );
                    })}
                  </TabsList>
                </div>
              </ScrollArea>
              
              {coreSectionKeys.map(key => (
                <TabsContent key={key} value={key}>
                  <SectionContent 
                    sectionKey={key}
                    sectionName={getSectionName(key)}
                    items={user.sections[key]}
                    onAddItem={(data) => {
                      setNewItem({ type: key, data });
                      handleAddItem(key);
                    }}
                    onDeleteItem={(id) => handleDeleteItem(key, id)}
                    onUpdateItem={(id, data) => handleUpdateItem(key, id, data)}
                  />
                </TabsContent>
              ))}
              
              {customSectionKeys.map(sectionKey => (
                <TabsContent key={`custom-${sectionKey}`} value={`custom-${sectionKey}`}>
                  <SectionContent 
                    sectionKey={`custom-${sectionKey}`}
                    sectionName={formatSectionName(sectionKey)}
                    items={user.sections.customSections[sectionKey] || []}
                    onAddItem={(data) => {
                      // Important: Use the data directly rather than through newItem state
                      const newId = `custom-${sectionKey}-${Date.now()}`;
                      const newData = {
                        id: newId,
                        title: data.title,
                        description: data.description,
                        bulletPoints: data.bulletPoints || []
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
                    }}
                    onDeleteItem={(id) => handleDeleteItem(`custom-${sectionKey}`, id)}
                    onUpdateItem={(id, data) => handleUpdateItem(`custom-${sectionKey}`, id, data)}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

const SectionContent = ({ sectionKey, sectionName, items, onAddItem, onDeleteItem, onUpdateItem }) => {
  switch(sectionKey) {
    case "experience":
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">{sectionName}</h3>
            <AddExperienceDialog onAdd={onAddItem} />
          </div>
          
          {items?.length > 0 ? (
            items.map(exp => (
              <Card key={exp.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{exp.title}</CardTitle>
                      <CardDescription>{exp.company} | {exp.period}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDeleteItem(exp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => document.getElementById(exp.id).click()}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{exp.description}</p>
                  {exp.bulletPoints && (
                    <ul className="list-disc pl-5">
                      {exp.bulletPoints.map(bp => (
                        <li key={bp.id}>{bp.text}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                <EditExperienceDialog 
                  id={exp.id}
                  experience={exp}
                  onSave={(data) => onUpdateItem(exp.id, data)}
                />
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No experience items added yet.</p>
          )}
        </div>
      );
      
    case "education":
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">{sectionName}</h3>
            <AddEducationDialog onAdd={onAddItem} />
          </div>
          
          {items?.length > 0 ? (
            items.map(edu => (
              <Card key={edu.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{edu.degree}</CardTitle>
                      <CardDescription>{edu.institution} | {edu.year}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDeleteItem(edu.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => document.getElementById(edu.id).click()}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{edu.description}</p>
                  {edu.bulletPoints && (
                    <ul className="list-disc pl-5">
                      {edu.bulletPoints.map(bp => (
                        <li key={bp.id}>{bp.text}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                <EditEducationDialog 
                  id={edu.id}
                  education={edu}
                  onSave={(data) => onUpdateItem(edu.id, data)}
                />
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No education items added yet.</p>
          )}
        </div>
      );
      
    case "skills":
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">{sectionName}</h3>
            <AddSkillDialog onAdd={onAddItem} />
          </div>
          
          {items?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {items.map(skill => (
                <div 
                  key={skill.id} 
                  className="bg-muted text-muted-foreground px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {skill.name}
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 p-0"
                      onClick={() => onDeleteItem(skill.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 p-0"
                      onClick={() => document.getElementById(skill.id).click()}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <EditSkillDialog 
                    id={skill.id}
                    skill={skill}
                    onSave={(data) => onUpdateItem(skill.id, data)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No skills added yet.</p>
          )}
        </div>
      );
      
    case "projects":
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">{sectionName}</h3>
            <AddProjectDialog onAdd={onAddItem} />
          </div>
          
          {items?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(project => (
                <Card key={project.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{project.name}</CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onDeleteItem(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => document.getElementById(project.id).click()}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2">{project.description}</p>
                    {project.bulletPoints && (
                      <ul className="list-disc pl-5">
                        {project.bulletPoints.map(bp => (
                          <li key={bp.id}>{bp.text}</li>
                        ))}
                      </ul>
                    )}
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
                  <EditProjectDialog 
                    id={project.id}
                    project={project}
                    onSave={(data) => onUpdateItem(project.id, data)}
                  />
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No projects added yet.</p>
          )}
        </div>
      );
      
    case "certifications":
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">{sectionName}</h3>
            <AddCertificationDialog onAdd={onAddItem} />
          </div>
          
          {items?.length > 0 ? (
            items.map(cert => (
              <Card key={cert.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{cert.name}</CardTitle>
                      <CardDescription>{cert.issuer} | {cert.date}{cert.expirationDate ? ` - ${cert.expirationDate}` : ''}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDeleteItem(cert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => document.getElementById(cert.id).click()}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {cert.credentialId && (
                    <p className="text-sm">Credential ID: {cert.credentialId}</p>
                  )}
                  {cert.bulletPoints && (
                    <ul className="list-disc pl-5">
                      {cert.bulletPoints.map(bp => (
                        <li key={bp.id}>{bp.text}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                <EditCertificationDialog 
                  id={cert.id}
                  certification={cert}
                  onSave={(data) => onUpdateItem(cert.id, data)}
                />
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No certifications added yet.</p>
          )}
        </div>
      );
      
    default:
      // For custom sections or any other section type
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">{sectionName}</h3>
            <AddCustomItemDialog 
              sectionName={sectionName}
              onAdd={onAddItem} 
            />
          </div>
          
          {items && items.length > 0 ? (
            items.map(item => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle>{item.title || "Untitled Item"}</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{item.description || "No description provided."}</p>
                  {item.bulletPoints && item.bulletPoints.length > 0 && (
                    <ul className="list-disc pl-5 mt-2">
                      {item.bulletPoints.map(bp => (
                        <li key={bp.id}>{bp.text}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No items in this section yet. Click "Add Item" to get started.
            </p>
          )}
        </div>
      );
  }
};

const AddExperienceDialog = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    title: "",
    company: "",
    period: "",
    description: "",
    bulletPoints: []
  });

  const handleSubmit = () => {
    onAdd(data);
    setData({ title: "", company: "", period: "", description: "", bulletPoints: [] });
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
          
          <BulletPointsEditor
            bulletPoints={data.bulletPoints}
            onChange={(bulletPoints) => setData({...data, bulletPoints})}
          />
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
    description: "",
    bulletPoints: []
  });

  const handleSubmit = () => {
    onAdd(data);
    setData({ degree: "", institution: "", year: "", description: "", bulletPoints: [] });
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
          
          <BulletPointsEditor
            bulletPoints={data.bulletPoints}
            onChange={(bulletPoints) => setData({...data, bulletPoints})}
          />
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
    link: "",
    bulletPoints: []
  });

  const handleSubmit = () => {
    onAdd(data);
    setData({ name: "", description: "", link: "", bulletPoints: [] });
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
          
          <BulletPointsEditor
            bulletPoints={data.bulletPoints}
            onChange={(bulletPoints) => setData({...data, bulletPoints})}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const AddCertificationDialog = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    name: "",
    issuer: "",
    date: "",
    expirationDate: "",
    credentialId: "",
    bulletPoints: []
  });

  const handleSubmit = () => {
    onAdd(data);
    setData({ name: "", issuer: "", date: "", expirationDate: "", credentialId: "", bulletPoints: [] });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Certification
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Certification</DialogTitle>
          <DialogDescription>Add a new certification to your profile</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Certification Name</Label>
            <Input 
              id="name" 
              value={data.name} 
              onChange={e => setData({...data, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issuer">Issuing Organization</Label>
            <Input 
              id="issuer" 
              value={data.issuer} 
              onChange={e => setData({...data, issuer: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Issue Date</Label>
            <Input 
              id="date" 
              placeholder="e.g. 2020" 
              value={data.date} 
              onChange={e => setData({...data, date: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
            <Input 
              id="expirationDate" 
              placeholder="e.g. 2023" 
              value={data.expirationDate} 
              onChange={e => setData({...data, expirationDate: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="credentialId">Credential ID (Optional)</Label>
            <Input 
              id="credentialId" 
              value={data.credentialId} 
              onChange={e => setData({...data, credentialId: e.target.value})}
            />
          </div>
          
          <BulletPointsEditor
            bulletPoints={data.bulletPoints}
            onChange={(bulletPoints) => setData({...data, bulletPoints})}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add Certification</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditExperienceDialog = ({ id, experience, onSave }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    title: experience.title || "",
    company: experience.company || "",
    period: experience.period || "",
    description: experience.description || "",
    bulletPoints: experience.bulletPoints || []
  });

  useEffect(() => {
    setData({
      title: experience.title || "",
      company: experience.company || "",
      period: experience.period || "",
      description: experience.description || "",
      bulletPoints: experience.bulletPoints || []
    });
  }, [experience]);

  const handleSubmit = () => {
    onSave({
      ...experience,
      ...data
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button id={id} className="hidden"></button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Experience</DialogTitle>
          <DialogDescription>Update your work experience</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Job Title</Label>
            <Input 
              id="edit-title" 
              value={data.title} 
              onChange={e => setData({...data, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-company">Company</Label>
            <Input 
              id="edit-company" 
              value={data.company} 
              onChange={e => setData({...data, company: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-period">Period</Label>
            <Input 
              id="edit-period" 
              value={data.period} 
              onChange={e => setData({...data, period: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea 
              id="edit-description" 
              value={data.description} 
              onChange={e => setData({...data, description: e.target.value})}
            />
          </div>
          
          <BulletPointsEditor
            bulletPoints={data.bulletPoints}
            onChange={(bulletPoints) => setData({...data, bulletPoints})}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditEducationDialog = ({ id, education, onSave }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    degree: education.degree || "",
    institution: education.institution || "",
    year: education.year || "",
    description: education.description || "",
    bulletPoints: education.bulletPoints || []
  });

  useEffect(() => {
    setData({
      degree: education.degree || "",
      institution: education.institution || "",
      year: education.year || "",
      description: education.description || "",
      bulletPoints: education.bulletPoints || []
    });
  }, [education]);

  const handleSubmit = () => {
    onSave({
      ...education,
      ...data
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button id={id} className="hidden"></button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Education</DialogTitle>
          <DialogDescription>Update your educational background</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-degree">Degree</Label>
            <Input 
              id="edit-degree" 
              value={data.degree} 
              onChange={e => setData({...data, degree: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-institution">Institution</Label>
            <Input 
              id="edit-institution" 
              value={data.institution} 
              onChange={e => setData({...data, institution: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-year">Year</Label>
            <Input 
              id="edit-year" 
              value={data.year} 
              onChange={e => setData({...data, year: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea 
              id="edit-description" 
              value={data.description} 
              onChange={e => setData({...data, description: e.target.value})}
            />
          </div>
          
          <BulletPointsEditor
            bulletPoints={data.bulletPoints}
            onChange={(bulletPoints) => setData({...data, bulletPoints})}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditSkillDialog = ({ id, skill, onSave }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    name: skill.name || ""
  });

  useEffect(() => {
    setData({
      name: skill.name || ""
    });
  }, [skill]);

  const handleSubmit = () => {
    onSave({
      ...skill,
      ...data
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button id={id} className="hidden"></button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Skill</DialogTitle>
          <DialogDescription>Update your skill</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-skill-name">Skill Name</Label>
            <Input 
              id="edit-skill-name" 
              value={data.name} 
              onChange={e => setData({...data, name: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditProjectDialog = ({ id, project, onSave }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    name: project.name || "",
    description: project.description || "",
    link: project.link || "",
    bulletPoints: project.bulletPoints || []
  });

  useEffect(() => {
    setData({
      name: project.name || "",
      description: project.description || "",
      link: project.link || "",
      bulletPoints: project.bulletPoints || []
    });
  }, [project]);

  const handleSubmit = () => {
    onSave({
      ...project,
      ...data
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button id={id} className="hidden"></button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update your project details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-project-name">Project Name</Label>
            <Input 
              id="edit-project-name" 
              value={data.name} 
              onChange={e => setData({...data, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-project-description">Description</Label>
            <Textarea 
              id="edit-project-description" 
              value={data.description} 
              onChange={e => setData({...data, description: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-project-link">Project Link</Label>
            <Input 
              id="edit-project-link" 
              value={data.link} 
              onChange={e => setData({...data, link: e.target.value})}
            />
          </div>
          
          <BulletPointsEditor
            bulletPoints={data.bulletPoints}
            onChange={(bulletPoints) => setData({...data, bulletPoints})}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AdditionalLinksEditor = ({ links = [], onChange }) => {
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const addLink = () => {
    if (newLinkName.trim() && newLinkUrl.trim()) {
      // Fix: Make sure URL has http/https prefix
      let url = newLinkUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const newLinks = [...links, { name: newLinkName.trim(), url }];
      onChange(newLinks);
      setNewLinkName("");
      setNewLinkUrl("");
    }
  };

  const removeLink = (index) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    onChange(newLinks);
  };

  return (
    <div className="space-y-3">
      <Label>Additional Links</Label>
      
      {links.map((link, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={link.name}
            onChange={(e) => {
              const newLinks = [...links];
              newLinks[index].name = e.target.value;
              onChange(newLinks);
            }}
            placeholder="Name"
            className="flex-1"
          />
          <Input
            value={link.url}
            onChange={(e) => {
              const newLinks = [...links];
              newLinks[index].url = e.target.value;
              onChange(newLinks);
            }}
            placeholder="URL"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeLink(index)}
          >
            <X size={16} />
          </Button>
        </div>
      ))}
      
      <div className="flex gap-2">
        <Input
          placeholder="Link Name"
          value={newLinkName}
          onChange={(e) => setNewLinkName(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addLink();
            }
          }}
        />
        <Input
          placeholder="Link URL"
          value={newLinkUrl}
          onChange={(e) => setNewLinkUrl(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addLink();
            }
          }}
        />
        <Button 
          type="button" 
          onClick={addLink}
          disabled={!newLinkName.trim() || !newLinkUrl.trim()}
        >
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
};

export default Profile;