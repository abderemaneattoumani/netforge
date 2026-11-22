import { Suspense } from "react";

import { AssistantForm } from "@/components/wizard/assistant-form";

export default function AssistantPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-10 rounded-lg border border-outline bg-surface-container p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="text-label-sm font-label uppercase tracking-wider text-accent">
              Assistant de dimensionnement
            </span>

            <h1 className="text-headline-md font-bold text-on-surface">
              Configuration de l’architecture réseau
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {[
            "Réseau global",
            "VLANs & Hôtes",
            "Sécurité & ACLs",
            "Sorties & Matériel",
          ].map((etape, index) => (
            <div key={etape} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-outline bg-surface-container-high text-label-md font-bold text-outline-variant">
                {index + 1}
              </div>

              <div className="hidden sm:block">
                <div className="text-label-sm font-label text-outline-variant">
                  Étape {index + 1}
                </div>

                <div className="truncate text-body-sm text-outline-variant">
                  {etape}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Suspense fallback={null}>
        <AssistantForm />
      </Suspense>
    </main>
  );
}