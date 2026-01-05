# Skill: @dnd-kit with Mobile Touch Support

## Purpose

Implement drag-and-drop that works seamlessly on both desktop (mouse) and mobile (touch), including iOS Safari.

## Dependencies

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

## Key Pattern: Dual Sensors

The critical pattern is configuring both PointerSensor and TouchSensor:

```typescript
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  DragEndEvent,
} from '@dnd-kit/core';

function DraggableContainer() {
  const sensors = useSensors(
    // Mouse/trackpad
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement to start drag
      },
    }),
    // Touch devices
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,      // 200ms long-press to activate
        tolerance: 5,    // 5px finger movement tolerance
      },
    })
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* Draggable items */}
    </DndContext>
  );
}
```

## Draggable Item

```typescript
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

function DraggableCard({ id, data }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data, // Pass any data needed in onDragEnd
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {/* Card content */}
    </div>
  );
}
```

## Droppable Zone

```typescript
import { useDroppable } from '@dnd-kit/core';

function DroppableSlot({ id, children }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'border-2 border-dashed rounded-xl p-4 transition-colors',
        isOver ? 'border-[#CDFF00] bg-[#CDFF00]/10' : 'border-[#2A2A2A]'
      )}
    >
      {children}
    </div>
  );
}
```

## Handle Drag End

```typescript
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;

  if (!over) return; // Dropped outside any droppable

  const draggedData = active.data.current; // Data from draggable
  const dropZoneId = over.id;              // ID of droppable

  // Update your state
  updateSlot(dropZoneId, draggedData);
}
```

## iOS Safari Gotchas

1. **Long-press activation**: Use `delay: 200` for TouchSensor to prevent accidental drags
2. **Touch tolerance**: Use `tolerance: 5` to allow slight finger movement during long-press
3. **No hover states**: Never rely on hover for drag feedback
4. **Touch action**: May need `touch-action: none` on draggable elements

## Complete Example

```typescript
'use client';

import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { useState } from 'react';

export function MealPlanner() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [slots, setSlots] = useState({ breakfast: null, lunch: null });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    setSlots(prev => ({
      ...prev,
      [over.id]: active.data.current,
    }));
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Templates />
      <Slots slots={slots} />

      {/* Optional: Visual feedback during drag */}
      <DragOverlay>
        {activeId ? <DragPreview id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

## Testing Checklist
- [ ] Desktop mouse drag works
- [ ] Mobile long-press activates drag
- [ ] Drop zones highlight on hover/over
- [ ] iOS Safari touch drag works
- [ ] Cancelled drags don't break state
