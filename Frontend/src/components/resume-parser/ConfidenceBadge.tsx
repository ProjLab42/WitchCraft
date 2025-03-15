import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConfidenceBadgeProps {
  confidence: number;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence }) => {
  // Determine badge variant based on confidence level
  const getVariant = () => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'warning';
    return 'destructive';
  };

  // Format confidence as percentage
  const formattedConfidence = `${Math.round(confidence * 100)}%`;

  // Get appropriate label
  const getLabel = () => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  // Custom variant styles
  const variantStyles = {
    success: 'bg-green-100 text-green-800 hover:bg-green-100',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    destructive: 'bg-red-100 text-red-800 hover:bg-red-100'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`text-xs font-normal ${variantStyles[getVariant()]}`}
          >
            {getLabel()} confidence
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI confidence: {formattedConfidence}</p>
          <p className="text-xs text-muted-foreground">
            This indicates how confident our AI is about the extracted information
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}; 