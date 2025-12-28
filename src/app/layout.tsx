import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AutoSyncProvider } from "@/components/sync/auto-sync-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SetFlow - Workout Tracker",
  description: "Track your workouts with progressive overload",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SetFlow",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#CDFF00",
          colorBackground: "#0A0A0A",
          colorText: "#FFFFFF",
          colorTextSecondary: "#A0A0A0",
          colorInputBackground: "#1A1A1A",
          colorInputText: "#FFFFFF",
        },
      }}
    >
      <html lang="en">
        <head>
          <link rel="icon" type="image/png" href="/favicon.png" />
          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </head>
        <body className={`${inter.variable} font-sans antialiased`}>
          <AutoSyncProvider>
            {children}
          </AutoSyncProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
