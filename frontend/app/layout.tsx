import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner" 

export const metadata: Metadata = {
  title: "UFW Panel",
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
          "min-h-screen bg-background font-sans antialiased",
        )}
      >
        {children}
        <Toaster richColors /> 
      </body>
    </html>
  );
}
