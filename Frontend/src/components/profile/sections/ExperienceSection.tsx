import { useState } from "react";
import { ProfileSection } from "./ProfileSection";
import { AddExperienceDialog } from "../dialogs/AddExperienceDialog";
import { EditExperienceDialog } from "../dialogs/EditExperienceDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useRef } from "react";

interface BulletPoint {
  id: string;
  text: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  bulletPoints?: BulletPoint[];
}

interface ExperienceSectionProps {
  sectionName: string;
  items: Experience[];
  onAddItem: (data: any) => void;
  onEditItem: (id: string, updatedItem: Experience) => void;
  onDeleteItem: (id: string) => void;
}

export const ExperienceSection = ({
  sectionName,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem
}: ExperienceSectionProps) => {
  const [editingItem, setEditingItem] = useState<Experience | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEditClick = (item: Experience) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingItem(undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{sectionName}</h3>
        <AddExperienceDialog onAdd={onAddItem} />
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4">
          {items.map(item => (
            <ProfileSection
              key={item.id}
              title={item.title}
              description={`${item.company} • ${item.period}`}
              onEdit={() => handleEditClick(item)}
              onDelete={() => onDeleteItem(item.id)}
            >
              <div className="space-y-2">
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
                {item.bulletPoints && item.bulletPoints.length > 0 && (
                  <ul className="list-disc list-inside space-y-1">
                    {item.bulletPoints.map((point) => (
                      <li key={point.id} className="text-sm">{point.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            </ProfileSection>
          ))}
          
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No experience added yet. Click "Add Experience" to get started.
            </p>
          )}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      {editingItem && (
        <EditExperienceDialog
          id={`edit-experience-${editingItem.id}`}
          experience={editingItem}
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          onSave={(updatedExperience) => {
            onEditItem(updatedExperience.id, updatedExperience);
          }}
        />
      )}
    </div>
  );
}; 