import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddSectionDialogProps {
  onAdd: (sectionName: string) => void;
}

export const AddSectionDialog = ({ onAdd }: AddSectionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [sectionName, setSectionName] = useState("");

  const handleSubmit = () => {
    if (sectionName.trim()) {
      onAdd(sectionName);
      setSectionName("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add New Section
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Section</DialogTitle>
          <DialogDescription>Add a custom section to your profile</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sectionName">Section Name</Label>
            <Input 
              id="sectionName" 
              value={sectionName} 
              onChange={e => setSectionName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add Section</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 