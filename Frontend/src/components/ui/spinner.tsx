import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export function Spinner({
  size = "md",
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      aria-label="Loading"
      {...props}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
    </div>
  );
} 