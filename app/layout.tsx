import type { Metadata } from "next";
import "./globals.css";
import AppProvider from "@/providers/app-provider";

export const metadata: Metadata = {
  title: "CafeOS",
  description: "The Operating System for Modern Restaurants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
    
  );
}
