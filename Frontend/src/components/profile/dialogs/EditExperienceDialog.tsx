import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BulletPointsEditor } from "@/components/profile/BulletPointsEditor";

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
  [key: string]: any;
}

interface EditExperienceDialogProps {
  id: string;
  experience?: Experience;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (experience: Experience) => void;
}

export const EditExperienceDialog = ({ id, experience, open, onOpenChange, onSave }: EditExperienceDialogProps) => {
  const [data, setData] = useState<Experience>({
    ...experience,
    bulletPoints: experience.bulletPoints || []
  });

  useEffect(() => {
    setData({
      ...experience,
      bulletPoints: experience.bulletPoints || []
    });
  }, [experience]);

  const handleSubmit = () => {
    onSave({
      ...experience,
      ...data
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button id={id} className="hidden"></button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Experience</DialogTitle>
          <DialogDescription>Update your work experience details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Job Title</Label>
            <Input 
              id="edit-title" 
              value={data.title} 
              onChange={e => setData({...data, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-company">Company</Label>
            <Input 
              id="edit-company" 
              value={data.company} 
              onChange={e => setData({...data, company: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-period">Period</Label>
            <Input 
              id="edit-period" 
              value={data.period} 
              onChange={e => setData({...data, period: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea 
              id="edit-description" 
              value={data.description} 
              onChange={e => setData({...data, description: e.target.value})}
            />
          </div>
          
          {/* Bullet Points Editor */}
          <BulletPointsEditor
            bulletPoints={data.bulletPoints}
            onChange={(bulletPoints) => setData({...data, bulletPoints})}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 