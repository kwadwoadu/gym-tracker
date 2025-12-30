"use client";

interface OnboardingStepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function OnboardingStep({ title, subtitle, children }: OnboardingStepProps) {
  return (
    <div className="flex flex-col h-full px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        {subtitle && (
          <p className="text-white/60 text-base">{subtitle}</p>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
