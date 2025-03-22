import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pageFormat: string;
  onPageFormatChange: (value: string) => void;
  onExportPDF: () => Promise<boolean>;
  onExportDOCX: () => Promise<boolean>;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  pageFormat,
  onPageFormatChange,
  onExportPDF,
  onExportDOCX
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] px-8 py-6 overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">Export Resume</DialogTitle>
          <DialogDescription>
            Choose your preferred page format and export your resume as PDF or DOCX.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 border-y">
          <div className="flex flex-col space-y-2">
            <label htmlFor="page-format" className="text-sm font-medium">
              Page Format
            </label>
            <Select
              value={pageFormat}
              onValueChange={onPageFormatChange}
            >
              <SelectTrigger id="page-format" className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="max-w-[calc(100%-2rem)] z-[60]">
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Letter">Letter</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
            <Button 
              onClick={onExportDOCX} 
              variant="outline" 
              className="w-full sm:w-auto"
            >
              <FileText className="mr-2 h-4 w-4" />
              Export as DOCX
            </Button>
            <Button 
              onClick={onExportPDF}
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 