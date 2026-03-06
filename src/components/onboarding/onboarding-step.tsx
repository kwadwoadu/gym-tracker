"use client";

import { HEADING, LABEL } from "@/lib/typography";

interface OnboardingStepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function OnboardingStep({ title, subtitle, children }: OnboardingStepProps) {
  return (
    <div className="flex flex-col h-full px-6 py-8">
      <div className="mb-8">
        <h1 className={`${HEADING.h2} text-foreground mb-2`}>{title}</h1>
        {subtitle && (
          <p className={`${LABEL.subtitle} text-muted-foreground`}>{subtitle}</p>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
