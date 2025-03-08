import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";

interface SkillData {
  name: string;
}

interface AddSkillDialogProps {
  onAdd: (data: SkillData) => void;
}

export const AddSkillDialog = ({ onAdd }: AddSkillDialogProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<SkillData>({
    name: ""
  });

  const handleSubmit = () => {
    if (data.name.trim()) {
      onAdd(data);
      setData({ name: "" });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Skill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Skill</DialogTitle>
          <DialogDescription>Add a new skill to your profile</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="skill-name">Skill Name</Label>
            <Input 
              id="skill-name" 
              value={data.name} 
              onChange={e => setData({...data, name: e.target.value})}
              placeholder="e.g., React, TypeScript, Node.js"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!data.name.trim()}>
            Add Skill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 