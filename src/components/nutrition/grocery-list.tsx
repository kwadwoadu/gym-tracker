"use client";

import { useState } from "react";
import { Check, Copy, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GroceryItem {
  name: string;
  quantity: string;
  checked?: boolean;
}

interface GrocerySection {
  name: string;
  items: GroceryItem[];
}

interface GroceryListData {
  sections: GrocerySection[];
  skippedStaples: string[];
  totalEstimatedCost: string;
}

interface GroceryListProps {
  data: GroceryListData;
}

export function GroceryList({ data }: GroceryListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const toggleItem = (sectionName: string, itemName: string) => {
    const key = `${sectionName}-${itemName}`;
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const copyToClipboard = async () => {
    const text = data.sections
      .map(
        (s) =>
          `${s.name}\n${s.items.map((i) => `- ${i.name} - ${i.quantity}`).join("\n")}`
      )
      .join("\n\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalItems = data.sections.reduce(
    (sum, s) => sum + s.items.length,
    0
  );
  const checkedCount = checkedItems.size;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">Grocery List</h3>
        </div>
        <span className="text-xs text-dim-foreground">
          {checkedCount}/{totalItems} items
        </span>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{
            width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%`,
          }}
        />
      </div>

      {/* Sections */}
      {data.sections.map((section) => (
        <div key={section.name}>
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            {section.name}
          </h4>
          <div className="space-y-1">
            {section.items.map((item) => {
              const key = `${section.name}-${item.name}`;
              const isChecked = checkedItems.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleItem(section.name, item.name)}
                  className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg bg-card hover:bg-secondary transition-colors"
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isChecked
                        ? "bg-primary border-primary"
                        : "border-dim-foreground"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 text-black" />}
                  </div>
                  <span
                    className={`text-sm flex-1 text-left transition-colors ${
                      isChecked
                        ? "text-dim-foreground line-through"
                        : "text-white"
                    }`}
                  >
                    {item.name}
                  </span>
                  <span className="text-xs text-dim-foreground">
                    {item.quantity}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Skipped staples */}
      {data.skippedStaples.length > 0 && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-dim-foreground">
            Already in pantry (skipped):{" "}
            {data.skippedStaples.join(", ")}
          </p>
        </div>
      )}

      {/* Cost estimate */}
      {data.totalEstimatedCost && (
        <p className="text-xs text-muted-foreground">
          Est. cost: {data.totalEstimatedCost}
        </p>
      )}

      {/* Copy button */}
      <Button
        onClick={copyToClipboard}
        variant="outline"
        className="w-full h-11 border-border text-white hover:bg-card"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2 text-primary" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy to Clipboard
          </>
        )}
      </Button>
    </div>
  );
}

// Loading state component
export function GroceryListLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Generating grocery list...</p>
    </div>
  );
}
