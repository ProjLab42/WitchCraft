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

interface Project {
  id: string;
  name: string;
  description: string;
  link?: string;
  bulletPoints?: BulletPoint[];
  [key: string]: any;
}

interface EditProjectDialogProps {
  id: string;
  project: Project;
  onSave: (project: Project) => void;
}

export const EditProjectDialog = ({ id, project, onSave }: EditProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Project>({
    ...project,
    bulletPoints: project.bulletPoints || []
  });

  useEffect(() => {
    setData({
      ...project,
      bulletPoints: project.bulletPoints || []
    });
  }, [project]);

  const handleSubmit = () => {
    onSave({
      ...project,
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
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update your project details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-project-name">Project Name</Label>
            <Input 
              id="edit-project-name" 
              value={data.name} 
              onChange={e => setData({...data, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-project-description">Description</Label>
            <Textarea 
              id="edit-project-description" 
              value={data.description} 
              onChange={e => setData({...data, description: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-project-link">Project Link (Optional)</Label>
            <Input 
              id="edit-project-link" 
              value={data.link || ""} 
              onChange={e => setData({...data, link: e.target.value})}
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