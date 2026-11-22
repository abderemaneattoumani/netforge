"use client";

import { useRouter } from "next/navigation";

import { Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useState } from "react";

const promptParDefaut =
  "3 VLANs (50 postes Utilisateurs, 1 Serveur, 1 DMZ), réseau 192.168.0.0/16";

export function QuickPromptForm() {
  const router = useRouter();
  const [prompt, setPrompt] = useState(promptParDefaut);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const promptNettoye = prompt.trim();

    if (promptNettoye.length === 0) {
      return;
    }

    const parametres = new URLSearchParams({
      prompt: promptNettoye,
    });

    router.push(`/outil?${parametres.toString()}`);
  }

  return (
    <div className="mx-auto mb-6 max-w-3xl">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-stretch gap-3 rounded-lg border border-outline bg-surface-container p-2.5 shadow-2xl transition-colors focus-within:border-accent sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center gap-3 px-3 py-1.5">
          <Sparkles
            className="h-4 w-4 shrink-0 text-accent"
            aria-hidden="true"
          />

          <input
            type="text"
            name="quickPrompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ex. 3 VLANs, 50 postes, 1 serveur, 1 DMZ..."
            className="w-full border-0 bg-transparent font-mono text-body-md text-on-surface outline-none placeholder:text-outline-variant"
          />
        </div>

        <Button type="submit">
          <Zap className="h-4 w-4" aria-hidden="true" />
          <span>Générer</span>
        </Button>
      </form>

      <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
        <a
          href="/outil"
          className="inline-flex items-center gap-1.5 text-label-md font-label text-accent hover:underline"
        >
          Utiliser le formulaire détaillé étape par étape
        </a>

        <span className="text-outline-variant">•</span>

        <span className="font-mono text-body-sm text-outline-variant">
          Modèle pré-chargé : RFC 1918 /16
        </span>
      </div>
    </div>
  );
}