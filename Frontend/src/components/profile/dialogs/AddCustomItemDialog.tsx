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

interface CustomItemData {
  title: string;
  description: string;
  bulletPoints: BulletPoint[];
}

interface AddCustomItemDialogProps {
  sectionName: string;
  onAdd: (data: CustomItemData) => void;
}

export const AddCustomItemDialog = ({ sectionName, onAdd }: AddCustomItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<CustomItemData>({
    title: "",
    description: "",
    bulletPoints: []
  });

  const handleSubmit = () => {
    if (data.title.trim()) {  // Ensure at least the title is provided
      onAdd(data);
      setData({ title: "", description: "", bulletPoints: [] });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Item to {sectionName}</DialogTitle>
          <DialogDescription>Add a new item to the {sectionName} section</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={data.title} 
              onChange={e => setData({...data, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
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
          <Button onClick={handleSubmit} disabled={!data.title.trim()}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 