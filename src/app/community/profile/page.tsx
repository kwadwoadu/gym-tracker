"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  // Redirect to settings page where profile settings are now consolidated
  useEffect(() => {
    router.replace("/settings");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
    </div>
  );
}
