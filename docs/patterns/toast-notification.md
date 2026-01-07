# Pattern: Local Toast Notification

> Simple toast feedback without external library

## When to Use

- Quick feedback for user actions
- Success/error states
- No need for toast stacking or complex queuing

## Implementation

```tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error';

interface Toast {
  message: string;
  type: ToastType;
}

function MyComponent() {
  const [toast, setToast] = useState<Toast | null>(null);

  // Auto-dismiss after 2.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  return (
    <>
      {/* Toast UI */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-4 right-4 z-50 p-3 rounded-lg flex items-center gap-3 shadow-lg ${
              toast.type === 'success'
                ? 'bg-[#22C55E] text-white'
                : 'bg-[#EF4444] text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage */}
      <button onClick={() => showToast('Action completed', 'success')}>
        Do something
      </button>
    </>
  );
}
```

## Styling (SetFlow Dark Theme)

| Type | Background | Icon |
|------|------------|------|
| Success | `#22C55E` | CheckCircle |
| Error | `#EF4444` | AlertCircle |
| Warning | `#F59E0B` | AlertTriangle |

## Customization

- **Duration**: Adjust timeout (2500ms default)
- **Position**: Change `top-4` to `bottom-4` for bottom toast
- **Animation**: Modify framer-motion variants

## When NOT to Use

- Need toast stacking (use sonner or react-hot-toast)
- Need persistent/dismissible toasts
- Need action buttons in toast

---

*Created: January 7, 2026*
