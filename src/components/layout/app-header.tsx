"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Dumbbell, User } from "lucide-react";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AppHeader({ title = "SetFlow", subtitle }: AppHeaderProps) {
  const router = useRouter();
  const { user } = useUser();

  return (
    <header className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push("/settings/profile")}
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center"
        >
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.imageUrl} alt="" className="w-9 h-9 rounded-full" />
          ) : (
            <User className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </header>
  );
}
