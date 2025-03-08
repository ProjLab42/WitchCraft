import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { BulletPointsEditor } from "@/components/profile/BulletPointsEditor";

interface BulletPoint {
  id: string;
  text: string;
}

interface ProjectData {
  name: string;
  description: string;
  link: string;
  bulletPoints: BulletPoint[];
}

interface AddProjectDialogProps {
  onAdd: (data: ProjectData) => void;
}

export const AddProjectDialog = ({ onAdd }: AddProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ProjectData>({
    name: "",
    description: "",
    link: "",
    bulletPoints: []
  });

  const handleSubmit = () => {
    if (data.name.trim()) {
      onAdd(data);
      setData({
        name: "",
        description: "",
        link: "",
        bulletPoints: []
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
          <DialogDescription>Add a new project to your profile</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input 
              id="project-name" 
              value={data.name} 
              onChange={e => setData({...data, name: e.target.value})}
              placeholder="e.g., E-commerce Platform"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea 
              id="project-description" 
              value={data.description} 
              onChange={e => setData({...data, description: e.target.value})}
              placeholder="Brief description of your project"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-link">Project Link (Optional)</Label>
            <Input 
              id="project-link" 
              value={data.link} 
              onChange={e => setData({...data, link: e.target.value})}
              placeholder="e.g., https://github.com/username/project"
            />
          </div>
          
          {/* Bullet Points Editor */}
          <BulletPointsEditor
            bulletPoints={data.bulletPoints}
            onChange={(bulletPoints) => setData({...data, bulletPoints})}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!data.name.trim()}>
            Add Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 