import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SaveResumeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  currentName?: string; // Optional current name for pre-filling
}

export const SaveResumeDialog: React.FC<SaveResumeDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentName 
}) => {
  const [resumeName, setResumeName] = useState(currentName || '');

  // Update internal state if the currentName prop changes (e.g., loading a different resume)
  useEffect(() => {
    setResumeName(currentName || '');
  }, [currentName]);

  const handleSave = () => {
    if (resumeName.trim()) {
      onSave(resumeName.trim());
      // No need to onClose here, parent component handles it after save completes
    } else {
      // Optional: Show an error if the name is empty
      console.error("Resume name cannot be empty.");
      // Consider adding visual feedback like input border color
    }
  };

  // Handle Enter key press in the input field
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSave();
    }
  };

  // Close dialog on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    } else {
      document.removeEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Resume Project</DialogTitle>
          <DialogDescription>
            Enter a name for this resume project. You can access it later from "My Resumes".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="resume-name" className="text-right">
              Name
            </Label>
            <Input 
              id="resume-name" 
              value={resumeName} 
              onChange={(e) => setResumeName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="col-span-3" 
              placeholder="e.g., Software Engineer Application"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!resumeName.trim()}>Save Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 