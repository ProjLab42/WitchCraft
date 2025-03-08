import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Resume</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="page-format" className="text-right col-span-1">
              Page Format
            </label>
            <Select
              value={pageFormat}
              onValueChange={onPageFormatChange}
            >
              <SelectTrigger className="col-span-3" id="page-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Letter">Letter</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button onClick={onExportDOCX} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export as DOCX
            </Button>
            <Button onClick={onExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 