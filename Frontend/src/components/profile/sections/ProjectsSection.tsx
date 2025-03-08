import { ProfileSection } from "./ProfileSection";
import { AddProjectDialog } from "../dialogs/AddProjectDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink } from "lucide-react";

interface BulletPoint {
  id: string;
  text: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
  bulletPoints?: BulletPoint[];
}

interface ProjectsSectionProps {
  sectionName: string;
  items: Project[];
  onAddItem: (data: any) => void;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

export const ProjectsSection = ({
  sectionName,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem
}: ProjectsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{sectionName}</h3>
        <AddProjectDialog onAdd={onAddItem} />
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4">
          {items.map(item => (
            <ProfileSection
              key={item.id}
              title={
                <div className="flex items-center gap-2">
                  {item.name}
                  {item.link && (
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              }
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
              No projects added yet. Click "Add Project" to get started.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}; 