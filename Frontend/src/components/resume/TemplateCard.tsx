
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TemplateCardProps {
  id: string;
  name: string;
  imageSrc: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function TemplateCard({ id, name, imageSrc, selected, onSelect }: TemplateCardProps) {
  return (
    <div
      className={cn(
        "template-card cursor-pointer",
        selected && "selected"
      )}
      onClick={() => onSelect(id)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border mb-3">
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full object-cover object-top transition-transform duration-300 hover:scale-105"
        />
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
