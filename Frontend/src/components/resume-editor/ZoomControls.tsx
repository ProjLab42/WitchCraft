import React from 'react';
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize, Shrink, LayoutGrid } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  autoScalingEnabled: boolean;
  onToggleAutoScaling: (enabled: boolean) => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  autoScalingEnabled,
  onToggleAutoScaling
}) => {
  return (
    <div className="flex items-center justify-between w-full mb-4">
      <div className="flex items-center gap-2">
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
      
      <div className="flex items-center space-x-2">
        <Switch
          id="auto-scaling"
          checked={autoScalingEnabled}
          onCheckedChange={onToggleAutoScaling}
        />
        <Label htmlFor="auto-scaling" className="text-sm cursor-pointer">
          Auto-fit Content
        </Label>
        <div className="text-xs text-muted-foreground ml-2 mr-2 hidden sm:block">
          (Adjusts font sizes to fit content on page)
        </div>
      </div>
    </div>
  );
}; 