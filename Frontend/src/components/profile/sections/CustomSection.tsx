import { useState } from "react";
import { ProfileSection } from "./ProfileSection";
import { AddCustomItemDialog } from "../dialogs/AddCustomItemDialog";
import { EditCustomItemDialog } from "../dialogs/EditCustomItemDialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BulletPoint {
  id: string;
  text: string;
}

interface CustomItem {
  id: string;
  title: string;
  description: string;
  bulletPoints: BulletPoint[];
}

interface CustomSectionProps {
  sectionKey: string;
  sectionName: string;
  items: CustomItem[];
  onAddItem: (data: CustomItem) => void;
  onEditItem: (id: string, data: CustomItem) => void;
  onDeleteItem: (id: string) => void;
}

export const CustomSection = ({
  sectionKey,
  sectionName,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem
}: CustomSectionProps) => {
  const [editingItem, setEditingItem] = useState<CustomItem | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEditClick = (item: CustomItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingItem(undefined);
    }
  };

  // Helper function to format section names for display
  const formatSectionName = (key: string) => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{formatSectionName(sectionName)}</h3>
        <AddCustomItemDialog 
          sectionName={formatSectionName(sectionName)} 
          onAdd={onAddItem} 
        />
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4">
          {items.map(item => (
            <ProfileSection
              key={item.id}
              title={item.title}
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
              No items added yet. Click "Add Item" to get started.
            </p>
          )}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <EditCustomItemDialog
        id={`edit-${sectionKey}-${editingItem?.id || 'new'}`}
        item={editingItem}
        sectionName={formatSectionName(sectionName)}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSave={(item) => {
          if (editingItem) {
            onEditItem(item.id, item);
          } else {
            onAddItem(item);
          }
        }}
      />
    </div>
  );
}; 