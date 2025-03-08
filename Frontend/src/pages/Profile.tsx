import { useState, useEffect, useRef } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { mockUser } from "@/data/mockUser";
import {
  ProfileHeader,
  ProfileTabs,
  CustomSection,
  EditCertificationDialog,
  ExperienceSection,
  EditExperienceDialog,
  EducationSection,
  EditEducationDialog,
  SkillsSection,
  ProjectsSection,
  EditProjectDialog,
  CertificationsSection
} from "@/components/profile";

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
          avatarUrl: reader.result as string
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
  const [editingItemId, setEditingItemId] = useState("");

  useEffect(() => {
    if (user.sections.customSections) {
      setCustomSectionKeys(Object.keys(user.sections.customSections));
    }
  }, []);

  // Add item to a section
  const handleAddItem = (type, data) => {
    let newId = `${type}-${Date.now()}`;
    let newData = {};
    
    // For custom sections
    if (type.startsWith("custom-")) {
      const sectionKey = type.replace("custom-", "");
      newData = {
        id: newId,
        ...data
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
      return;
    }
    
    // For standard sections
        newData = {
          id: newId,
      ...data
    };

    // Add the new item to the appropriate section
    setUser({
      ...user,
      sections: {
        ...user.sections,
        [type]: [...user.sections[type], newData]
      }
    });
  };

  // Delete an item from a section
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

  // Edit an item
  const handleEditItem = (type, id) => {
    setEditingItemId(`edit-${type}-${id}`);
    // Use setTimeout to allow the DOM to update before clicking the button
    setTimeout(() => {
      document.getElementById(`edit-${type}-${id}`)?.click();
    }, 0);
  };

  // Update an item
  const handleUpdateItem = (type, updatedItem) => {
    if (type.startsWith("custom-")) {
      const sectionKey = type.replace("custom-", "");
    setUser({
      ...user,
      sections: {
        ...user.sections,
        customSections: {
          ...user.sections.customSections,
            [sectionKey]: user.sections.customSections[sectionKey].map(item => 
              item.id === updatedItem.id ? updatedItem : item
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
            item.id === updatedItem.id ? updatedItem : item
          )
        }
      });
    }
  };

  // Add a new section
  const handleAddSection = (sectionName) => {
    const key = sectionName.toLowerCase().replace(/\s+/g, '-');
    
    if (customSectionKeys.includes(key) || coreSectionKeys.includes(key)) {
      alert("A section with this name already exists.");
      return;
    }
    
    setUser({
      ...user,
          sections: {
        ...user.sections,
        sectionMeta: {
          ...user.sections.sectionMeta,
          [key]: { name: sectionName, deletable: true, renamable: true }
        },
            customSections: {
          ...user.sections.customSections,
          [key]: []
        }
      }
    });
    
    setCustomSectionKeys([...customSectionKeys, key]);
    setSelectedTab(`custom-${key}`);
  };

  // Rename a section
  const handleRenameSection = (oldKey, newName, isCore = false) => {
    if (!newName.trim()) {
      setRenamingSectionKey("");
      return;
    }
    
    // Update the section metadata
    const updatedSectionMeta = { ...user.sections.sectionMeta };
    updatedSectionMeta[oldKey] = {
      ...updatedSectionMeta[oldKey],
      name: newName
    };
    
      setUser({
        ...user,
        sections: {
          ...user.sections,
        sectionMeta: updatedSectionMeta
      }
    });
    
    setRenamingSectionKey("");
  };

  // Delete a section
  const handleDeleteSection = (key, isCore = false) => {
    if (confirm(`Are you sure you want to delete the "${formatSectionName(key)}" section and all its items?`)) {
      if (isCore) {
        // For core sections, we just empty the section but keep it in the structure
        const updatedUser = {
        ...user,
        sections: {
          ...user.sections,
            [key]: []
          }
        };
        
        setUser(updatedUser);
        
        // If we're currently on this tab, switch to another tab
        if (selectedTab === key) {
          // Find the first non-empty tab to switch to
          const availableTabs = coreSectionKeys.filter(k => k !== key && user.sections[k].length > 0);
          if (availableTabs.length > 0) {
            setSelectedTab(availableTabs[0]);
          } else if (customSectionKeys.length > 0) {
            setSelectedTab(`custom-${customSectionKeys[0]}`);
    } else {
            // If all tabs are empty, stay on the current one
            setSelectedTab(key);
          }
        }
      } else {
        // For custom sections, we remove the entire section
        const updatedCustomSections = { ...user.sections.customSections };
        delete updatedCustomSections[key];
        
        const updatedUser = {
          ...user,
          sections: {
            ...user.sections,
            customSections: updatedCustomSections
          }
        };
        
        setUser(updatedUser);
        
        // Update the customSectionKeys state
        const newCustomSectionKeys = customSectionKeys.filter(k => k !== key);
        setCustomSectionKeys(newCustomSectionKeys);
        
        // If we're currently on this tab, switch to another tab
        if (selectedTab === `custom-${key}`) {
          if (coreSectionKeys.length > 0) {
            setSelectedTab(coreSectionKeys[0]);
          } else if (newCustomSectionKeys.length > 0) {
            setSelectedTab(`custom-${newCustomSectionKeys[0]}`);
          }
        }
      }
    }
  };

  // Helper function to format section names for display
  const formatSectionName = (key) => {
    if (user.sections.sectionMeta && user.sections.sectionMeta[key]) {
      return user.sections.sectionMeta[key].name;
    }
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
  };

  // Custom sections handler
  const handleAddCustomItem = (sectionKey, data) => {
    handleAddItem(`custom-${sectionKey}`, data);
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Link>
      </div>

      <ProfileHeader
        user={user}
        editingProfile={editingProfile}
        profileForm={profileForm}
        setProfileForm={setProfileForm}
        setEditingProfile={setEditingProfile}
        handleProfileUpdate={handleProfileUpdate}
        regenerateAvatar={regenerateAvatar}
        triggerFileInput={triggerFileInput}
        fileInputRef={fileInputRef}
        handleAvatarUpload={handleAvatarUpload}
      />
      
      <ProfileTabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        coreSectionKeys={coreSectionKeys}
        customSectionKeys={customSectionKeys}
        sectionMeta={user.sections.sectionMeta}
        renamingSectionKey={renamingSectionKey}
        setRenamingSectionKey={setRenamingSectionKey}
        newSectionName={newSectionName}
        setNewSectionName={setNewSectionName}
        handleAddSection={handleAddSection}
        handleRenameSection={handleRenameSection}
        handleDeleteSection={handleDeleteSection}
      >
        {/* Core Sections */}
        {coreSectionKeys.map(key => (
          <TabsContent key={key} value={key} className="space-y-4">
            {key === "experience" && (
              <ExperienceSection
                sectionName={formatSectionName(key)}
                items={user.sections.experience}
                onAddItem={(data) => handleAddItem(key, data)}
                onEditItem={(id) => handleEditItem(key, id)}
                onDeleteItem={(id) => handleDeleteItem(key, id)}
              />
            )}
            {key === "education" && (
              <EducationSection
                sectionName={formatSectionName(key)}
                items={user.sections.education}
                onAddItem={(data) => handleAddItem(key, data)}
                onEditItem={(id) => handleEditItem(key, id)}
                onDeleteItem={(id) => handleDeleteItem(key, id)}
              />
            )}
            {key === "skills" && (
              <SkillsSection
                sectionName={formatSectionName(key)}
                items={user.sections.skills}
                onAddItem={(data) => handleAddItem(key, data)}
                onDeleteItem={(id) => handleDeleteItem(key, id)}
              />
            )}
            {key === "projects" && (
              <ProjectsSection
                sectionName={formatSectionName(key)}
                items={user.sections.projects}
                onAddItem={(data) => handleAddItem(key, data)}
                onEditItem={(id) => handleEditItem(key, id)}
                onDeleteItem={(id) => handleDeleteItem(key, id)}
              />
            )}
            {key === "certifications" && (
              <CertificationsSection
                sectionName={formatSectionName(key)}
                items={user.sections.certifications}
                onAddItem={(data) => handleAddItem(key, data)}
                onEditItem={(id, data) => handleUpdateItem(key, data)}
                onDeleteItem={(id) => handleDeleteItem(key, id)}
              />
            )}
                </TabsContent>
              ))}
              
        {/* Custom Sections */}
        {customSectionKeys.map(key => (
          <TabsContent key={`custom-${key}`} value={`custom-${key}`}>
            <CustomSection
              sectionKey={key}
              sectionName={formatSectionName(key)}
              items={user.sections.customSections[key] || []}
              onAddItem={(data) => handleAddCustomItem(key, data)}
              onEditItem={(id, data) => handleUpdateItem(`custom-${key}`, data)}
              onDeleteItem={(id) => handleDeleteItem(`custom-${key}`, id)}
            />
          </TabsContent>
        ))}
      </ProfileTabs>
      
      {/* Edit Dialogs */}
      {user.sections.experience.map(experience => (
                <EditExperienceDialog 
          key={experience.id}
          id={`edit-experience-${experience.id}`}
          experience={experience}
          onSave={(updatedExperience) => handleUpdateItem("experience", updatedExperience)}
        />
      ))}
      
      {user.sections.education.map(education => (
                <EditEducationDialog 
          key={education.id}
          id={`edit-education-${education.id}`}
          education={education}
          onSave={(updatedEducation) => handleUpdateItem("education", updatedEducation)}
        />
      ))}
      
      {user.sections.projects.map(project => (
                  <EditProjectDialog 
          key={project.id}
          id={`edit-projects-${project.id}`}
                    project={project}
          onSave={(updatedProject) => handleUpdateItem("projects", updatedProject)}
        />
      ))}
      
      {user.sections.certifications.map(certification => (
                <EditCertificationDialog 
          key={certification.id}
          id={`edit-certification-${certification.id}`}
          certification={certification}
          open={editingItemId === `edit-certification-${certification.id}`}
          onOpenChange={(open) => {
            if (!open) setEditingItemId("");
          }}
          onSave={(updatedCertification) => handleUpdateItem("certifications", updatedCertification)}
        />
      ))}
    </div>
  );
};

export default Profile;