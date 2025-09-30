import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { fontSans, fontSerif, fontMono } from "@/lib/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Wine Journal",
    template: "%s | Wine Journal",
  },
  description:
    "Capture tasting notes, labels, and AI insights for your wine collection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased text-foreground",
          fontSans.variable,
          fontSerif.variable,
          fontMono.variable,
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
