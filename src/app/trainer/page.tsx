"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Send, Loader2, Bot } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrainerMessage } from "@/components/trainer/trainer-message";
import { QuickActions } from "@/components/trainer/quick-actions";
import { PredictionCard } from "@/components/trainer/prediction-card";
import { RiskAlert } from "@/components/trainer/risk-alert";
import { useStats } from "@/lib/queries";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function TrainerPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [dynamicPrompts, setDynamicPrompts] = useState<string[]>([]);
  const [riskAlert, setRiskAlert] = useState<{
    title: string;
    description: string;
    recommendation: string;
    severity: "low" | "medium" | "high";
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stats for PredictionCard display only (context is built server-side)
  const { data: stats } = useStats();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hey! I'm Coach, your AI personal trainer. I can see your training data and help with:\n\n- Program adjustments based on your performance\n- Training decisions (should you train today?)\n- Plateau analysis and solutions\n- Recovery and deload timing\n\nAsk me anything about your training, or tap a quick action below to get started.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || sending) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setSending(true);

      try {
        // Context is built server-side from DB data - just send message + history
        const res = await fetch("/api/ai/trainer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            history: messages
              .filter((m) => m.id !== "welcome")
              .map((m) => ({
                role: m.role,
                content: m.content,
              })),
          }),
        });

        if (!res.ok) throw new Error("Failed");

        const { data } = await res.json();

        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Extract dynamic follow-up prompts
        const prompts: string[] =
          data.followUpPrompts?.length > 0
            ? data.followUpPrompts
            : data.suggestions?.map((s: { description: string }) => s.description).filter(Boolean) || [];
        setDynamicPrompts(prompts);

        // Show risk alert if the AI flagged a risk
        if (data.riskLevel && data.riskLevel !== "none") {
          setRiskAlert({
            title: data.riskLevel === "high" ? "High Risk Detected" : "Training Advisory",
            description: data.message.slice(0, 120) + "...",
            recommendation: data.suggestions?.[0]?.description || "Consider adjusting your training.",
            severity: data.riskLevel as "low" | "medium" | "high",
          });
        }
      } catch {
        setDynamicPrompts([]);
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, I had trouble processing that. Make sure you have an internet connection and try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setSending(false);
      }
    },
    [sending, messages]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Coach</p>
              <p className="text-[10px] text-green-400">Online</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
        {/* Quick actions at top when few messages */}
        {messages.length <= 1 && (
          <div className="space-y-3">
            <QuickActions onSelect={sendMessage} disabled={sending} dynamicActions={dynamicPrompts} />

            {/* Sample prediction card */}
            {stats && stats.currentStreak > 0 && (
              <PredictionCard
                exerciseName="Next Milestone"
                targetWeight={100}
                currentWeight={stats.totalWorkouts || 0}
                currentReps={0}
                currentRPE={0}
                estimatedWeeks={4}
                progressRate={`${stats.currentStreak} day streak`}
              />
            )}
          </div>
        )}

        {/* Risk alert from AI response */}
        {riskAlert && (
          <RiskAlert
            title={riskAlert.title}
            description={riskAlert.description}
            recommendation={riskAlert.recommendation}
            severity={riskAlert.severity}
            onAcknowledge={() => setRiskAlert(null)}
          />
        )}

        {messages.map((msg) => (
          <TrainerMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card rounded-2xl px-4 py-3 border-l-2 border-primary/30">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick actions inline after a few messages */}
        {messages.length > 2 && !sending && (
          <QuickActions onSelect={sendMessage} disabled={sending} dynamicActions={dynamicPrompts} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-3 pb-safe-bottom">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-lg mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask your AI coach..."
            disabled={sending}
            className="flex-1 h-11 bg-card border border-border rounded-full px-4 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-primary/50 disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || sending}
            className="w-11 h-11 rounded-full bg-primary text-black hover:bg-primary/90 disabled:opacity-50 p-0"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
