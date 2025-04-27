import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TemplateCardProps {
  id: string;
  name: string;
  thumbnailSvgContent?: string; // Keep only the SVG content field
  selected: boolean;
  onSelect: (id: string) => void;
}

export function TemplateCard({ 
  id, 
  name, 
  thumbnailSvgContent, 
  selected, 
  onSelect 
}: TemplateCardProps) {
  return (
    <div
      className={cn(
        "template-card cursor-pointer",
        selected && "selected"
      )}
      onClick={() => onSelect(id)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border mb-3">
        {thumbnailSvgContent ? (
          // Render SVG content directly from the database with proper scaling
          <div 
            className="h-full w-full transition-transform duration-300 hover:scale-105 svg-container"
            dangerouslySetInnerHTML={{ __html: thumbnailSvgContent }} 
          />
        ) : (
          // Fallback message if no SVG content is available
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">Template preview unavailable</span>
          </div>
        )}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
            <div className="rounded-full bg-primary p-1.5">
              <Check className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>
      <h3 className="font-medium">{name}</h3>
    </div>
  );
}
