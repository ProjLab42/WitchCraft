import React, { useState } from 'react';
import { useResumeParser } from '../ResumeParserContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Edit, Save, X, Plus, Trash } from 'lucide-react';
import { ParsedCertification } from '@/types/resume-parser';
import { generateId } from '@/components/resume-editor/utils';

export const ParsedCertificationsSection: React.FC = () => {
  const { parsedResume, updateParsedItem } = useResumeParser();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedCertification, setEditedCertification] = useState<ParsedCertification | null>(null);
  const [newBulletPoint, setNewBulletPoint] = useState('');

  if (!parsedResume) return null;

  const { certifications } = parsedResume;

  const handleEdit = (index: number) => {
    setEditedCertification({ ...certifications[index] });
    setEditingIndex(index);
  };

  const handleSave = (index: number) => {
    if (editedCertification) {
      updateParsedItem('certifications', index, editedCertification);
      setEditingIndex(null);
      setEditedCertification(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedCertification(null);
  };

  const handleChange = (field: string, value: string) => {
    if (editedCertification) {
      setEditedCertification({ ...editedCertification, [field]: value });
    }
  };

  const handleSelectChange = (index: number, checked: boolean) => {
    updateParsedItem('certifications', index, { selected: checked });
  };

  const handleAddBulletPoint = () => {
    if (editedCertification && newBulletPoint.trim()) {
      const newBullet = {
        id: generateId(),
        text: newBulletPoint.trim()
      };
      
      setEditedCertification({
        ...editedCertification,
        bulletPoints: [...(editedCertification.bulletPoints || []), newBullet]
      });
      
      setNewBulletPoint('');
    }
  };

  const handleRemoveBulletPoint = (bulletIndex: number) => {
    if (editedCertification && editedCertification.bulletPoints) {
      const updatedBulletPoints = [...editedCertification.bulletPoints];
      updatedBulletPoints.splice(bulletIndex, 1);
      
      setEditedCertification({
        ...editedCertification,
        bulletPoints: updatedBulletPoints
      });
    }
  };

  const handleEditBulletPoint = (bulletIndex: number, text: string) => {
    if (editedCertification && editedCertification.bulletPoints) {
      const updatedBulletPoints = [...editedCertification.bulletPoints];
      updatedBulletPoints[bulletIndex] = {
        ...updatedBulletPoints[bulletIndex],
        text
      };
      
      setEditedCertification({
        ...editedCertification,
        bulletPoints: updatedBulletPoints
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Certifications</h3>
        <div className="text-sm text-muted-foreground">
          {certifications.filter(item => item.selected).length} of {certifications.length} selected
        </div>
      </div>
      
      {certifications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No certifications found in your resume
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {certifications.map((cert, index) => (
            <AccordionItem 
              key={cert.id} 
              value={cert.id}
              className="border rounded-md overflow-hidden"
            >
              <div className="flex items-center px-4 py-2 bg-muted/40">
                <Checkbox 
                  id={`select-cert-${cert.id}`} 
                  checked={cert.selected}
                  onCheckedChange={(checked) => handleSelectChange(index, !!checked)}
                  className="mr-2"
                />
                <AccordionTrigger className="hover:no-underline flex-1 py-0">
                  <div className="flex flex-col items-start text-left">
                    <div className="font-medium">{cert.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {cert.issuer}, {cert.date}{cert.expirationDate ? ` - ${cert.expirationDate}` : ''}
                    </div>
                  </div>
                </AccordionTrigger>
              </div>
              
              <AccordionContent className="px-4 pt-2 pb-4">
                {editingIndex === index ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${cert.id}`}>Certification Name</Label>
                        <Input 
                          id={`name-${cert.id}`} 
                          value={editedCertification?.name || ''} 
                          onChange={(e) => handleChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`issuer-${cert.id}`}>Issuer</Label>
                        <Input 
                          id={`issuer-${cert.id}`} 
                          value={editedCertification?.issuer || ''} 
                          onChange={(e) => handleChange('issuer', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`date-${cert.id}`}>Date</Label>
                        <Input 
                          id={`date-${cert.id}`} 
                          value={editedCertification?.date || ''} 
                          onChange={(e) => handleChange('date', e.target.value)}
                          placeholder="e.g. 2020"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`expirationDate-${cert.id}`}>Expiration Date (Optional)</Label>
                        <Input 
                          id={`expirationDate-${cert.id}`} 
                          value={editedCertification?.expirationDate || ''} 
                          onChange={(e) => handleChange('expirationDate', e.target.value)}
                          placeholder="e.g. 2023"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`credentialId-${cert.id}`}>Credential ID (Optional)</Label>
                        <Input 
                          id={`credentialId-${cert.id}`} 
                          value={editedCertification?.credentialId || ''} 
                          onChange={(e) => handleChange('credentialId', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Bullet Points</Label>
                      {editedCertification?.bulletPoints?.map((bullet, bulletIndex) => (
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
                    {cert.credentialId && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Credential ID</Label>
                        <p>{cert.credentialId}</p>
                      </div>
                    )}
                    
                    {cert.bulletPoints && cert.bulletPoints.length > 0 && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Highlights</Label>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {cert.bulletPoints.map(bullet => (
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