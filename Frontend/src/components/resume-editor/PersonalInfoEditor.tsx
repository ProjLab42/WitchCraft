import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Check } from "lucide-react";
import { PersonalInfo } from './ResumeContext';

interface PersonalInfoEditorProps {
  personalInfo: PersonalInfo;
  editedPersonalInfo: PersonalInfo;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: string, value: string) => void;
}

export const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({
  personalInfo,
  editedPersonalInfo,
  onSave,
  onCancel,
  onChange
}) => {
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="font-semibold text-lg">Edit Personal Information</h3>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            value={editedPersonalInfo.name} 
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="title">Professional Title</Label>
          <Input 
            id="title" 
            value={editedPersonalInfo.title} 
            onChange={(e) => onChange('title', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email"
            value={editedPersonalInfo.email} 
            onChange={(e) => onChange('email', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            value={editedPersonalInfo.location} 
            onChange={(e) => onChange('location', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input 
            id="linkedin" 
            value={editedPersonalInfo.links?.linkedin || ''} 
            onChange={(e) => onChange('links.linkedin', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="portfolio">Portfolio URL</Label>
          <Input 
            id="portfolio" 
            value={editedPersonalInfo.links?.portfolio || ''} 
            onChange={(e) => onChange('links.portfolio', e.target.value)}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-1 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={onSave}>
            <Check className="mr-1 h-4 w-4" /> Save
          </Button>
        </div>
      </div>
    </div>
  );
}; 