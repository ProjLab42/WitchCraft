import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Edit, Trash, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserData, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from './ResumeContext';

type ItemType = ExperienceItem | EducationItem | ProjectItem | CertificationItem;

interface DraggableItemProps {
  item: ItemType;
  type: string;
  onDrop: (item: ItemType & { itemType: string }) => void;
  userData?: UserData;
  setUserData?: React.Dispatch<React.SetStateAction<UserData>>;
  onDelete?: (id: string) => void;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({ 
  item, 
  type, 
  onDrop, 
  userData, 
  setUserData,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<ItemType>({ ...item });
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'RESUME_ITEM',
    item: { 
      ...item, 
      itemType: type
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !isEditing, // Prevent dragging while editing
  }));
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag from starting
    setIsEditing(true);
  };
  
  const handleSave = () => {
    // Update the item with edited values
    onDrop({ ...editedItem, itemType: type });
    
    // Update the userData state to sync with the edited item
    if (userData && setUserData) {
      setUserData(prevUserData => {
        // Create a deep copy of the sections
        const updatedSections = { ...prevUserData.sections };
        
        // Find and update the item in the appropriate section
        if (updatedSections[type as keyof typeof updatedSections]) {
          const sectionArray = updatedSections[type as keyof typeof updatedSections] as ItemType[];
          const updatedArray = sectionArray.map(sectionItem => 
            sectionItem.id === editedItem.id ? { ...editedItem } : sectionItem
          );
          
          // Update the section with the new array
          updatedSections[type as keyof typeof updatedSections] = updatedArray as any;
        }
        
        return {
          ...prevUserData,
          sections: updatedSections
        };
      });
    }
    
    setIsEditing(false);
    toast.success("Item updated successfully");
  };
  
  const handleCancel = () => {
    // Reset to original values
    setEditedItem({ ...item });
    setIsEditing(false);
  };
  
  const handleChange = (field: string, value: string) => {
    setEditedItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(item.id);
    }
  };
  
  // Simplified item displays based on data type
  const renderContent = () => {
    switch (type) {
      case 'experience':
        return isEditing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                value={(editedItem as ExperienceItem).company} 
                onChange={(e) => handleChange('company', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input 
                id="title" 
                value={(editedItem as ExperienceItem).title} 
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="period">Period</Label>
              <Input 
                id="period" 
                value={(editedItem as ExperienceItem).period} 
                onChange={(e) => handleChange('period', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={(editedItem as ExperienceItem).description} 
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Check className="mr-1 h-4 w-4" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{(item as ExperienceItem).company}</h4>
                <p className="text-sm text-muted-foreground">{(item as ExperienceItem).title}</p>
                <p className="text-xs text-muted-foreground">{(item as ExperienceItem).period}</p>
              </div>
              <div className="flex space-x-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleEditClick}>
                  <Edit size={14} />
                </Button>
                {onDelete && (
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={handleDelete}>
                    <Trash size={14} />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm mt-2">{(item as ExperienceItem).description}</p>
          </div>
        );
        
      case 'education':
        return isEditing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input 
                id="institution" 
                value={(editedItem as EducationItem).institution} 
                onChange={(e) => handleChange('institution', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="degree">Degree</Label>
              <Input 
                id="degree" 
                value={(editedItem as EducationItem).degree} 
                onChange={(e) => handleChange('degree', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="period">Period</Label>
              <Input 
                id="period" 
                value={(editedItem as EducationItem).period} 
                onChange={(e) => handleChange('period', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={(editedItem as EducationItem).description} 
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Check className="mr-1 h-4 w-4" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{(item as EducationItem).institution}</h4>
                <p className="text-sm text-muted-foreground">{(item as EducationItem).degree}</p>
                <p className="text-xs text-muted-foreground">{(item as EducationItem).period}</p>
              </div>
              <div className="flex space-x-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleEditClick}>
                  <Edit size={14} />
                </Button>
                {onDelete && (
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={handleDelete}>
                    <Trash size={14} />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm mt-2">{(item as EducationItem).description}</p>
          </div>
        );
        
      case 'projects':
        return isEditing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input 
                id="name" 
                value={(editedItem as ProjectItem).name} 
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role" 
                value={(editedItem as ProjectItem).role} 
                onChange={(e) => handleChange('role', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="period">Period</Label>
              <Input 
                id="period" 
                value={(editedItem as ProjectItem).period} 
                onChange={(e) => handleChange('period', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={(editedItem as ProjectItem).description} 
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Check className="mr-1 h-4 w-4" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{(item as ProjectItem).name}</h4>
                <p className="text-sm text-muted-foreground">{(item as ProjectItem).role}</p>
                <p className="text-xs text-muted-foreground">{(item as ProjectItem).period}</p>
              </div>
              <div className="flex space-x-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleEditClick}>
                  <Edit size={14} />
                </Button>
                {onDelete && (
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={handleDelete}>
                    <Trash size={14} />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm mt-2">{(item as ProjectItem).description}</p>
          </div>
        );
        
      case 'certifications':
        return isEditing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Certification Name</Label>
              <Input 
                id="name" 
                value={(editedItem as CertificationItem).name} 
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="issuer">Issuer</Label>
              <Input 
                id="issuer" 
                value={(editedItem as CertificationItem).issuer} 
                onChange={(e) => handleChange('issuer', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                value={(editedItem as CertificationItem).date} 
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={(editedItem as CertificationItem).description} 
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Check className="mr-1 h-4 w-4" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{(item as CertificationItem).name}</h4>
                <p className="text-sm text-muted-foreground">{(item as CertificationItem).issuer}</p>
                <p className="text-xs text-muted-foreground">{(item as CertificationItem).date}</p>
              </div>
              <div className="flex space-x-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleEditClick}>
                  <Edit size={14} />
                </Button>
                {onDelete && (
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={handleDelete}>
                    <Trash size={14} />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm mt-2">{(item as CertificationItem).description}</p>
          </div>
        );
        
      default:
        return <div>Unknown item type</div>;
    }
  };
  
  return (
    <div 
      ref={drag}
      className={`p-3 mb-2 border rounded-md cursor-move ${isDragging ? 'opacity-50' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {renderContent()}
    </div>
  );
}; 