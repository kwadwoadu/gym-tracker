import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-[#0A0A0A] text-white`}>
      {children}
    </div>
  );
}
