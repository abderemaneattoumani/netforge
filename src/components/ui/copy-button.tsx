"use client";

import { useState } from "react";

import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  contenu: string;
  libelle: string;
}

export function CopyButton({ contenu, libelle }: CopyButtonProps) {
  const [copie, setCopie] = useState(false);

  async function copierContenu() {
    try {
      await navigator.clipboard.writeText(contenu);

      setCopie(true);

      setTimeout(() => {
        setCopie(false);
      }, 2000);
    } catch {
      setCopie(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copierContenu}
      className="inline-flex items-center gap-1.5 rounded border border-outline bg-surface-container px-3 py-1 text-label-sm font-label text-accent transition-colors hover:border-accent"
    >
      {copie ? (
        <Check className="h-3 w-3" aria-hidden="true" />
      ) : (
        <Copy className="h-3 w-3" aria-hidden="true" />
      )}

      <span>{copie ? "Copié" : libelle}</span>
    </button>
  );
}