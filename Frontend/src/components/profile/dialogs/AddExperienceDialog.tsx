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

interface ExperienceData {
  title: string;
  company: string;
  period: string;
  description: string;
  bulletPoints: BulletPoint[];
}

interface AddExperienceDialogProps {
  onAdd: (data: ExperienceData) => void;
}

export const AddExperienceDialog = ({ onAdd }: AddExperienceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ExperienceData>({
    title: "",
    company: "",
    period: "",
    description: "",
    bulletPoints: []
  });

  const handleSubmit = () => {
    if (data.title.trim() && data.company.trim()) {
      onAdd(data);
      setData({
        title: "",
        company: "",
        period: "",
        description: "",
        bulletPoints: []
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Experience
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Experience</DialogTitle>
          <DialogDescription>Add a new work experience to your profile</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input 
              id="title" 
              value={data.title} 
              onChange={e => setData({...data, title: e.target.value})}
              placeholder="e.g., Senior Developer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input 
              id="company" 
              value={data.company} 
              onChange={e => setData({...data, company: e.target.value})}
              placeholder="e.g., Tech Solutions Inc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Input 
              id="period" 
              value={data.period} 
              onChange={e => setData({...data, period: e.target.value})}
              placeholder="e.g., 2021 - Present"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={data.description} 
              onChange={e => setData({...data, description: e.target.value})}
              placeholder="Brief description of your role and responsibilities"
            />
          </div>
          
          {/* Bullet Points Editor */}
          <BulletPointsEditor
            bulletPoints={data.bulletPoints}
            onChange={(bulletPoints) => setData({...data, bulletPoints})}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!data.title.trim() || !data.company.trim()}>
            Add Experience
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 