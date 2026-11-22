import Link from "next/link";

import {
  Network,
  ShieldCheck,
  Terminal,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

const competences = [
  {
    titre: "Adressage IPv4 & Algorithme VLSM",
    description:
      "Calcul des masques de sous-réseaux à longueur variable, optimisation de l’espace d’adressage RFC 1918 et détection des chevauchements.",
    couleur: "text-accent",
  },
  {
    titre: "VLANs & Routage inter-VLAN",
    description:
      "Segmentation 802.1Q, trunks, interfaces virtuelles SVI et VLAN natif de parc pour le durcissement du réseau.",
    couleur: "text-emerald-400",
  },
  {
    titre: "Sécurité & durcissement",
    description:
      "Politique de refus par défaut, isolation de la DMZ, Port Security, BPDU Guard, SSH v2 et désactivation des ports inutilisés.",
    couleur: "text-amber-400",
  },
  {
    titre: "Automatisation & documentation",
    description:
      "Génération de configurations Cisco IOS, règles pfSense, scripts PowerShell DHCP/DNS et documentation technique exportable.",
    couleur: "text-cyan-300",
  },
];

export default function AProposPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12">
      <div>
        <Badge variant="accent" className="mb-4 font-mono">
          Projet d'ingénierie systèmes &amp; réseaux
        </Badge>

        <h1 className="mb-4 text-display-lg font-bold text-on-surface">
          À Propos de NetForge
        </h1>

        <p className="max-w-3xl text-body-lg leading-relaxed text-outline-variant">
          NetForge a été conçu pour automatiser les tâches chronophages et
          sujettes à l’erreur humaine lors des phases de dimensionnement et de
          déploiement d’architectures réseau locales et hybrides.
        </p>
      </div>

      <div className="flex items-start gap-4 rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/20 p-5">
        <TriangleAlert
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
          aria-hidden="true"
        />

        <div className="text-body-md text-on-surface">
          <h2 className="mb-1 text-headline-sm font-bold text-amber-800 dark:text-amber-300">
            Avertissement d’exploitation : environnement de laboratoire requis
          </h2>

          <p className="leading-relaxed text-amber-900 dark:text-amber-200">
            Toujours tester et valider les configurations générées dans un
            laboratoire isolé, tel que GNS3, Cisco Packet Tracer ou une maquette
            physique, avant toute injection sur des équipements de production.
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-6 flex items-center gap-2 text-headline-md font-bold text-on-surface">
          <Network className="h-5 w-5 text-accent" aria-hidden="true" />
          Compétences techniques démontrées
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {competences.map((competence) => (
            <div
              key={competence.titre}
              className="rounded-lg border border-outline bg-surface-container p-6"
            >
              <h3
                className={`mb-3 text-headline-sm font-bold ${competence.couleur}`}
              >
                {competence.titre}
              </h3>

              <p className="text-body-md text-outline-variant">
                {competence.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 flex items-center gap-2 text-headline-md font-bold text-on-surface">
          <Terminal className="h-5 w-5 text-accent" aria-hidden="true" />
          Stack technologique &amp; architecture
        </h2>

        <div className="rounded-lg border border-outline bg-surface-container p-6">
          <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
            <div className="rounded border border-outline bg-surface-container-low p-4">
              <div className="text-headline-sm font-bold text-on-surface">
                Next.js
              </div>

              <div className="mt-1 text-label-sm font-label text-outline-variant">
                App Router
              </div>
            </div>

            <div className="rounded border border-outline bg-surface-container-low p-4">
              <div className="text-headline-sm font-bold text-accent">
                TypeScript
              </div>

              <div className="mt-1 text-label-sm font-label text-outline-variant">
                Typage strict
              </div>
            </div>

            <div className="rounded border border-outline bg-surface-container-low p-4">
              <div className="text-headline-sm font-bold text-on-surface">
                Tailwind CSS
              </div>

              <div className="mt-1 text-label-sm font-label text-outline-variant">
                Design system
              </div>
            </div>

            <div className="rounded border border-outline bg-surface-container-low p-4">
              <div className="text-headline-sm font-bold text-emerald-400">
                Cisco / pfSense
              </div>

              <div className="mt-1 text-label-sm font-label text-outline-variant">
                Générateurs de configuration
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center justify-between gap-6 rounded-lg border border-outline bg-gradient-to-r from-surface-container-low to-surface-container p-8 sm:flex-row">
        <div>
          <h2 className="mb-2 flex items-center gap-2 text-headline-md font-bold text-on-surface">
            <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
            Explorer le code source
          </h2>

          <p className="text-body-md text-outline-variant">
            Le projet est conçu comme un portfolio open-source : les modules
            d’adressage, de validation et de génération de configuration peuvent
            être audités et améliorés.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/outil"
            className="inline-flex items-center justify-center rounded bg-accent px-5 py-3 text-label-md font-bold text-on-accent shadow-lg transition-colors hover:bg-cyan-300"
          >
            Essayer l’outil
          </Link>
        </div>
      </section>
    </main>
  );
}