import React, { useState } from 'react';
import { useResumeParser } from '../ResumeParserContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Edit, Save, X, Plus, Trash } from 'lucide-react';
import { ParsedEducation } from '@/types/resume-parser';
import { generateId } from '@/components/resume-editor/utils';

export const ParsedEducationSection: React.FC = () => {
  const { parsedResume, updateParsedItem } = useResumeParser();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedEducation, setEditedEducation] = useState<ParsedEducation | null>(null);
  const [newBulletPoint, setNewBulletPoint] = useState('');

  if (!parsedResume) return null;

  const { education } = parsedResume;

  const handleEdit = (index: number) => {
    setEditedEducation({ ...education[index] });
    setEditingIndex(index);
  };

  const handleSave = (index: number) => {
    if (editedEducation) {
      updateParsedItem('education', index, editedEducation);
      setEditingIndex(null);
      setEditedEducation(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedEducation(null);
  };

  const handleChange = (field: string, value: string) => {
    if (editedEducation) {
      setEditedEducation({ ...editedEducation, [field]: value });
    }
  };

  const handleSelectChange = (index: number, checked: boolean) => {
    updateParsedItem('education', index, { selected: checked });
  };

  const handleAddBulletPoint = () => {
    if (editedEducation && newBulletPoint.trim()) {
      const newBullet = {
        id: generateId(),
        text: newBulletPoint.trim()
      };
      
      setEditedEducation({
        ...editedEducation,
        bulletPoints: [...(editedEducation.bulletPoints || []), newBullet]
      });
      
      setNewBulletPoint('');
    }
  };

  const handleRemoveBulletPoint = (bulletIndex: number) => {
    if (editedEducation && editedEducation.bulletPoints) {
      const updatedBulletPoints = [...editedEducation.bulletPoints];
      updatedBulletPoints.splice(bulletIndex, 1);
      
      setEditedEducation({
        ...editedEducation,
        bulletPoints: updatedBulletPoints
      });
    }
  };

  const handleEditBulletPoint = (bulletIndex: number, text: string) => {
    if (editedEducation && editedEducation.bulletPoints) {
      const updatedBulletPoints = [...editedEducation.bulletPoints];
      updatedBulletPoints[bulletIndex] = {
        ...updatedBulletPoints[bulletIndex],
        text
      };
      
      setEditedEducation({
        ...editedEducation,
        bulletPoints: updatedBulletPoints
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Education</h3>
        <div className="text-sm text-muted-foreground">
          {education.filter(item => item.selected).length} of {education.length} selected
        </div>
      </div>
      
      {education.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No education found in your resume
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {education.map((edu, index) => (
            <AccordionItem 
              key={edu.id} 
              value={edu.id}
              className="border rounded-md overflow-hidden"
            >
              <div className="flex items-center px-4 py-2 bg-muted/40">
                <Checkbox 
                  id={`select-edu-${edu.id}`} 
                  checked={edu.selected}
                  onCheckedChange={(checked) => handleSelectChange(index, !!checked)}
                  className="mr-2"
                />
                <AccordionTrigger className="hover:no-underline flex-1 py-0">
                  <div className="flex flex-col items-start text-left">
                    <div className="font-medium">{edu.degree}</div>
                    <div className="text-sm text-muted-foreground">{edu.institution}, {edu.year}</div>
                  </div>
                </AccordionTrigger>
              </div>
              
              <AccordionContent className="px-4 pt-2 pb-4">
                {editingIndex === index ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                        <Input 
                          id={`degree-${edu.id}`} 
                          value={editedEducation?.degree || ''} 
                          onChange={(e) => handleChange('degree', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`institution-${edu.id}`}>Institution</Label>
                        <Input 
                          id={`institution-${edu.id}`} 
                          value={editedEducation?.institution || ''} 
                          onChange={(e) => handleChange('institution', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`year-${edu.id}`}>Year</Label>
                        <Input 
                          id={`year-${edu.id}`} 
                          value={editedEducation?.year || ''} 
                          onChange={(e) => handleChange('year', e.target.value)}
                          placeholder="e.g. 2020"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`description-${edu.id}`}>Description</Label>
                      <Textarea 
                        id={`description-${edu.id}`} 
                        value={editedEducation?.description || ''} 
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Bullet Points</Label>
                      {editedEducation?.bulletPoints?.map((bullet, bulletIndex) => (
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
                    {edu.description && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Description</Label>
                        <p>{edu.description}</p>
                      </div>
                    )}
                    
                    {edu.bulletPoints && edu.bulletPoints.length > 0 && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Highlights</Label>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {edu.bulletPoints.map(bullet => (
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