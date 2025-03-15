import React, { useState } from 'react';
import { useResumeParser } from '../ResumeParserContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Save, X, Plus, Trash } from 'lucide-react';

export const ParsedPersonalInfoSection: React.FC = () => {
  const { parsedResume, updateParsedPersonalInfo } = useResumeParser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState(parsedResume?.personalInfo || {});
  const [editingLinks, setEditingLinks] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', url: '' });

  if (!parsedResume) return null;

  const { personalInfo } = parsedResume;

  const handleEdit = () => {
    setEditedInfo({ ...personalInfo });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateParsedPersonalInfo(editedInfo);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setEditedInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleLinksChange = (field: string, value: string) => {
    setEditedInfo(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [field]: value
      }
    }));
  };

  const handleAddLink = () => {
    if (newLink.name && newLink.url) {
      const updatedLinks = [
        ...(editedInfo.links?.additionalLinks || []),
        { name: newLink.name, url: newLink.url }
      ];
      
      setEditedInfo(prev => ({
        ...prev,
        links: {
          ...prev.links,
          additionalLinks: updatedLinks
        }
      }));
      
      setNewLink({ name: '', url: '' });
    }
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = [...(editedInfo.links?.additionalLinks || [])];
    updatedLinks.splice(index, 1);
    
    setEditedInfo(prev => ({
      ...prev,
      links: {
        ...prev.links,
        additionalLinks: updatedLinks
      }
    }));
  };

  const handleSelectChange = (checked: boolean) => {
    updateParsedPersonalInfo({ selected: checked });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="select-personal-info" 
            checked={personalInfo.selected}
            onCheckedChange={handleSelectChange}
          />
          <Label htmlFor="select-personal-info" className="text-lg font-medium">
            Personal Information
          </Label>
        </div>
        
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>
      
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Name</Label>
            <p className="font-medium">{personalInfo.name}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Email</Label>
            <p className="font-medium">{personalInfo.email}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Phone</Label>
            <p className="font-medium">{personalInfo.phone || 'Not provided'}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Title</Label>
            <p className="font-medium">{personalInfo.title || 'Not provided'}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Location</Label>
            <p className="font-medium">{personalInfo.location || 'Not provided'}</p>
          </div>
          <div className="md:col-span-2">
            <Label className="text-sm text-muted-foreground">Bio</Label>
            <p>{personalInfo.bio || 'Not provided'}</p>
          </div>
          
          <div className="md:col-span-2">
            <Label className="text-sm text-muted-foreground">Links</Label>
            <div className="space-y-2 mt-1">
              {personalInfo.links?.linkedin && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">LinkedIn:</span>
                  <a href={personalInfo.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                    {personalInfo.links.linkedin}
                  </a>
                </div>
              )}
              {personalInfo.links?.portfolio && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Portfolio:</span>
                  <a href={personalInfo.links.portfolio} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                    {personalInfo.links.portfolio}
                  </a>
                </div>
              )}
              {personalInfo.links?.additionalLinks?.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="font-medium">{link.name}:</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                    {link.url}
                  </a>
                </div>
              ))}
              {!personalInfo.links?.linkedin && !personalInfo.links?.portfolio && (!personalInfo.links?.additionalLinks || personalInfo.links.additionalLinks.length === 0) && (
                <p>No links provided</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={editedInfo.name || ''} 
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={editedInfo.email || ''} 
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={editedInfo.phone || ''} 
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={editedInfo.title || ''} 
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={editedInfo.location || ''} 
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                value={editedInfo.bio || ''} 
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Links</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditingLinks(!editingLinks)}
              >
                {editingLinks ? 'Done' : 'Edit Links'}
              </Button>
            </div>
            
            {editingLinks && (
              <div className="space-y-4 border rounded-md p-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input 
                    id="linkedin" 
                    value={editedInfo.links?.linkedin || ''} 
                    onChange={(e) => handleLinksChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio</Label>
                  <Input 
                    id="portfolio" 
                    value={editedInfo.links?.portfolio || ''} 
                    onChange={(e) => handleLinksChange('portfolio', e.target.value)}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Additional Links</Label>
                  {editedInfo.links?.additionalLinks?.map((link, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input 
                        value={link.name} 
                        onChange={(e) => {
                          const updatedLinks = [...(editedInfo.links?.additionalLinks || [])];
                          updatedLinks[index] = { ...updatedLinks[index], name: e.target.value };
                          handleLinksChange('additionalLinks', updatedLinks);
                        }}
                        placeholder="Name (e.g. GitHub)"
                        className="flex-1"
                      />
                      <Input 
                        value={link.url} 
                        onChange={(e) => {
                          const updatedLinks = [...(editedInfo.links?.additionalLinks || [])];
                          updatedLinks[index] = { ...updatedLinks[index], url: e.target.value };
                          handleLinksChange('additionalLinks', updatedLinks);
                        }}
                        placeholder="URL"
                        className="flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveLink(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex gap-2 items-center">
                    <Input 
                      value={newLink.name} 
                      onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                      placeholder="Name (e.g. GitHub)"
                      className="flex-1"
                    />
                    <Input 
                      value={newLink.url} 
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      placeholder="URL"
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleAddLink}
                      disabled={!newLink.name || !newLink.url}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 