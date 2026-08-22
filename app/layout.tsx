import type { Metadata } from "next";
import "./globals.css";
import { SpellConfigProvider } from "@/components/SpellConfigContext";
import AppNav from "@/components/AppNav";

export const metadata: Metadata = {
  title: "Spell Calculator",
  description: "Balance calculator for noun/verb spell crafting",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SpellConfigProvider>
          <div className="mx-auto max-w-[1400px] px-6 pt-8">
            <AppNav />
          </div>
          {children}
        </SpellConfigProvider>
      </body>
    </html>
  );
}
