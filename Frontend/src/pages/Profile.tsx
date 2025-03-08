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
import { profileAPI } from "@/services/api.service";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const [user, setUser] = useState(mockUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  
  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Debug: Check if auth token exists
        const authToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='));
        
        console.log('Auth token exists:', !!authToken);
        
        // If no auth token, redirect to login
        if (!authToken) {
          console.log('No auth token found, using mock data');
          toast({
            title: "Not logged in",
            description: "Using mock data. Please sign in for real data.",
            variant: "default"
          });
          setLoading(false);
          return;
        }
        
        console.log('Fetching user profile...');
        const userData = await profileAPI.getProfile();
        console.log('User profile data:', userData);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);
  
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
  
  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      
      // Update profile data
      const profileData = {
        name: profileForm.name,
        title: profileForm.title,
        email: profileForm.email,
        location: profileForm.location,
        bio: profileForm.bio,
        links: {
          linkedin: profileForm.linkedin,
          portfolio: profileForm.portfolio,
          additionalLinks: profileForm.additionalLinks
        }
      };
      
      const updatedUser = await profileAPI.updateProfile(profileData);
      
      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append('profilePicture', avatarFile);
        const avatarResponse = await profileAPI.uploadProfilePicture(formData);
        updatedUser.avatarUrl = avatarResponse.profilePicture;
      }
      
      setUser(updatedUser);
      setEditingProfile(false);
      setAvatarFile(null);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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

  // Update form when user data changes
  useEffect(() => {
    setProfileForm({
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
  }, [user]);

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
    if (user.sections?.customSections) {
      setCustomSectionKeys(Object.keys(user.sections.customSections));
    }
  }, [user.sections]);

  // Add item to a section
  const handleAddItem = async (type, data) => {
    try {
      setSaving(true);
      let newId = `${type}-${Date.now()}`;
      let newData = {
        id: newId,
        ...data
      };
      
      // Create a deep copy of the sections to avoid TypeScript errors
      const newSections = JSON.parse(JSON.stringify(user.sections || {}));
      
      // Update local state first for immediate feedback
      if (type.startsWith("custom-")) {
        const sectionKey = type.replace("custom-", "");
        
        // Ensure customSections exists
        if (!newSections.customSections) {
          newSections.customSections = {};
        }
        
        // Ensure the specific section exists
        if (!newSections.customSections[sectionKey]) {
          newSections.customSections[sectionKey] = {
            id: `custom-${Date.now()}`,
            title: sectionKey,
            content: "",
            items: []
          };
        }
        
        // Ensure items array exists
        if (!Array.isArray(newSections.customSections[sectionKey].items)) {
          newSections.customSections[sectionKey].items = [];
        }
        
        // Add the new item
        newSections.customSections[sectionKey].items.push(newData);
        
        console.log('Updated custom section:', newSections.customSections[sectionKey]);
      } else {
        // Ensure the section array exists
        if (!Array.isArray(newSections[type])) {
          newSections[type] = [];
        }
        
        // Add the new item
        newSections[type].push(newData);
      }
      
      console.log('Updated sections:', newSections);
      
      // Update local state
      setUser({
        ...user,
        sections: newSections
      });
      
      // Send update to backend
      await profileAPI.updateProfile({
        sections: newSections
      });
      
      toast({
        title: "Success",
        description: "Item added successfully",
      });
    } catch (error) {
      console.error(`Error adding item to ${type}:`, error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete an item from a section
  const handleDeleteItem = async (type, id) => {
    try {
      setSaving(true);
      
      // Create a deep copy of the sections to avoid TypeScript errors
      const newSections = JSON.parse(JSON.stringify(user.sections || {}));
      
      // Update local state first for immediate feedback
      if (type.startsWith("custom-")) {
        const sectionKey = type.replace("custom-", "");
        
        // Ensure customSections and the specific section exist
        if (newSections.customSections && newSections.customSections[sectionKey]) {
          // Ensure items array exists
          if (Array.isArray(newSections.customSections[sectionKey].items)) {
            // Filter out the item to delete
            newSections.customSections[sectionKey].items = 
              newSections.customSections[sectionKey].items.filter(item => item.id !== id);
            
            console.log('Updated custom section after delete:', newSections.customSections[sectionKey]);
          }
        }
      } else {
        // Ensure the section array exists
        if (Array.isArray(newSections[type])) {
          // Filter out the item to delete
          newSections[type] = newSections[type].filter(item => item.id !== id);
        }
      }
      
      console.log('Updated sections after delete:', newSections);
      
      // Update local state
      setUser({
        ...user,
        sections: newSections
      });
      
      // Send update to backend
      await profileAPI.updateProfile({
        sections: newSections
      });
      
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error) {
      console.error(`Error deleting item from ${type}:`, error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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
  const handleUpdateItem = async (type, updatedItem) => {
    try {
      setSaving(true);
      
      console.log(`Updating item in ${type}:`, updatedItem);
      
      // Create updated sections data
      let updatedSections;
      
      if (type.startsWith("custom-")) {
        const sectionKey = type.replace("custom-", "");
        
        // Ensure customSections and the specific section exist
        if (!user.sections?.customSections || !user.sections.customSections[sectionKey]) {
          console.error(`customSections or section ${sectionKey} is undefined`);
          throw new Error(`customSections or section ${sectionKey} is undefined`);
        }
        
        const currentSection = user.sections.customSections[sectionKey];
        console.log('Current section:', currentSection);
        
        // Check if the section has an items array
        if (!Array.isArray(currentSection.items)) {
          console.error(`items is not an array in section ${sectionKey}:`, currentSection);
          throw new Error(`items is not an array in section ${sectionKey}`);
        }
        
        // Update the item in the items array
        const updatedItems = currentSection.items.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        );
        
        console.log('Updated items:', updatedItems);
        
        // Create a deep copy of the sections to avoid TypeScript errors
        const newSections = JSON.parse(JSON.stringify(user.sections));
        
        // Update the specific section
        newSections.customSections[sectionKey] = {
          ...currentSection,
          items: updatedItems
        };
        
        updatedSections = newSections;
      } else {
        // Create a deep copy of the sections to avoid TypeScript errors
        const newSections = JSON.parse(JSON.stringify(user.sections));
        
        // Update the specific section
        newSections[type] = user.sections[type].map(item => 
          item.id === updatedItem.id ? updatedItem : item
        );
        
        updatedSections = newSections;
      }
      
      console.log('Updated sections:', updatedSections);
      
      // Update local state
      setUser({
        ...user,
        sections: updatedSections
      });
      
      // Send update to backend
      console.log('Sending update to backend...');
      const response = await profileAPI.updateProfile({
        sections: updatedSections
      });
      console.log('Backend response:', response);
      
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    } catch (error) {
      console.error(`Error updating item in ${type}:`, error);
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Add a new section
  const handleAddSection = async (sectionName) => {
    try {
      setSaving(true);
      console.log('Adding new section:', sectionName);
      
      const key = sectionName.toLowerCase().replace(/\s+/g, '-');
      console.log('Section key:', key);
      
      if (customSectionKeys.includes(key) || coreSectionKeys.includes(key)) {
        toast({
          title: "Error",
          description: "A section with this name already exists.",
          variant: "destructive"
        });
        return;
      }
      
      // Ensure user.sections and customSections exist
      if (!user.sections) {
        console.error('user.sections is undefined');
        toast({
          title: "Error",
          description: "Failed to add section. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Create a deep copy of the sections to avoid TypeScript errors
      const newSections = JSON.parse(JSON.stringify(user.sections));
      
      // Add the new section metadata
      if (!newSections.sectionMeta) {
        newSections.sectionMeta = {};
      }
      newSections.sectionMeta[key] = { name: sectionName, deletable: true, renamable: true };
      
      // Add the new custom section
      if (!newSections.customSections) {
        newSections.customSections = {};
      }
      newSections.customSections[key] = {
        id: `custom-${Date.now()}`,
        title: sectionName,
        content: "",
        items: []
      };
      
      console.log('Updated sections:', newSections);
      
      // Update local state
      setUser({
        ...user,
        sections: newSections
      });
      
      setCustomSectionKeys([...customSectionKeys, key]);
      setSelectedTab(`custom-${key}`);
      
      // Send update to backend
      console.log('Sending update to backend...');
      const response = await profileAPI.updateProfile({
        sections: newSections
      });
      console.log('Backend response:', response);
      
      toast({
        title: "Success",
        description: "Section added successfully",
      });
    } catch (error) {
      console.error("Error adding section:", error);
      toast({
        title: "Error",
        description: "Failed to add section. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Rename a section
  const handleRenameSection = async (oldKey, newName, isCore = false) => {
    try {
      setSaving(true);
      
      if (!newName.trim()) {
        setRenamingSectionKey("");
        return;
      }
      
      // Create a deep copy of the sections to avoid TypeScript errors
      const newSections = JSON.parse(JSON.stringify(user.sections || {}));
      
      // Ensure sectionMeta exists
      if (!newSections.sectionMeta) {
        newSections.sectionMeta = {};
      }
      
      // Update the section metadata if it exists
      if (newSections.sectionMeta[oldKey]) {
        newSections.sectionMeta[oldKey].name = newName;
      } else {
        // Create it if it doesn't exist
        newSections.sectionMeta[oldKey] = {
          name: newName,
          deletable: !isCore,
          renamable: true
        };
      }
      
      console.log('Updated sections after rename:', newSections);
      
      // Update local state
      setUser({
        ...user,
        sections: newSections
      });
      
      setRenamingSectionKey("");
      
      // Send update to backend
      await profileAPI.updateProfile({
        sections: newSections
      });
      
      toast({
        title: "Success",
        description: "Section renamed successfully",
      });
    } catch (error) {
      console.error("Error renaming section:", error);
      toast({
        title: "Error",
        description: "Failed to rename section. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete a section
  const handleDeleteSection = async (key, isCore = false) => {
    try {
      setSaving(true);
      
      // Create a deep copy of the sections to avoid TypeScript errors
      const newSections = JSON.parse(JSON.stringify(user.sections || {}));
      
      if (isCore) {
        // For core sections, we just empty the array
        if (newSections[key]) {
          newSections[key] = [];
        }
      } else {
        // For custom sections, we remove the entire section
        if (newSections.customSections && newSections.customSections[key]) {
          delete newSections.customSections[key];
          
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
      
      console.log('Updated sections after delete section:', newSections);
      
      // Update local state
      setUser({
        ...user,
        sections: newSections
      });
      
      // Send update to backend
      await profileAPI.updateProfile({
        sections: newSections
      });
      
      toast({
        title: "Success",
        description: "Section deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting section:", error);
      toast({
        title: "Error",
        description: "Failed to delete section. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper function to format section names for display
  const formatSectionName = (key) => {
    if (user.sections?.sectionMeta && user.sections.sectionMeta[key]) {
      return user.sections.sectionMeta[key].name;
    }
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
  };

  // Custom sections handler
  const handleAddCustomItem = (sectionKey, data) => {
    console.log(`Adding custom item to section ${sectionKey}:`, data);
    
    // Add an ID to the custom item data
    const customItemWithId = {
      id: `custom-item-${Date.now()}`,
      ...data
    };
    
    console.log('Custom item with ID:', customItemWithId);
    
    handleAddItem(`custom-${sectionKey}`, customItemWithId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is not authenticated (no sections data)
  const isAuthenticated = !!document.cookie
    .split('; ')
    .find(row => row.startsWith('authToken='));

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Not Logged In</h1>
          <p className="text-muted-foreground mb-4">You need to sign in to access your profile.</p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.href = '/signin'}>
              Sign In
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/signup'}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
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
        saving={saving}
      />
      
      <ProfileTabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        coreSectionKeys={coreSectionKeys}
        customSectionKeys={customSectionKeys}
        sectionMeta={user.sections?.sectionMeta || {}}
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
                items={user.sections?.experience || []}
                onAddItem={(data) => handleAddItem(key, data)}
                onEditItem={(id) => handleEditItem(key, id)}
                onDeleteItem={(id) => handleDeleteItem(key, id)}
              />
            )}
            {key === "education" && (
              <EducationSection
                sectionName={formatSectionName(key)}
                items={user.sections?.education || []}
                onAddItem={(data) => handleAddItem(key, data)}
                onEditItem={(id) => handleEditItem(key, id)}
                onDeleteItem={(id) => handleDeleteItem(key, id)}
              />
            )}
            {key === "skills" && (
              <SkillsSection
                sectionName={formatSectionName(key)}
                items={user.sections?.skills || []}
                onAddItem={(data) => handleAddItem(key, data)}
                onDeleteItem={(id) => handleDeleteItem(key, id)}
              />
            )}
            {key === "projects" && (
              <ProjectsSection
                sectionName={formatSectionName(key)}
                items={user.sections?.projects || []}
                onAddItem={(data) => handleAddItem(key, data)}
                onEditItem={(id) => handleEditItem(key, id)}
                onDeleteItem={(id) => handleDeleteItem(key, id)}
              />
            )}
            {key === "certifications" && (
              <CertificationsSection
                sectionName={formatSectionName(key)}
                items={user.sections?.certifications || []}
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
              items={user.sections?.customSections?.[key]?.items || []}
              onAddItem={(data) => handleAddCustomItem(key, data)}
              onEditItem={(id, data) => handleUpdateItem(`custom-${key}`, data)}
              onDeleteItem={(id) => handleDeleteItem(`custom-${key}`, id)}
            />
          </TabsContent>
        ))}
      </ProfileTabs>
      
      {/* Edit Dialogs */}
      {user.sections?.experience?.map(experience => (
        <EditExperienceDialog 
          key={experience.id}
          id={`edit-experience-${experience.id}`}
          experience={experience}
          open={editingItemId === `edit-experience-${experience.id}`}
          onOpenChange={(open) => {
            if (!open) setEditingItemId("");
          }}
          onSave={(updatedExperience) => handleUpdateItem("experience", updatedExperience)}
        />
      ))}
      
      {user.sections?.education?.map(education => (
        <EditEducationDialog 
          key={education.id}
          id={`edit-education-${education.id}`}
          education={education}
          open={editingItemId === `edit-education-${education.id}`}
          onOpenChange={(open) => {
            if (!open) setEditingItemId("");
          }}
          onSave={(updatedEducation) => handleUpdateItem("education", updatedEducation)}
        />
      ))}
      
      {user.sections?.projects?.map(project => (
        <EditProjectDialog 
          key={project.id}
          id={`edit-projects-${project.id}`}
          project={project}
          open={editingItemId === `edit-projects-${project.id}`}
          onOpenChange={(open) => {
            if (!open) setEditingItemId("");
          }}
          onSave={(updatedProject) => handleUpdateItem("projects", updatedProject)}
        />
      ))}
      
      {user.sections?.certifications?.map(certification => (
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