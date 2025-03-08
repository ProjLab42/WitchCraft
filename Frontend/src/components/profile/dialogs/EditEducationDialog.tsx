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

interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  description: string;
  bulletPoints?: BulletPoint[];
  [key: string]: any;
}

interface EditEducationDialogProps {
  id: string;
  education: Education;
  onSave: (education: Education) => void;
}

export const EditEducationDialog = ({ id, education, onSave }: EditEducationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Education>({
    ...education,
    bulletPoints: education.bulletPoints || []
  });

  useEffect(() => {
    setData({
      ...education,
      bulletPoints: education.bulletPoints || []
    });
  }, [education]);

  const handleSubmit = () => {
    onSave({
      ...education,
      ...data
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button id={id} className="hidden"></button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Education</DialogTitle>
          <DialogDescription>Update your education details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-degree">Degree</Label>
            <Input 
              id="edit-degree" 
              value={data.degree} 
              onChange={e => setData({...data, degree: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-institution">Institution</Label>
            <Input 
              id="edit-institution" 
              value={data.institution} 
              onChange={e => setData({...data, institution: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-year">Year</Label>
            <Input 
              id="edit-year" 
              value={data.year} 
              onChange={e => setData({...data, year: e.target.value})}
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