import { useState } from "react";
import { ProfileSection } from "./ProfileSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { EditCertificationDialog } from "@/components/profile/dialogs/EditCertificationDialog";

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

interface CertificationsSectionProps {
  sectionName: string;
  items: Certification[];
  onAddItem: (data: Certification) => void;
  onEditItem: (id: string, data: Certification) => void;
  onDeleteItem: (id: string) => void;
}

export const CertificationsSection = ({
  sectionName,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem
}: CertificationsSectionProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = (id: string) => {
    if (id === "new") {
      setEditingCertification(undefined);
      setIsEditing(false);
    } else {
      const certification = items.find(item => item.id === id);
      setEditingCertification(certification);
      setIsEditing(true);
    }
    setDialogOpen(true);
  };

  const handleSaveCertification = (certification: Certification) => {
    if (isEditing) {
      // Update existing certification
      onEditItem(certification.id, certification);
    } else {
      // Add new certification
      onAddItem(certification);
    }
    
    // Reset state
    setDialogOpen(false);
    setEditingCertification(undefined);
    setIsEditing(false);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      // Reset editing state when dialog is closed
      setEditingCertification(undefined);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{sectionName}</h3>
        <Button size="sm" onClick={() => handleEditClick("new")}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Certification
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4">
          {items.map(item => (
            <ProfileSection
              key={item.id}
              title={item.name}
              description={`${item.issuer} • ${item.date}${item.expirationDate ? ` - ${item.expirationDate}` : ''}`}
              onEdit={() => handleEditClick(item.id)}
              onDelete={() => onDeleteItem(item.id)}
            >
              <div className="space-y-2">
                {item.credentialId && (
                  <p className="text-sm">
                    <span className="font-medium">Credential ID:</span> {item.credentialId}
                  </p>
                )}
                {item.bulletPoints && item.bulletPoints.length > 0 && (
                  <ul className="list-disc list-inside space-y-1">
                    {item.bulletPoints.map((point) => (
                      <li key={point.id} className="text-sm">{point.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            </ProfileSection>
          ))}
          
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No certifications added yet. Click "Add Certification" to get started.
            </p>
          )}
        </div>
      </ScrollArea>

      {/* Edit/Create Certification Dialog */}
      <EditCertificationDialog
        key={editingCertification?.id || "new"}
        id="certification-dialog"
        certification={editingCertification}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSave={handleSaveCertification}
      />
    </div>
  );
};