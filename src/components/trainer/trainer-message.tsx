"use client";

import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";

interface TrainerMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export function TrainerMessage({ role, content, timestamp }: TrainerMessageProps) {
  const isAI = role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isAI ? "bg-primary/20" : "bg-secondary"
        }`}
      >
        {isAI ? (
          <Bot className="w-4 h-4 text-primary" />
        ) : (
          <User className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isAI
            ? "bg-card border-l-2 border-primary/30"
            : "bg-secondary"
        }`}
      >
        {isAI ? (
          <MarkdownRenderer content={content} />
        ) : (
          <div className="text-sm text-white whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        )}
        {timestamp && (
          <p className="text-[10px] text-dim-foreground mt-1.5">
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
}
