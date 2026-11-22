import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-outline bg-surface py-6 text-body-sm text-outline-variant">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
          NetForge — Générateur de configuration réseau
        </span>

        <div className="flex items-center gap-6">
          <Link href="/a-propos" className="transition-colors hover:text-on-surface">
            Documentation
          </Link>

          <Link href="/a-propos" className="transition-colors hover:text-on-surface">
            À propos &amp; Compétences
          </Link>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-on-surface"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}