import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BulletPointsEditor } from "@/components/profile/BulletPointsEditor";

interface BulletPoint {
  id: string;
  text: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expirationDate: string;
  credentialId: string;
  bulletPoints?: BulletPoint[];
}

interface EditCertificationDialogProps {
  id: string;
  certification?: Certification;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (certification: Certification) => void;
}

export function EditCertificationDialog({ 
  id, 
  certification, 
  open, 
  onOpenChange, 
  onSave 
}: EditCertificationDialogProps) {
  const isNew = !certification;
  
  const [formData, setFormData] = useState<Certification>({
    id: "",
    name: "",
    issuer: "",
    date: "",
    expirationDate: "",
    credentialId: "",
    bulletPoints: []
  });

  useEffect(() => {
    if (certification) {
      setFormData({
        ...certification,
        bulletPoints: certification.bulletPoints || []
      });
    } else {
      // Create a new certification with default values
      setFormData({
        id: `cert-${Date.now()}`,
        name: "",
        issuer: "",
        date: "",
        expirationDate: "",
        credentialId: "",
        bulletPoints: []
      });
    }
  }, [certification]);

  useEffect(() => {
    if (!open) {
      // Reset form data when dialog is closed
      setFormData({
        id: "",
        name: "",
        issuer: "",
        date: "",
        expirationDate: "",
        credentialId: "",
        bulletPoints: []
      });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add Certification" : "Edit Certification"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Certification Name</Label>
              <Input 
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., AWS Certified Cloud Practitioner"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="issuer">Issuing Organization</Label>
              <Input 
                id="issuer"
                name="issuer"
                value={formData.issuer}
                onChange={handleChange}
                placeholder="e.g., Amazon Web Services"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Issue Date</Label>
                <Input 
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  placeholder="e.g., March 2023"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expirationDate">Expiration Date (optional)</Label>
                <Input 
                  id="expirationDate"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleChange}
                  placeholder="e.g., March 2026"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="credentialId">Credential ID (optional)</Label>
              <Input 
                id="credentialId"
                name="credentialId"
                value={formData.credentialId}
                onChange={handleChange}
                placeholder="e.g., ABC123XYZ"
              />
            </div>
            
            <BulletPointsEditor
              bulletPoints={formData.bulletPoints}
              onChange={(bulletPoints) => setFormData({...formData, bulletPoints})}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isNew ? "Add Certification" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}