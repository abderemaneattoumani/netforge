import type { Metadata } from "next";

import { Inter, JetBrains_Mono } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/theme-provider";

import { FooterConditionnel } from "@/components/layout/footer-conditionnel";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NetForge — Générateur de configuration réseau",
  description:
    "Générez un plan d’adressage VLSM, des VLANs, des règles pfSense, des commandes Cisco IOS et une documentation réseau.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <SiteHeader />

          <main className="flex-1">{children}</main>

          <FooterConditionnel>
            <SiteFooter />
          </FooterConditionnel>
        </ThemeProvider>
      </body>
    </html>
  );
}