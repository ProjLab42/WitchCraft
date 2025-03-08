import { ProfileSection } from "./ProfileSection";
import { AddEducationDialog } from "../dialogs/AddEducationDialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BulletPoint {
  id: string;
  text: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  description: string;
  bulletPoints?: BulletPoint[];
}

interface EducationSectionProps {
  sectionName: string;
  items: Education[];
  onAddItem: (data: any) => void;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

export const EducationSection = ({
  sectionName,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem
}: EducationSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{sectionName}</h3>
        <AddEducationDialog onAdd={onAddItem} />
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4">
          {items.map(item => (
            <ProfileSection
              key={item.id}
              title={item.degree}
              description={`${item.institution} • ${item.year}`}
              onEdit={() => onEditItem(item.id)}
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
              No education added yet. Click "Add Education" to get started.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}; 