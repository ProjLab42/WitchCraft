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

interface EducationData {
  degree: string;
  institution: string;
  year: string;
  description: string;
  bulletPoints: BulletPoint[];
}

interface AddEducationDialogProps {
  onAdd: (data: EducationData) => void;
}

export const AddEducationDialog = ({ onAdd }: AddEducationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<EducationData>({
    degree: "",
    institution: "",
    year: "",
    description: "",
    bulletPoints: []
  });

  const handleSubmit = () => {
    if (data.degree.trim() && data.institution.trim()) {
      onAdd(data);
      setData({
        degree: "",
        institution: "",
        year: "",
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
          <PlusCircle className="h-4 w-4 mr-2" /> Add Education
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Education</DialogTitle>
          <DialogDescription>Add a new education entry to your profile</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="degree">Degree</Label>
            <Input 
              id="degree" 
              value={data.degree} 
              onChange={e => setData({...data, degree: e.target.value})}
              placeholder="e.g., M.S. Computer Science"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="institution">Institution</Label>
            <Input 
              id="institution" 
              value={data.institution} 
              onChange={e => setData({...data, institution: e.target.value})}
              placeholder="e.g., Tech University"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input 
              id="year" 
              value={data.year} 
              onChange={e => setData({...data, year: e.target.value})}
              placeholder="e.g., 2018"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={data.description} 
              onChange={e => setData({...data, description: e.target.value})}
              placeholder="Brief description of your education"
            />
          </div>
          
          {/* Bullet Points Editor */}
          <BulletPointsEditor
            bulletPoints={data.bulletPoints}
            onChange={(bulletPoints) => setData({...data, bulletPoints})}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!data.degree.trim() || !data.institution.trim()}>
            Add Education
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 