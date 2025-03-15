import React, { useState } from 'react';
import { useResumeParser } from '../ResumeParserContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Save, X, Plus, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ParsedSkillsSection: React.FC = () => {
  const { parsedResume, updateParsedItem } = useResumeParser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  if (!parsedResume) return null;

  const { skills } = parsedResume;

  const handleEdit = () => {
    setEditedSkills(skills.map(skill => skill.name));
    setIsEditing(true);
  };

  const handleSave = () => {
    // Update existing skills
    const updatedSkills = [...skills];
    
    // Update names for existing skills
    for (let i = 0; i < Math.min(updatedSkills.length, editedSkills.length); i++) {
      if (updatedSkills[i].name !== editedSkills[i]) {
        updateParsedItem('skills', i, { name: editedSkills[i] });
      }
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSelectChange = (index: number, checked: boolean) => {
    updateParsedItem('skills', index, { selected: checked });
  };

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...editedSkills];
    updatedSkills[index] = value;
    setEditedSkills(updatedSkills);
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setEditedSkills([...editedSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = [...editedSkills];
    updatedSkills.splice(index, 1);
    setEditedSkills(updatedSkills);
  };

  const handleSelectAll = () => {
    skills.forEach((_, index) => {
      updateParsedItem('skills', index, { selected: true });
    });
  };

  const handleDeselectAll = () => {
    skills.forEach((_, index) => {
      updateParsedItem('skills', index, { selected: false });
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Skills</h3>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground mr-2">
            {skills.filter(item => item.selected).length} of {skills.length} selected
          </div>
          {!isEditing && (
            <>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                Deselect All
              </Button>
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
      
      {skills.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No skills found in your resume
        </div>
      ) : isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            {editedSkills.map((skill, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input 
                  value={skill} 
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveSkill(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="flex items-center gap-2">
              <Input 
                value={newSkill} 
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a new skill"
                className="flex-1"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleAddSkill}
                disabled={!newSkill.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <div key={skill.id} className="flex items-center">
              <Badge 
                variant={skill.selected ? "default" : "outline"}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted/60"
                onClick={() => handleSelectChange(index, !skill.selected)}
              >
                <Checkbox 
                  id={`select-skill-${skill.id}`} 
                  checked={skill.selected}
                  onCheckedChange={(checked) => handleSelectChange(index, !!checked)}
                  className="h-3 w-3 mr-1"
                />
                {skill.name}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 