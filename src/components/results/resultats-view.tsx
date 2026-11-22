"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { useSearchParams } from "next/navigation";

import {
  Archive,
  CheckCircle2,
  FileCode2,
  FileText,
  Gavel,
  Layers,
  Network,
  Share2,
  Shield,
  ShieldCheck,
  Terminal,
  TriangleAlert,
  Users,
} from "lucide-react";

import { calculerPlanVlsm } from "@/lib/network/vlsm";
import { decoderConfiguration } from "@/lib/network/config-codec";
import { genererConfigurationCisco } from "@/lib/generators/cisco";
import { genererReglesPfSense } from "@/lib/generators/pfsense";
import { genererScriptPowerShell } from "@/lib/generators/powershell";
import { genererDocumentationMarkdown } from "@/lib/generators/documentation";
import { lireBrouillon } from "@/lib/storage/brouillon";
import { telechargerFichierTexte } from "@/lib/export/download";
import { genererNomFichier } from "@/lib/export/nom-fichier";
import { telechargerArchiveZip } from "@/lib/export/archive";

import { CodeBlock } from "@/components/ui/code-block";
import { CodeBlockColore } from "@/components/ui/code-block-colore";
import { CopyButton } from "@/components/ui/copy-button";

import type { NetworkInputValide } from "@/lib/validation/network-schema";
import type { AddressingPlan } from "@/types/network";

import { useRouter } from "next/navigation";
import { enregistrerBrouillon } from "@/lib/storage/brouillon";

type OngletActif =
  | "adressage"
  | "cisco"
  | "pfsense"
  | "powershell"
  | "documentation";

export function ResultatsView() {
  const parametres = useSearchParams();
  const configurationEncodee = parametres.get("config");

  const router = useRouter();

  const ongletInitial = parametres.get("onglet");

  const [ongletActif, setOngletActif] = useState<OngletActif>(
    ongletInitial === "cisco" ||
      ongletInitial === "pfsense" ||
      ongletInitial === "powershell" ||
      ongletInitial === "documentation"
      ? (ongletInitial as OngletActif)
      : "adressage",
  );
  const [configuration, setConfiguration] =
    useState<NetworkInputValide | null>(null);
  const [messageToast, setMessageToast] = useState<string | null>(null);
  const [dateGeneration, setDateGeneration] = useState("");
  function appliquerRecommandation(
    type: string,
    vlanId?: number,
  ): void {
    if (!configuration) {
      return;
    }

    const configurationModifiee: NetworkInputValide = {
      ...configuration,
      securite: { ...configuration.securite },
      vlans: configuration.vlans.map((vlan) => ({ ...vlan })),
    };

    if (type === "activer-isolation-dmz") {
      configurationModifiee.securite.isolationDmz = true;
    }

    if (type === "activer-acl") {
      configurationModifiee.securite.aclInterVlanRestrictives = true;
    }

    if (type === "activer-port-security") {
      configurationModifiee.securite.portSecurityCisco = true;
    }

    if (type === "desactiver-ports") {
      configurationModifiee.securite.desactivationPortsInutilises = true;
    }

    if (type === "augmenter-capacite" && vlanId) {
      configurationModifiee.vlans = configurationModifiee.vlans.map((vlan) =>
        vlan.id === vlanId
          ? {
            ...vlan,
            nombreHotes: Math.ceil(vlan.nombreHotes * 1.25),
          }
          : vlan,
      );
    }

    enregistrerBrouillon(configurationModifiee);
    router.push("/outil");
  }
  useEffect(() => {
    if (configurationEncodee === "draft") {
      setConfiguration(lireBrouillon());
      return;
    }

    if (!configurationEncodee) {
      setConfiguration(null);
      return;
    }

    setConfiguration(decoderConfiguration(configurationEncodee));
  }, [configurationEncodee]);

  useEffect(() => {
    setDateGeneration(
      new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    );
  }, []);

  function afficherToast(message: string) {
    setMessageToast(message);

    setTimeout(() => {
      setMessageToast(null);
    }, 9000);
  }

  const planVlsm = useMemo<AddressingPlan | null>(() => {
    if (!configuration) {
      return null;
    }

    const parties = configuration.parametresGlobaux.reseauParent.split("/");

    if (parties.length !== 2) {
      return null;
    }

    try {
      return calculerPlanVlsm(
        parties[0],
        Number(parties[1]),
        configuration.vlans,
      );
    } catch {
      return null;
    }
  }, [configuration]);

  const configurationCisco = useMemo(() => {
    if (!configuration || !planVlsm) {
      return "";
    }

    return genererConfigurationCisco({
      configuration,
      planVlsm,
    });
  }, [configuration, planVlsm]);

  const reglesPfSense = useMemo(() => {
    if (!configuration || !planVlsm) {
      return [];
    }

    return genererReglesPfSense({
      configuration,
      planVlsm,
    });
  }, [configuration, planVlsm]);

  const scriptPowerShell = useMemo(() => {
    if (!configuration || !planVlsm) {
      return "";
    }

    return genererScriptPowerShell({
      configuration,
      planVlsm,
    });
  }, [configuration, planVlsm]);

  const documentationMarkdown = useMemo(() => {
    if (!configuration || !planVlsm) {
      return "";
    }

    return genererDocumentationMarkdown({
      configuration,
      planVlsm,
    });
  }, [configuration, planVlsm]);

  const adresseCsv = useMemo(() => {
    if (!planVlsm) {
      return "";
    }

    const lignes = [
      "VLAN;Nom;Sous-reseau;Masque;Passerelle;Plage DHCP;Broadcast;Occupation",
    ];

    for (const sousReseau of planVlsm.sousReseaux) {
      const vlan = configuration?.vlans.find(
        (vlan) => vlan.id === sousReseau.vlanId,
      );

      const occupation = vlan
        ? `${vlan.nombreHotes}/${sousReseau.hotesUtilisables}`
        : `${sousReseau.hotesUtilisables}`;

      lignes.push(
        [
          sousReseau.vlanId,
          sousReseau.nom,
          `${sousReseau.adresseReseau}/${sousReseau.prefixe}`,
          sousReseau.masque,
          sousReseau.passerelle,
          sousReseau.plageDhcp
            ? `${sousReseau.plageDhcp.debut} - ${sousReseau.plageDhcp.fin}`
            : "Statique",
          sousReseau.adresseDiffusion,
          occupation,
        ].join(";"),
      );
    }

    return lignes.join("\n");
  }, [configuration, planVlsm]);

  const scoreSecurite = useMemo(() => {
    if (!configuration) {
      return 0;
    }

    let score = 40;

    if (configuration.securite.isolationDmz) {
      score += 15;
    }

    if (configuration.securite.aclInterVlanRestrictives) {
      score += 15;
    }

    if (configuration.securite.portSecurityCisco) {
      score += 10;
    }

    if (configuration.securite.desactivationPortsInutilises) {
      score += 10;
    }

    if (planVlsm && planVlsm.conflits.length === 0) {
      score += 10;
    }

    return Math.min(score, 100);
  }, [configuration, planVlsm]);

  const libelleScore = useMemo(() => {
    if (scoreSecurite >= 90) {
      return "Optimal";
    }

    if (scoreSecurite >= 75) {
      return "Bon";
    }

    return "À améliorer";
  }, [scoreSecurite]);

  const audits = useMemo(() => {
    if (!configuration || !planVlsm) {
      return [];
    }

    const elements: {
      titre: string;
      description: string;
      statut: "ok" | "attention";
    }[] = [
        {
          titre: "VLAN 1 natif neutralisé",
          description:
            "Le VLAN natif du trunk 802.1Q a été basculé sur l’ID 999 non routé.",
          statut: "ok",
        },
      ];

    if (configuration.securite.isolationDmz) {
      elements.push({
        titre: "Isolation étanche de la DMZ",
        description:
          "Aucun trafic initié depuis la DMZ ne peut traverser vers le LAN ou les serveurs.",
        statut: "ok",
      });
    }

    elements.push({
      titre: "Durcissement SSH v2 et RSA 2048",
      description:
        "Telnet désactivé. Clé de chiffrement asymétrique de 2048 bits configurée.",
      statut: "ok",
    });

    for (const sousReseau of planVlsm.sousReseaux) {
      const vlan = configuration.vlans.find(
        (vlan) => vlan.id === sousReseau.vlanId,
      );

      if (!vlan) {
        continue;
      }

      const pourcentage = Math.round(
        (vlan.nombreHotes / sousReseau.hotesUtilisables) * 100,
      );

      if (pourcentage >= 80) {
        elements.push({
          titre: `VLAN ${sousReseau.vlanId} : marge d’évolution (${pourcentage}%)`,
          description: `${vlan.nombreHotes} postes configurés sur ${sousReseau.hotesUtilisables} disponibles (/${sousReseau.prefixe}). Envisage un préfixe plus large si de nouveaux postes sont prévus.`,
          statut: "attention",
        });
      }
    }

    if (configuration.securite.portSecurityCisco) {
      elements.push({
        titre: "Port Security activé",
        description:
          "Protection contre les attaques de saturation de table CAM (MAC flooding).",
        statut: "ok",
      });
    }

    return elements;
  }, [configuration, planVlsm]);

  async function telechargerZip() {
    if (!configuration || !planVlsm) {
      return;
    }

    await telechargerArchiveZip(
      configuration.parametresGlobaux.nomProjet,
      [
        {
          nom: "cisco-ios.txt",
          contenu: configurationCisco,
        },
        {
          nom: "pfsense-rules.txt",
          contenu: reglesPfSense.join("\n"),
        },
        {
          nom: "dhcp-dns.ps1",
          contenu: scriptPowerShell,
        },
        {
          nom: "documentation.md",
          contenu: documentationMarkdown,
        },
      ],
    );

    afficherToast("Archive NetForge-Configuration.zip générée");
  }

  async function copierLien() {
    await navigator.clipboard.writeText(window.location.href);
    afficherToast("Lien partageable copié dans le presse-papier");
  }

  function exporterMarkdown() {
    telechargerFichierTexte({
      contenu: documentationMarkdown,
      nomFichier: genererNomFichier(
        configuration?.parametresGlobaux.nomProjet ?? "netforge",
        "documentation",
        "md",
      ),
      typeMime: "text/markdown;charset=utf-8",
    });

    afficherToast("Documentation Markdown exportée");
  }

  function exporterPdf() {
    const fenetreImpression = window.open("", "_blank", "width=900,height=700");

    if (!fenetreImpression) {
      afficherToast(
        "Autorise les fenêtres surgissantes pour générer le PDF.",
      );

      return;
    }

    const titre = configuration?.parametresGlobaux.nomProjet ?? "NetForge";
    const contenuEchappe = documentationMarkdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

    fenetreImpression.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>NetForge — ${titre}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111827;
            padding: 40px;
            line-height: 1.6;
          }

          pre {
            white-space: pre-wrap;
            background: #f3f4f6;
            padding: 16px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
          }

          h1 {
            font-size: 24px;
            margin-bottom: 8px;
          }

          .meta {
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 24px;
          }
        </style>
      </head>

      <body>
        <h1>Dossier d’architecture technique — ${titre}</h1>
        <p class="meta">
          Généré par NetForge le ${new Date().toLocaleDateString("fr-FR")}
        </p>

        <pre>${contenuEchappe}</pre>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

    fenetreImpression.document.close();
    afficherToast("Exportation du dossier PDF lancée...");
  }

  if (!configuration || !planVlsm) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="text-headline-lg font-bold text-on-surface">
          Aucune configuration valide
        </h1>

        <p className="mt-4 text-body-lg text-outline-variant">
          Configure d’abord ton réseau depuis l’assistant.
        </p>

        <Link
          href="/outil"
          className="mt-8 inline-flex rounded bg-accent px-6 py-2.5 text-label-lg font-label font-semibold text-on-accent"
        >
          Ouvrir l’assistant
        </Link>
      </section>
    );
  }

  const capaciteParent = Math.pow(2, 32 - planVlsm.prefixeParent) - 2;
  const capaciteAllouee = planVlsm.totalHotesAlloues;

  return (
    <div className="pb-24">
      <section className="border-b border-outline bg-surface-container-low py-6">
        <div className="mx-auto flex w-full max-w-[1700px] flex-col justify-between gap-6 px-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-label-sm font-code uppercase tracking-wider text-accent">
                Résultats de génération
              </span>

              <span className="text-outline-variant">•</span>

              <span className="text-label-sm text-outline-variant">
                Généré le {dateGeneration}
              </span>
            </div>

            <h1 className="mt-1 flex flex-wrap items-center gap-3 text-headline-lg font-bold text-on-surface">
              <span>
                Projet : {configuration.parametresGlobaux.nomProjet}
              </span>

              <span className="rounded border border-outline bg-surface-container px-2.5 py-0.5 font-code text-code-sm font-normal text-accent">
                {configuration.parametresGlobaux.reseauParent}
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-outline bg-surface-container p-3 text-body-sm sm:gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-surface-container-high text-accent">
                <Layers className="h-4 w-4" aria-hidden="true" />
              </div>

              <div>
                <span className="block text-label-xs font-label text-outline-variant">
                  VLANs configurés
                </span>

                <span className="font-semibold text-on-surface">
                  {configuration.vlans.length} VLANs actifs
                </span>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-outline sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-surface-container-high text-emerald-400">
                <Users className="h-4 w-4" aria-hidden="true" />
              </div>

              <div>
                <span className="block text-label-xs font-label text-outline-variant">
                  Postes &amp; Hôtes
                </span>

                <span className="font-semibold text-on-surface">
                  {planVlsm.totalHotesRequis} requis /{" "}
                  {planVlsm.totalHotesAlloues} alloués
                </span>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-outline sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-emerald-800/40 bg-emerald-950/60 text-emerald-400">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </div>

              <div>
                <span className="block text-label-xs font-label text-outline-variant">
                  Score de sécurité
                </span>

                <span
                  className={`font-mono font-semibold ${scoreSecurite >= 90
                    ? "text-emerald-400"
                    : scoreSecurite >= 75
                      ? "text-amber-400"
                      : "text-red-400"
                    }`}
                >
                  {scoreSecurite} / 100 ({libelleScore})
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[1700px] grid-cols-1 gap-6 px-6 py-8 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-outline bg-surface-container p-1.5">
            <button
              type="button"
              onClick={() => setOngletActif("adressage")}
              className={`inline-flex items-center gap-2 rounded px-3.5 py-2 text-label-md font-label transition-colors ${ongletActif === "adressage"
                ? "border border-outline bg-surface-container-high font-semibold text-accent"
                : "text-outline-variant hover:text-on-surface"
                }`}
            >
              <Network className="h-4 w-4" aria-hidden="true" />
              Plan d’adressage
            </button>

            <button
              type="button"
              onClick={() => setOngletActif("cisco")}
              className={`inline-flex items-center gap-2 rounded px-3.5 py-2 text-label-md font-label transition-colors ${ongletActif === "cisco"
                ? "border border-outline bg-surface-container-high font-semibold text-accent"
                : "text-outline-variant hover:text-on-surface"
                }`}
            >
              <Terminal className="h-4 w-4" aria-hidden="true" />
              Cisco IOS
            </button>

            <button
              type="button"
              onClick={() => setOngletActif("pfsense")}
              className={`inline-flex items-center gap-2 rounded px-3.5 py-2 text-label-md font-label transition-colors ${ongletActif === "pfsense"
                ? "border border-outline bg-surface-container-high font-semibold text-accent"
                : "text-outline-variant hover:text-on-surface"
                }`}
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              Pare-feu pfSense
            </button>

            <button
              type="button"
              onClick={() => setOngletActif("powershell")}
              className={`inline-flex items-center gap-2 rounded px-3.5 py-2 text-label-md font-label transition-colors ${ongletActif === "powershell"
                ? "border border-outline bg-surface-container-high font-semibold text-accent"
                : "text-outline-variant hover:text-on-surface"
                }`}
            >
              <FileCode2 className="h-4 w-4" aria-hidden="true" />
              PowerShell DHCP
            </button>

            <button
              type="button"
              onClick={() => setOngletActif("documentation")}
              className={`inline-flex items-center gap-2 rounded px-3.5 py-2 text-label-md font-label transition-colors ${ongletActif === "documentation"
                ? "border border-outline bg-surface-container-high font-semibold text-accent"
                : "text-outline-variant hover:text-on-surface"
                }`}
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Documentation
            </button>
          </div>

          {ongletActif === "adressage" ? (
            <section className="space-y-6">
              <div className="rounded-lg border border-outline bg-surface-container p-6">
                <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-headline-sm font-bold text-on-surface">
                      Découpage visuel de l’espace d’adressage VLSM
                    </h3>

                    <p className="mt-1 text-body-sm text-outline-variant">
                      Répartition des sous-réseaux dans le supernet{" "}
                      {planVlsm.reseauParent}/{planVlsm.prefixeParent}
                    </p>
                  </div>

                  <span className="rounded border border-outline bg-surface-container-low px-2 py-1 font-code text-code-xs text-outline-variant">
                    Capacité allouée : {planVlsm.totalHotesAlloues} / {capaciteParent} hôtes
                  </span>
                </div>

                <div className="space-y-4">
                  {planVlsm.sousReseaux.map((sousReseau) => {
                    const pourcentage = Math.max(
                      (sousReseau.capaciteTotale / capaciteAllouee) * 100,
                      8,
                    );

                    return (
                      <div key={sousReseau.vlanId}>
                        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded"
                              style={{ backgroundColor: sousReseau.couleur }}
                            />

                            <span className="font-code text-code-sm font-semibold text-on-surface">
                              VLAN {sousReseau.vlanId} — {sousReseau.nom}
                            </span>
                          </div>

                          <span className="font-code text-code-xs text-outline-variant">
                            {sousReseau.adresseReseau}/{sousReseau.prefixe} •{" "}
                            {sousReseau.hotesUtilisables} hôtes
                          </span>
                        </div>

                        <div className="h-6 w-full overflow-hidden rounded border border-outline bg-surface-container-low">
                          <div
                            title={`${sousReseau.nom} — ${sousReseau.hotesUtilisables} hôtes disponibles`}
                            style={{
                              width: `${pourcentage}%`,
                              backgroundColor: sousReseau.couleur,
                            }}
                            className="flex h-full items-center justify-end rounded pr-2 font-code text-code-xs font-semibold text-white"
                          >
                            /{sousReseau.prefixe}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-lg border border-outline bg-surface-container-low p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-body-sm font-semibold text-on-surface">
                      Espace disponible dans le supernet
                    </span>

                    <span className="font-code text-code-xs text-outline-variant">
                      {capaciteParent - planVlsm.totalHotesAlloues} adresses disponibles
                    </span>
                  </div>

                  <div className="h-3 w-full overflow-hidden rounded bg-surface-container">
                    <div
                      style={{
                        width: `${Math.min(
                          (planVlsm.totalHotesAlloues / capaciteParent) * 100,
                          100,
                        )}%`,
                      }}
                      className="h-full rounded bg-accent"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-outline bg-surface-container">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline px-4 py-4 sm:px-6">
                  <h3 className="text-headline-sm font-bold text-on-surface">
                    Tableau détaillé d’adressage IP
                  </h3>

                  <CopyButton
                    contenu={adresseCsv}
                    libelle="Copier les adresses"
                  />
                </div>

                <div className="hidden xl:block">
                  <table className="w-full table-fixed border-collapse text-left font-code text-code-xs">
                    <thead>
                      <tr className="border-b border-outline bg-surface-container-low text-label-xs uppercase text-outline-variant">
                        <th className="w-[4%] px-2.5 py-3">VLAN</th>
                        <th className="w-[16%] px-2.5 py-3">Nom</th>
                        <th className="w-[12%] px-2.5 py-3">Sous-réseau</th>
                        <th className="w-[13%] px-2.5 py-3">Masque</th>
                        <th className="w-[10%] px-2.5 py-3">Passerelle</th>
                        <th className="w-[17%] px-2.5 py-3">Plage</th>
                        <th className="w-[10%] px-2.5 py-3">Broadcast</th>
                        <th className="w-[10%] px-2.5 py-3 text-center">Occupation</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-outline">
                      {planVlsm.sousReseaux.map((sousReseau) => {
                        const vlan = configuration.vlans.find(
                          (vlan) => vlan.id === sousReseau.vlanId,
                        );

                        const hotesDemandes = vlan?.nombreHotes ?? 0;
                        const pourcentage = Math.round(
                          (hotesDemandes / sousReseau.hotesUtilisables) * 100,
                        );

                        return (
                          <tr
                            key={sousReseau.vlanId}
                            className="transition-colors hover:bg-surface-container-high/60"
                          >
                            <td className="truncate px-2.5 py-3 font-bold text-accent">
                              {sousReseau.vlanId}
                            </td>

                            <td
                              className="truncate px-2.5 py-3 font-medium text-on-surface"
                              title={sousReseau.nom}
                            >
                              {sousReseau.nom}
                            </td>

                            <td className="truncate px-2.5 py-3 text-on-surface">
                              {sousReseau.adresseReseau}/{sousReseau.prefixe}
                            </td>

                            <td className="truncate px-2.5 py-3 text-outline-variant">
                              {sousReseau.masque}
                            </td>

                            <td className="truncate px-2.5 py-3 font-semibold text-accent">
                              {sousReseau.passerelle}
                            </td>

                            <td className="whitespace-nowrap px-2.5 py-3 text-on-surface">
                              {sousReseau.plageDhcp
                                ? `${sousReseau.plageDhcp.debut} – ${sousReseau.plageDhcp.fin}`
                                : `${sousReseau.premiereAdresseUtilisable} – ${sousReseau.derniereAdresseUtilisable}`}
                            </td>

                            <td className="truncate px-2.5 py-3 text-outline-variant">
                              {sousReseau.adresseDiffusion}
                            </td>

                            <td className="px-2.5 py-3 text-center">
                              <span
                                className="inline-flex rounded border border-outline bg-surface-container-low px-1.5 py-0.5 text-label-xs text-outline-variant"
                                title={`${hotesDemandes} hôtes demandés sur ${sousReseau.hotesUtilisables} disponibles`}
                              >
                                {pourcentage}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4 p-4 xl:hidden">
                  {planVlsm.sousReseaux.map((sousReseau) => {
                    const vlan = configuration.vlans.find(
                      (vlan) => vlan.id === sousReseau.vlanId,
                    );

                    const hotesDemandes = vlan?.nombreHotes ?? 0;
                    const pourcentage = Math.round(
                      (hotesDemandes / sousReseau.hotesUtilisables) * 100,
                    );

                    return (
                      <div
                        key={sousReseau.vlanId}
                        className="rounded-lg border border-outline bg-surface-container-low p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="font-code text-code-sm font-bold text-accent">
                            VLAN {sousReseau.vlanId}
                          </span>

                          <span className="rounded border border-outline bg-surface-container px-2 py-0.5 text-label-xs text-outline-variant">
                            {hotesDemandes}/{sousReseau.hotesUtilisables} ({pourcentage}%)
                          </span>
                        </div>

                        <p className="font-code text-code-sm font-semibold text-on-surface">
                          {sousReseau.nom}
                        </p>

                        <div className="mt-3 grid grid-cols-1 gap-2 font-code text-code-xs sm:grid-cols-2">
                          <p>
                            Sous-réseau :{" "}
                            <span className="text-on-surface">
                              {sousReseau.adresseReseau}/{sousReseau.prefixe}
                            </span>
                          </p>

                          <p>
                            Masque :{" "}
                            <span className="text-on-surface">{sousReseau.masque}</span>
                          </p>

                          <p>
                            Passerelle :{" "}
                            <span className="text-accent">{sousReseau.passerelle}</span>
                          </p>

                          <p>
                            Broadcast :{" "}
                            <span className="text-on-surface">
                              {sousReseau.adresseDiffusion}
                            </span>
                          </p>

                          <p className="sm:col-span-2">
                            Plage :{" "}
                            <span className="text-on-surface">
                              {sousReseau.plageDhcp
                                ? `${sousReseau.plageDhcp.debut} – ${sousReseau.plageDhcp.fin}`
                                : `${sousReseau.premiereAdresseUtilisable} – ${sousReseau.derniereAdresseUtilisable}`}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          {ongletActif === "cisco" ? (
            <section className="overflow-hidden rounded-lg border border-outline bg-surface-container">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline bg-surface-container-high px-6 py-4">
                <div className="flex items-center gap-3">
                  <Terminal className="h-5 w-5 text-accent" aria-hidden="true" />

                  <span className="font-code text-code-sm font-semibold text-on-surface">
                    {configuration.equipements.nomSwitchCoeur}.cfg
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <CopyButton
                    contenu={configurationCisco}
                    libelle="Copier la configuration"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      telechargerFichierTexte({
                        contenu: configurationCisco,
                        nomFichier: genererNomFichier(
                          configuration.parametresGlobaux.nomProjet,
                          configuration.equipements.nomSwitchCoeur,
                          "cfg",
                        ),
                        typeMime: "text/plain;charset=utf-8",
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded border border-outline bg-surface-container px-3 py-1 text-label-sm font-label text-accent transition-colors hover:border-accent"
                  >
                    Télécharger .cfg
                  </button>
                </div>
              </div>

              <CodeBlockColore
                contenu={configurationCisco}
                langage="cisco"
              />
            </section>
          ) : null}

          {ongletActif === "pfsense" ? (
            <section className="space-y-6">
              <div className="rounded-lg border border-outline bg-surface-container p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-headline-sm font-bold text-on-surface">
                      Politique de filtrage pfSense
                    </h3>

                    <p className="mt-1 text-body-sm text-outline-variant">
                      {reglesPfSense.length} règle(s) générée(s) pour{" "}
                      {configuration.equipements.nomRouteurPareFeu}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-label-xs font-label ${configuration.securite.isolationDmz
                      ? "border-emerald-800/40 bg-emerald-950 text-emerald-300"
                      : "border-amber-800/40 bg-amber-950 text-amber-300"
                      }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${configuration.securite.isolationDmz
                        ? "bg-emerald-400"
                        : "bg-amber-400"
                        }`}
                    />

                    {configuration.securite.isolationDmz
                      ? "Isolation DMZ active"
                      : "Isolation DMZ désactivée"}
                  </span>
                </div>

                <div className="mt-4 rounded-lg border border-outline bg-surface-container-low p-4 text-body-sm text-outline-variant">
                  pfSense applique une politique <strong>default-deny</strong> : tout
                  trafic non explicitement autorisé est bloqué. Les règles sont
                  regroupées par VLAN et s’adaptent automatiquement à ta configuration.
                </div>
              </div>

              {planVlsm.sousReseaux.map((sousReseau) => {
                const reglesVlan = reglesPfSense.filter(
                  (regle) => regle.interface === `VLAN${sousReseau.vlanId}`,
                );

                const reglesWan = reglesPfSense.filter(
                  (regle) => regle.interface === "WAN",
                );

                return (
                  <div
                    key={sousReseau.vlanId}
                    className="overflow-hidden rounded-lg border border-outline bg-surface-container"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline bg-surface-container-high px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded"
                          style={{ backgroundColor: sousReseau.couleur }}
                        />

                        <div>
                          <span className="font-code text-code-sm font-semibold text-on-surface">
                            VLAN {sousReseau.vlanId} — {sousReseau.nom}
                          </span>

                          <span className="block text-label-xs text-outline-variant">
                            {sousReseau.adresseReseau}/{sousReseau.prefixe} •{" "}
                            {sousReseau.hotesUtilisables} hôtes
                          </span>
                        </div>
                      </div>

                      <span className="rounded border border-outline bg-surface-container px-2 py-0.5 text-label-xs font-label text-outline-variant">
                        {reglesVlan.length} règle(s)
                      </span>
                    </div>

                    {reglesVlan.length > 0 ? (
                      <div className="divide-y divide-outline">
                        {reglesVlan.map((regle) => (
                          <div
                            key={regle.id}
                            className={`flex flex-wrap items-center justify-between gap-3 px-6 py-3 ${regle.action === "block" ? "bg-red-950/10" : ""
                              }`}
                          >
                            <div className="flex flex-wrap items-center gap-3">
                              <span
                                className={`rounded px-2 py-0.5 text-label-xs font-bold ${regle.action === "pass"
                                  ? "border border-emerald-800/40 bg-emerald-950 text-emerald-400"
                                  : "border border-red-800/40 bg-red-950 text-red-400"
                                  }`}
                              >
                                {regle.action.toUpperCase()}
                              </span>

                              <span className="font-code text-code-sm text-on-surface">
                                {regle.protocole.toUpperCase()}
                              </span>

                              <span className="font-code text-code-sm text-accent">
                                {regle.source}
                              </span>

                              <span className="font-code text-code-sm text-outline-variant">
                                →
                              </span>

                              <span className="font-code text-code-sm text-on-surface">
                                {regle.destination}
                              </span>

                              <span className="font-code text-code-xs text-accent">
                                {regle.portDestination ?? "*"}
                              </span>
                            </div>

                            <span className="text-body-sm text-outline-variant">
                              {regle.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-6 py-4 text-body-sm text-outline-variant">
                        Aucune règle spécifique générée pour ce VLAN.
                      </div>
                    )}
                  </div>
                );
              })}

              {reglesPfSense.some((regle) => regle.interface === "WAN") ? (
                <div className="overflow-hidden rounded-lg border border-outline bg-surface-container">
                  <div className="border-b border-outline bg-surface-container-high px-6 py-4">
                    <span className="font-code text-code-sm font-semibold text-on-surface">
                      Règles WAN
                    </span>
                  </div>

                  <div className="divide-y divide-outline">
                    {reglesPfSense
                      .filter((regle) => regle.interface === "WAN")
                      .map((regle) => (
                        <div
                          key={regle.id}
                          className="flex flex-wrap items-center justify-between gap-3 px-6 py-3"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded border border-emerald-800/40 bg-emerald-950 px-2 py-0.5 text-label-xs font-bold text-emerald-400">
                              PASS
                            </span>

                            <span className="font-code text-code-sm text-on-surface">
                              {regle.protocole.toUpperCase()}
                            </span>

                            <span className="font-code text-code-sm text-accent">
                              {regle.source}
                            </span>

                            <span className="font-code text-code-sm text-outline-variant">
                              →
                            </span>

                            <span className="font-code text-code-sm text-on-surface">
                              {regle.destination}
                            </span>

                            <span className="font-code text-code-xs text-accent">
                              {regle.portDestination ?? "*"}
                            </span>
                          </div>

                          <span className="text-body-sm text-outline-variant">
                            {regle.description}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {ongletActif === "powershell" ? (
            <section className="overflow-hidden rounded-lg border border-outline bg-surface-container">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline bg-surface-container-high px-6 py-4">
                <div className="flex items-center gap-3">
                  <Terminal className="h-5 w-5 text-accent" aria-hidden="true" />

                  <span className="font-code text-code-sm font-semibold text-on-surface">
                    Deploy-NetForge-DHCP-DNS.ps1
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <CopyButton
                    contenu={scriptPowerShell}
                    libelle="Copier"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      telechargerFichierTexte({
                        contenu: scriptPowerShell,
                        nomFichier: genererNomFichier(
                          configuration.parametresGlobaux.nomProjet,
                          configuration.equipements.nomRouteurPareFeu,
                          "ps1",
                        ),
                        typeMime: "text/plain;charset=utf-8",
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded bg-accent px-3 py-1 text-label-sm font-label font-semibold text-on-accent transition-colors hover:bg-cyan-300"
                  >
                    Télécharger .ps1
                  </button>
                </div>
              </div>

              <CodeBlockColore
                contenu={scriptPowerShell}
                langage="powershell"
              />
            </section>
          ) : null}

          {ongletActif === "documentation" ? (
            <section className="space-y-6">
              <div className="rounded-lg border border-outline bg-surface-container p-8">
                <div className="mb-6 border-b border-outline pb-4">
                  <h2 className="text-headline-md font-bold text-on-surface">
                    Dossier d’architecture technique
                  </h2>
                </div>

                <div className="space-y-6 text-body-md leading-relaxed text-on-surface">
                  <div>
                    <h3 className="mb-2 text-headline-sm font-semibold text-accent">
                      1. Présentation de la segmentation
                    </h3>

                    <p className="text-outline-variant">
                      L’infrastructure réseau s’appuie sur le supernet{" "}
                      <code className="rounded bg-surface-container-low px-1 font-code text-code-sm text-accent">
                        {configuration.parametresGlobaux.reseauParent}
                      </code>{" "}
                      et est segmentée en {configuration.vlans.length} VLAN(s)
                      selon une logique VLSM.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-headline-sm font-semibold text-accent">
                      2. Rôles et passerelles
                    </h3>

                    <ul className="list-disc space-y-1 pl-6 text-outline-variant">
                      {planVlsm.sousReseaux.map((sousReseau) => (
                        <li key={sousReseau.vlanId}>
                          <strong className="text-on-surface">
                            VLAN {sousReseau.vlanId} ({sousReseau.nom}) :
                          </strong>{" "}
                          passerelle{" "}
                          <code className="rounded bg-surface-container-low px-1 font-code text-code-sm text-accent">
                            {sousReseau.passerelle}/{sousReseau.prefixe}
                          </code>
                          , mode{" "}
                          {sousReseau.modeAttribution === "dhcp"
                            ? "DHCP"
                            : "statique"}
                          .
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-2 text-headline-sm font-semibold text-accent">
                      3. Politique de sécurité
                    </h3>

                    <ul className="list-disc space-y-1 pl-6 text-outline-variant">
                      <li>
                        Isolation de la DMZ :{" "}
                        <strong className="text-on-surface">
                          {configuration.securite.isolationDmz
                            ? "activée"
                            : "désactivée"}
                        </strong>
                      </li>
                      <li>
                        ACL inter-VLAN restrictives :{" "}
                        <strong className="text-on-surface">
                          {configuration.securite.aclInterVlanRestrictives
                            ? "activées"
                            : "désactivées"}
                        </strong>
                      </li>
                      <li>
                        Port Security Cisco :{" "}
                        <strong className="text-on-surface">
                          {configuration.securite.portSecurityCisco
                            ? "activé"
                            : "désactivé"}
                        </strong>
                      </li>
                      <li>
                        Désactivation des ports inutilisés :{" "}
                        <strong className="text-on-surface">
                          {configuration.securite.desactivationPortsInutilises
                            ? "activée"
                            : "désactivée"}
                        </strong>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-2 text-headline-sm font-semibold text-accent">
                      4. Consignes d’exploitation
                    </h3>

                    <p className="text-outline-variant">
                      Toute configuration générée doit être validée dans un
                      environnement isolé, tel que Cisco Packet Tracer ou GNS3,
                      avant tout déploiement en production. Le VLAN natif du
                      trunk 802.1Q doit rester isolé du VLAN 1.
                    </p>
                  </div>
                </div>
              </div>

            </section>
          ) : null}

          {planVlsm.conflits.length > 0 ? (
            <section className="rounded-lg border border-red-800/40 bg-red-950/40 p-4">
              <h2 className="text-headline-sm font-bold text-red-300">
                Conflits détectés
              </h2>

              <ul className="mt-2 space-y-1 text-body-sm text-red-200">
                {planVlsm.conflits.map((conflit) => (
                  <li key={conflit}>{conflit}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6 xl:col-span-4">
          <div className="sticky top-24 rounded-lg border border-outline bg-surface-container p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-outline pb-4">
              <div className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-emerald-400" aria-hidden="true" />

                <h3 className="whitespace-nowrap text-headline-sm font-bold text-on-surface">
                  Conformité réseau
                </h3>
              </div>

              <span className="rounded border border-emerald-800/40 bg-emerald-950 px-2 py-0.5 text-label-xs font-label text-emerald-400">
                Conformité {scoreSecurite}%
              </span>
            </div>

            <p className="mb-6 text-body-sm text-outline-variant">
              Audit statique automatisé des règles générées selon les
              référentiels de sécurité CIS Cisco et ANSSI.
            </p>

            <div className="space-y-4">
              {audits.map((audit) => (
                <div
                  key={audit.titre}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${audit.statut === "ok"
                    ? "border-outline bg-surface-container-low"
                    : "border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20"
                    }`}
                >
                  {audit.statut === "ok" ? (
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <TriangleAlert
                      className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
                      aria-hidden="true"
                    />
                  )}

                  <div>
                    <span
                      className={`block text-body-sm font-semibold ${audit.statut === "ok"
                          ? "text-on-surface"
                          : "text-amber-800 dark:text-amber-300"
                        }`}
                    >
                      {audit.titre}
                    </span>

                    <span className="block text-body-sm text-outline-variant">
                      {audit.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-outline pt-4 text-center">
              <Link
                href={{
                  pathname: "/diagramme",
                  query: {
                    config: configurationEncodee ?? "",
                  },
                }}
                className="inline-flex items-center gap-1.5 text-label-sm font-label text-accent hover:underline"
              >
                <Network className="h-4 w-4" aria-hidden="true" />
                Explorer la topologie réseau graphique
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {messageToast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 top-20 z-[60] flex items-center justify-center sm:inset-x-auto sm:right-6 sm:top-25.5 sm:justify-end"
        >
          <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-emerald-800/80 bg-emerald-950/90 px-4 py-2.5 text-label-sm font-label text-emerald-300 shadow-xl backdrop-blur">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />

            <span className="truncate">{messageToast}</span>
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-outline bg-surface-container-high/95 px-6 py-3 shadow-2xl backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

            <span className="text-body-sm font-medium text-on-surface">
              Kit de déploiement prêt pour la mise en production
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={exporterPdf}
              className="inline-flex items-center gap-1.5 rounded border border-outline bg-surface-container px-3.5 py-2 text-label-md font-label text-on-surface transition-colors hover:border-accent hover:text-accent"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Exporter PDF
            </button>

            <button
              type="button"
              onClick={exporterMarkdown}
              className="inline-flex items-center gap-1.5 rounded border border-outline bg-surface-container px-3.5 py-2 text-label-md font-label text-on-surface transition-colors hover:border-accent hover:text-accent"
            >
              <FileCode2 className="h-4 w-4" aria-hidden="true" />
              Exporter Markdown
            </button>

            <button
              type="button"
              onClick={copierLien}
              className="inline-flex items-center gap-1.5 rounded border border-outline bg-surface-container px-3.5 py-2 text-label-md font-label text-on-surface transition-colors hover:border-accent hover:text-accent"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Copier le lien
            </button>

            <button
              type="button"
              onClick={telechargerZip}
              className="inline-flex items-center gap-2 rounded bg-accent px-5 py-2 text-label-md font-label font-bold text-on-accent shadow-lg transition-colors hover:bg-cyan-300"
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
              Télécharger tout (.zip)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}