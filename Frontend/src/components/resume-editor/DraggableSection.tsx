import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface DraggableSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  toggleOpen: () => void;
}

export const DraggableSection: React.FC<DraggableSectionProps> = ({ 
  title, 
  children, 
  isOpen, 
  toggleOpen 
}) => {
  return (
    <div className="mb-6 border rounded-md overflow-hidden">
      <div 
        className="p-3 bg-muted/50 flex justify-between items-center cursor-pointer"
        onClick={toggleOpen}
      >
        <h3 className="font-semibold">{title}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>
      
      <div className={`p-3 ${isOpen ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
}; 