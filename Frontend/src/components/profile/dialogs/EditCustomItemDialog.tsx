import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BulletPointsEditor } from "@/components/profile/BulletPointsEditor";

interface BulletPoint {
  id: string;
  text: string;
}

interface CustomItem {
  id: string;
  title: string;
  description: string;
  bulletPoints: BulletPoint[];
}

interface EditCustomItemDialogProps {
  id: string;
  item?: CustomItem;
  sectionName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: CustomItem) => void;
}

export function EditCustomItemDialog({
  id,
  item,
  sectionName,
  open,
  onOpenChange,
  onSave
}: EditCustomItemDialogProps) {
  const isNew = !item;

  const [formData, setFormData] = useState<CustomItem>({
    id: "",
    title: "",
    description: "",
    bulletPoints: []
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        id: `custom-${Date.now()}`,
        title: "",
        description: "",
        bulletPoints: []
      });
    }
  }, [item]);

  useEffect(() => {
    if (!open) {
      // Reset form data when dialog is closed
      setFormData({
        id: "",
        title: "",
        description: "",
        bulletPoints: []
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add Item" : "Edit Item"}</DialogTitle>
          <DialogDescription>{isNew ? `Add a new item to ${sectionName}` : `Edit item in ${sectionName}`}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>

            <div className="space-y-2">
              <Label>Bullet Points</Label>
              <BulletPointsEditor
                bulletPoints={formData.bulletPoints}
                onChange={(bulletPoints) => setFormData({ ...formData, bulletPoints })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isNew ? "Add Item" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 