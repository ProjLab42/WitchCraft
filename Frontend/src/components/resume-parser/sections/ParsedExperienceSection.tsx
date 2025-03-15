import React, { useState } from 'react';
import { useResumeParser } from '../ResumeParserContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Edit, Save, X, Plus, Trash, ChevronDown, ChevronUp } from 'lucide-react';
import { ParsedExperience } from '@/types/resume-parser';
import { generateId } from '@/components/resume-editor/utils';

export const ParsedExperienceSection: React.FC = () => {
  const { parsedResume, updateParsedItem } = useResumeParser();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedExperience, setEditedExperience] = useState<ParsedExperience | null>(null);
  const [newBulletPoint, setNewBulletPoint] = useState('');

  if (!parsedResume) return null;

  const { experience } = parsedResume;

  const handleEdit = (index: number) => {
    setEditedExperience({ ...experience[index] });
    setEditingIndex(index);
  };

  const handleSave = (index: number) => {
    if (editedExperience) {
      updateParsedItem('experience', index, editedExperience);
      setEditingIndex(null);
      setEditedExperience(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedExperience(null);
  };

  const handleChange = (field: string, value: string) => {
    if (editedExperience) {
      setEditedExperience({ ...editedExperience, [field]: value });
    }
  };

  const handleSelectChange = (index: number, checked: boolean) => {
    updateParsedItem('experience', index, { selected: checked });
  };

  const handleAddBulletPoint = () => {
    if (editedExperience && newBulletPoint.trim()) {
      const newBullet = {
        id: generateId(),
        text: newBulletPoint.trim()
      };
      
      setEditedExperience({
        ...editedExperience,
        bulletPoints: [...(editedExperience.bulletPoints || []), newBullet]
      });
      
      setNewBulletPoint('');
    }
  };

  const handleRemoveBulletPoint = (bulletIndex: number) => {
    if (editedExperience && editedExperience.bulletPoints) {
      const updatedBulletPoints = [...editedExperience.bulletPoints];
      updatedBulletPoints.splice(bulletIndex, 1);
      
      setEditedExperience({
        ...editedExperience,
        bulletPoints: updatedBulletPoints
      });
    }
  };

  const handleEditBulletPoint = (bulletIndex: number, text: string) => {
    if (editedExperience && editedExperience.bulletPoints) {
      const updatedBulletPoints = [...editedExperience.bulletPoints];
      updatedBulletPoints[bulletIndex] = {
        ...updatedBulletPoints[bulletIndex],
        text
      };
      
      setEditedExperience({
        ...editedExperience,
        bulletPoints: updatedBulletPoints
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Work Experience</h3>
        <div className="text-sm text-muted-foreground">
          {experience.filter(item => item.selected).length} of {experience.length} selected
        </div>
      </div>
      
      {experience.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No work experience found in your resume
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {experience.map((exp, index) => (
            <AccordionItem 
              key={exp.id} 
              value={exp.id}
              className="border rounded-md overflow-hidden"
            >
              <div className="flex items-center px-4 py-2 bg-muted/40">
                <Checkbox 
                  id={`select-exp-${exp.id}`} 
                  checked={exp.selected}
                  onCheckedChange={(checked) => handleSelectChange(index, !!checked)}
                  className="mr-2"
                />
                <AccordionTrigger className="hover:no-underline flex-1 py-0">
                  <div className="flex flex-col items-start text-left">
                    <div className="font-medium">{exp.title} at {exp.company}</div>
                    <div className="text-sm text-muted-foreground">{exp.period}</div>
                  </div>
                </AccordionTrigger>
              </div>
              
              <AccordionContent className="px-4 pt-2 pb-4">
                {editingIndex === index ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`title-${exp.id}`}>Job Title</Label>
                        <Input 
                          id={`title-${exp.id}`} 
                          value={editedExperience?.title || ''} 
                          onChange={(e) => handleChange('title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`company-${exp.id}`}>Company</Label>
                        <Input 
                          id={`company-${exp.id}`} 
                          value={editedExperience?.company || ''} 
                          onChange={(e) => handleChange('company', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`period-${exp.id}`}>Period</Label>
                        <Input 
                          id={`period-${exp.id}`} 
                          value={editedExperience?.period || ''} 
                          onChange={(e) => handleChange('period', e.target.value)}
                          placeholder="e.g. 2020 - Present"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`description-${exp.id}`}>Description</Label>
                      <Textarea 
                        id={`description-${exp.id}`} 
                        value={editedExperience?.description || ''} 
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Bullet Points</Label>
                      {editedExperience?.bulletPoints?.map((bullet, bulletIndex) => (
                        <div key={bullet.id} className="flex gap-2 items-center">
                          <Input 
                            value={bullet.text} 
                            onChange={(e) => handleEditBulletPoint(bulletIndex, e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveBulletPoint(bulletIndex)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <div className="flex gap-2 items-center">
                        <Input 
                          value={newBulletPoint} 
                          onChange={(e) => setNewBulletPoint(e.target.value)}
                          placeholder="Add a bullet point"
                          className="flex-1"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={handleAddBulletPoint}
                          disabled={!newBulletPoint.trim()}
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
                      <Button size="sm" onClick={() => handleSave(index)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exp.description && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Description</Label>
                        <p>{exp.description}</p>
                      </div>
                    )}
                    
                    {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Highlights</Label>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {exp.bulletPoints.map(bullet => (
                            <li key={bullet.id}>{bullet.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(index)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}; 