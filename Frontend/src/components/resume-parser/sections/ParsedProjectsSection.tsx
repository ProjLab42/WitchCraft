import React, { useState } from 'react';
import { useResumeParser } from '../ResumeParserContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Edit, Save, X, Plus, Trash, Link as LinkIcon } from 'lucide-react';
import { ParsedProject } from '@/types/resume-parser';
import { generateId } from '@/components/resume-editor/utils';

export const ParsedProjectsSection: React.FC = () => {
  const { parsedResume, updateParsedItem } = useResumeParser();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedProject, setEditedProject] = useState<ParsedProject | null>(null);
  const [newBulletPoint, setNewBulletPoint] = useState('');

  if (!parsedResume) return null;

  const { projects } = parsedResume;

  const handleEdit = (index: number) => {
    setEditedProject({ ...projects[index] });
    setEditingIndex(index);
  };

  const handleSave = (index: number) => {
    if (editedProject) {
      updateParsedItem('projects', index, editedProject);
      setEditingIndex(null);
      setEditedProject(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedProject(null);
  };

  const handleChange = (field: string, value: string) => {
    if (editedProject) {
      setEditedProject({ ...editedProject, [field]: value });
    }
  };

  const handleSelectChange = (index: number, checked: boolean) => {
    updateParsedItem('projects', index, { selected: checked });
  };

  const handleAddBulletPoint = () => {
    if (editedProject && newBulletPoint.trim()) {
      const newBullet = {
        id: generateId(),
        text: newBulletPoint.trim()
      };
      
      setEditedProject({
        ...editedProject,
        bulletPoints: [...(editedProject.bulletPoints || []), newBullet]
      });
      
      setNewBulletPoint('');
    }
  };

  const handleRemoveBulletPoint = (bulletIndex: number) => {
    if (editedProject && editedProject.bulletPoints) {
      const updatedBulletPoints = [...editedProject.bulletPoints];
      updatedBulletPoints.splice(bulletIndex, 1);
      
      setEditedProject({
        ...editedProject,
        bulletPoints: updatedBulletPoints
      });
    }
  };

  const handleEditBulletPoint = (bulletIndex: number, text: string) => {
    if (editedProject && editedProject.bulletPoints) {
      const updatedBulletPoints = [...editedProject.bulletPoints];
      updatedBulletPoints[bulletIndex] = {
        ...updatedBulletPoints[bulletIndex],
        text
      };
      
      setEditedProject({
        ...editedProject,
        bulletPoints: updatedBulletPoints
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Projects</h3>
        <div className="text-sm text-muted-foreground">
          {projects.filter(item => item.selected).length} of {projects.length} selected
        </div>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No projects found in your resume
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {projects.map((project, index) => (
            <AccordionItem 
              key={project.id} 
              value={project.id}
              className="border rounded-md overflow-hidden"
            >
              <div className="flex items-center px-4 py-2 bg-muted/40">
                <Checkbox 
                  id={`select-project-${project.id}`} 
                  checked={project.selected}
                  onCheckedChange={(checked) => handleSelectChange(index, !!checked)}
                  className="mr-2"
                />
                <AccordionTrigger className="hover:no-underline flex-1 py-0">
                  <div className="flex flex-col items-start text-left">
                    <div className="font-medium">{project.name}</div>
                    {project.link && (
                      <div className="text-sm text-muted-foreground flex items-center">
                        <LinkIcon className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[200px]">{project.link}</span>
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
              </div>
              
              <AccordionContent className="px-4 pt-2 pb-4">
                {editingIndex === index ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${project.id}`}>Project Name</Label>
                        <Input 
                          id={`name-${project.id}`} 
                          value={editedProject?.name || ''} 
                          onChange={(e) => handleChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`link-${project.id}`}>Project Link</Label>
                        <Input 
                          id={`link-${project.id}`} 
                          value={editedProject?.link || ''} 
                          onChange={(e) => handleChange('link', e.target.value)}
                          placeholder="e.g. https://github.com/username/project"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`description-${project.id}`}>Description</Label>
                      <Textarea 
                        id={`description-${project.id}`} 
                        value={editedProject?.description || ''} 
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Bullet Points</Label>
                      {editedProject?.bulletPoints?.map((bullet, bulletIndex) => (
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
                    {project.description && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Description</Label>
                        <p>{project.description}</p>
                      </div>
                    )}
                    
                    {project.link && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Link</Label>
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline flex items-center"
                        >
                          <LinkIcon className="h-4 w-4 mr-1" />
                          {project.link}
                        </a>
                      </div>
                    )}
                    
                    {project.bulletPoints && project.bulletPoints.length > 0 && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Highlights</Label>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {project.bulletPoints.map(bullet => (
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