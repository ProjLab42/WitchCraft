import { ProfileSection } from "./ProfileSection";
import { AddSkillDialog } from "../dialogs/AddSkillDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Skill {
  id: string;
  name: string;
}

interface SkillsSectionProps {
  sectionName: string;
  items: Skill[];
  onAddItem: (data: any) => void;
  onDeleteItem: (id: string) => void;
}

export const SkillsSection = ({
  sectionName,
  items,
  onAddItem,
  onDeleteItem
}: SkillsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{sectionName}</h3>
        <AddSkillDialog onAdd={onAddItem} />
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {items.map(skill => (
              <Badge key={skill.id} variant="secondary" className="flex items-center gap-1 py-1.5 px-3">
                {skill.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-destructive/20 rounded-full"
                  onClick={() => onDeleteItem(skill.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">
                No skills added yet. Click "Add Skill" to get started.
              </p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}; 