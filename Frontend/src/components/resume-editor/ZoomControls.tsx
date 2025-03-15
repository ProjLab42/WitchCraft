import React from 'react';
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onZoomOut}
        disabled={zoomLevel <= 0.5}
        title="Zoom Out"
      >
        <ZoomOut size={16} />
      </Button>
      
      <span className="text-sm font-medium">
        {Math.round(zoomLevel * 100)}%
      </span>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onZoomIn}
        disabled={zoomLevel >= 2}
        title="Zoom In"
      >
        <ZoomIn size={16} />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onResetZoom}
        disabled={zoomLevel === 1}
        title="Reset Zoom"
      >
        <Maximize size={16} />
      </Button>
    </div>
  );
}; 