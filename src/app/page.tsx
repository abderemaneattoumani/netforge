import {
  Calculator,
  ShieldCheck,
  Terminal,
} from "lucide-react";

import { ConfigPreview } from "@/components/home/config-preview";
import { FeatureCard } from "@/components/home/feature-card";
import { QuickPromptForm } from "@/components/home/quick-prompt-form";

const fonctionnalites = [
  {
    numero: "1",
    titre: "Plan d’Adressage VLSM",
    description:
      "Calcul automatique sans gaspillage d’adresses. Découpage hiérarchique avec plages DHCP dédiées, adresses de passerelle, de diffusion et détection des conflits de sous-réseaux.",
    exemple: "Exemple : 192.168.10.0/26 (62 hôtes)",
    icone: Calculator,
    couleurIcone: "text-accent",
  },
  {
    numero: "2",
    titre: "Sécurité & Pare-Feu pfSense",
    description:
      "Matrice de flux inter-VLAN, règles d’isolation stricte pour la DMZ et les invités, politique de refus par défaut (Default Deny), blocage RFC 1918 et filtrage par port/protocole.",
    exemple: "Règles Pass/Block prêtes à injecter",
    icone: ShieldCheck,
    couleurIcone: "text-emerald-400",
  },
  {
    numero: "3",
    titre: "Automatisation CLI & Doc",
    description:
      "Commandes Cisco IOS complètes (802.1Q trunk, SVI, Port Security, SSH v2), script PowerShell pour serveurs Windows DHCP/DNS et documentation technique exportable.",
    exemple: "Sorties : Cisco, pfSense, .ps1, PDF, MD",
    icone: Terminal,
    couleurIcone: "text-cyan-300",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-outline bg-gradient-to-b from-surface via-surface-container-low to-surface pb-20 pt-16">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#232D38_1px,transparent_1px),linear-gradient(to_bottom,#232D38_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-outline bg-surface-container px-3 py-1 text-label-sm font-label text-outline-variant">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            <span>
              Générateur automatisé de configurations réseau d’infrastructure
            </span>
          </div>

          <h1 className="mx-auto mb-6 max-w-4xl text-display-lg font-bold tracking-tight text-on-surface">
            De votre schéma logique aux scripts de déploiement en quelques {" "}
            <span className="text-accent underline decoration-accent/40 underline-offset-8">
              secondes
            </span>
            .
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-body-lg text-outline-variant">
            Décrivez vos besoins en langage naturel ou personnalisez vos VLANs :
            NetForge calcule l’adressage VLSM, génère les scripts Cisco IOS, les
            règles de pare-feu pfSense, le DHCP PowerShell et toute la
            documentation.
          </p>

          <QuickPromptForm />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-headline-lg font-bold text-on-surface">
            Ce que l’outil génère
          </h2>

          <p className="mx-auto max-w-xl text-body-md text-outline-variant">
            Zéro saisie manuelle de masques ou de listes de contrôle d’accès :
            chaque artéfact respecte les normes de sécurité CIS et ANSSI.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {fonctionnalites.map((fonctionnalite) => (
            <FeatureCard
              key={fonctionnalite.numero}
              numero={fonctionnalite.numero}
              titre={fonctionnalite.titre}
              description={fonctionnalite.description}
              exemple={fonctionnalite.exemple}
              icone={fonctionnalite.icone}
              couleurIcone={fonctionnalite.couleurIcone}
            />
          ))}
        </div>
      </section>

      <ConfigPreview />
    </>
  );
}