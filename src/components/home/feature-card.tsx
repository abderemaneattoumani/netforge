import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  numero: string;
  titre: string;
  description: string;
  exemple: string;
  icone: LucideIcon;
  couleurIcone: string;
}

export function FeatureCard({
  numero,
  titre,
  description,
  exemple,
  icone: Icone,
  couleurIcone,
}: FeatureCardProps) {
  return (
    <article className="flex flex-col justify-between rounded-lg border border-outline bg-surface-container p-6 transition-colors hover:border-outline-variant">
      <div>
        <div
          className={`mb-5 flex h-12 w-12 items-center justify-center rounded border border-outline bg-surface-container-low ${couleurIcone}`}
        >
          <Icone className="h-5 w-5" aria-hidden="true" />
        </div>

        <h3 className="mb-2 text-headline-sm font-semibold text-on-surface">
          {numero}. {titre}
        </h3>

        <p className="mb-4 text-body-md text-outline-variant">{description}</p>
      </div>

      <div className="border-t border-outline pt-4 font-mono text-code-sm text-outline-variant">
        {exemple}
      </div>
    </article>
  );
}