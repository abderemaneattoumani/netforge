"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { Network, Zap } from "lucide-react";

import { lireBrouillon } from "@/lib/storage/brouillon";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navigation = [
  { libelle: "Accueil", href: "/" },
  { libelle: "Assistant", href: "/outil" },
  { libelle: "Tableau de Bord", href: "/outil/resultats" },
  { libelle: "Topologie Réseau", href: "/diagramme" },
  { libelle: "À propos", href: "/a-propos" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [configurationPresente, setConfigurationPresente] = useState(false);

  useEffect(() => {
    setConfigurationPresente(lireBrouillon() !== null);
  }, [pathname]);

  function obtenirHref(chemin: string): string {
    if (!configurationPresente) {
      return chemin;
    }

    if (chemin === "/outil/resultats" || chemin === "/diagramme") {
      return `${chemin}?config=draft`;
    }

    return chemin;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-outline bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-outline bg-surface-container-high transition-colors group-hover:border-accent">
              <Network className="h-4 w-4 text-accent" aria-hidden="true" />
            </div>

            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-headline-sm font-bold leading-tight text-on-surface">
                NetForge

                <Badge variant="accent" className="font-mono">
                  v1.0
                </Badge>
              </span>

              <span className="font-mono text-label-xs leading-none text-outline-variant">
                CLI &amp; Firewall Generator
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((lien) => {
              const actif = pathname === lien.href;

              return (
                <Link
                  key={lien.href}
                  href={obtenirHref(lien.href)}
                  className={`rounded px-3 py-1.5 text-label-md font-label transition-colors ${
                    actif
                      ? "border border-outline bg-surface-container-high text-accent"
                      : "text-outline-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  {lien.libelle}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Button href="/outil">
            <span>Essayer l’outil</span>
            <Zap className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}