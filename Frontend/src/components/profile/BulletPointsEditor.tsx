import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GripVertical, X, Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface BulletPoint {
  id: string;
  text: string;
}

interface BulletPointsEditorProps {
  bulletPoints?: BulletPoint[];
  onChange: (points: BulletPoint[]) => void;
}

// BulletPointsEditor component
export const BulletPointsEditor = ({ bulletPoints = [], onChange }: BulletPointsEditorProps) => {
    const [points, setPoints] = useState(bulletPoints);
    const [newPoint, setNewPoint] = useState("");
  
    useEffect(() => {
      setPoints(bulletPoints);
    }, [bulletPoints]);
  
    const addPoint = () => {
      if (newPoint.trim()) {
        const newPoints = [
          ...points,
          { id: `bp-${Date.now()}`, text: newPoint }
        ];
        setPoints(newPoints);
        onChange(newPoints);
        setNewPoint("");
      }
    };
  
    const removePoint = (id) => {
      const newPoints = points.filter(p => p.id !== id);
      setPoints(newPoints);
      onChange(newPoints);
    };
  
    const updatePoint = (id, text) => {
      const newPoints = points.map(p => 
        p.id === id ? { ...p, text } : p
      );
      setPoints(newPoints);
      onChange(newPoints);
    };
  
    const handleDragEnd = (result) => {
      if (!result.destination) return;
  
      const reordered = Array.from(points);
      const [removed] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, removed);
  
      setPoints(reordered);
      onChange(reordered);
    };
  
    return (
      <div className="space-y-3">
        <Label>Bullet Points</Label>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="bullet-points">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {points.map((point, index) => (
                  <Draggable key={point.id} draggableId={point.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center gap-2"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-move text-muted-foreground"
                        >
                          <GripVertical size={16} />
                        </div>
                        <Input 
                          value={point.text}
                          onChange={(e) => updatePoint(point.id, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removePoint(point.id)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
  
        <div className="flex gap-2">
          <Input
            placeholder="Add a bullet point"
            value={newPoint}
            onChange={(e) => setNewPoint(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addPoint();
              }
            }}
            className="flex-1"
          />
          <Button type="button" onClick={addPoint}>
            <Plus size={16} />
          </Button>
        </div>
      </div>
    );
  };