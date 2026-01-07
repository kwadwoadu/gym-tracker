# Pattern: @dnd-kit Drag Handle Isolation

> Restrict drag activation to specific element (grip icon) instead of entire card

## When to Use

- Card has clickable content (expand, buttons)
- Need to separate drag from other interactions
- Touch-friendly drag with precise control

## Implementation

```tsx
import { useDraggable } from '@dnd-kit/core';

function DraggableCard({ item }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,  // Key: separate ref for drag trigger
    transform,
    isDragging
  } = useDraggable({
    id: item.id,
    data: { item },
  });

  return (
    <div ref={setNodeRef} style={transform ? { transform: CSS.Translate.toString(transform) } : undefined}>
      {/* Only this button triggers drag */}
      <button
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        onClick={(e) => e.stopPropagation()}  // Prevent click bubbling
        className="touch-none cursor-grab active:cursor-grabbing"
      >
        <GripVertical />
      </button>

      {/* Rest of card - clickable for other actions */}
      <div onClick={handleExpand}>
        {/* Content */}
      </div>
    </div>
  );
}
```

## Key Points

1. **`setActivatorNodeRef`** - Assign to the drag trigger element only
2. **`setNodeRef`** - Still goes on the draggable container
3. **`touch-none`** - Prevents scroll interference on touch
4. **`stopPropagation`** - Prevents click from triggering card actions

## Touch Target Size

Minimum 44x44px for gym/mobile use:
```tsx
className="w-11 h-11 flex items-center justify-center"
// or
className="w-8 h-8 -m-2 p-2"  // Visual 32px, touch 44px
```

## Gotchas

- Without `setActivatorNodeRef`, entire card triggers drag
- Must include `touch-none` for reliable touch drag
- `stopPropagation` needed if card has click handlers

---

*Created: January 7, 2026*
