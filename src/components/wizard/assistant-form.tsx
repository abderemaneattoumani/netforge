"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Info, Plus, Save, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

import { calculerPlanVlsm } from "@/lib/network/vlsm";
import { parserReseauCidr } from "@/lib/network/cidr";
import { construireUrlResultats } from "@/lib/network/config-codec";
import { networkInputSchema } from "@/lib/validation/network-schema";
import {
  enregistrerBrouillon,
  lireBrouillon,
} from "@/lib/storage/brouillon";

import type { NetworkInput } from "@/types/network";

const configurationParDefaut: NetworkInput = {
  parametresGlobaux: {
    nomProjet: "Refonte-LAN-Siege",
    reseauParent: "192.168.0.0/16",
    domaineReseau: "entreprise.local",
    modeleArchitecture: "pme-standard",
  },
  vlans: [
    {
      id: 10,
      nom: "VLAN_UTILISATEURS",
      type: "utilisateurs",
      nombreHotes: 50,
      dhcpActive: true,
    },
    {
      id: 20,
      nom: "VLAN_SERVEURS",
      type: "serveurs",
      nombreHotes: 1,
      dhcpActive: false,
    },
    {
      id: 30,
      nom: "VLAN_DMZ_PUBLIQUE",
      type: "dmz",
      nombreHotes: 1,
      dhcpActive: false,
    },
  ],
  securite: {
    profil: "recommande",
    isolationDmz: true,
    aclInterVlanRestrictives: true,
    portSecurityCisco: true,
    desactivationPortsInutilises: true,
  },
  equipements: {
    nomSwitchCoeur: "SW-CORE-01",
    nomRouteurPareFeu: "PFSENSE-FW01",
    modelePortsSwitch: "24-gigabit-4-sfp-plus",
  },
  sorties: {
    artefacts: [
      "cisco-ios",
      "pfsense",
      "powershell-dhcp",
      "documentation-pdf",
    ],
  },
};

function obtenirConseils(
  reseauParent: string,
  domaineReseau: string,
  modeleArchitecture: string,
): string[] {
  const conseils: string[] = [];
  const reseauCidr = parserReseauCidr(reseauParent);

  if (!reseauCidr) {
    conseils.push(
      "Saisis un réseau privé au format CIDR, par exemple 192.168.0.0/16 pour une PME.",
    );
  } else if (reseauCidr.prefixe < 16) {
    conseils.push(
      "Un préfixe inférieur à /16 est très large. Pour un projet de BTS ou une PME, /16 ou /24 est généralement plus lisible.",
    );
  } else if (reseauCidr.prefixe > 24) {
    conseils.push(
      "Un préfixe supérieur à /24 limite fortement le nombre de sous-réseaux disponibles.",
    );
  } else {
    conseils.push(
      "Le réseau parent est adapté à une segmentation en plusieurs VLANs.",
    );
  }

  if (!domaineReseau.includes(".")) {
    conseils.push(
      "Le domaine doit contenir un point, par exemple entreprise.local ou monentreprise.fr.",
    );
  }

  if (modeleArchitecture === "campus") {
    conseils.push(
      "Pour un campus, prévois généralement des VLANs distincts pour l’administration, les utilisateurs, les serveurs et éventuellement la VoIP.",
    );
  }

  if (modeleArchitecture === "pme-standard") {
    conseils.push(
      "Pour une PME, une segmentation Utilisateurs / Serveurs / DMZ est un bon point de départ.",
    );
  }

  return conseils;
}

export function AssistantForm() {
  const router = useRouter();

  const [brouillonRestaure, setBrouillonRestaure] = useState(false);
  const [brouillonEnregistre, setBrouillonEnregistre] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<NetworkInput>({
    resolver: zodResolver(networkInputSchema),
    defaultValues: configurationParDefaut,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "vlans",
  });

  const valeurs = watch();

  useEffect(() => {
    const brouillon = lireBrouillon();

    if (brouillon) {
      reset(brouillon);
      setBrouillonRestaure(true);
    }
  }, [reset]);

  useEffect(() => {
    if (valeurs) {
      enregistrerBrouillon(valeurs);
    }
  }, [valeurs]);

  const planVlsm = useMemo(() => {
    const reseauCidr = parserReseauCidr(
      valeurs.parametresGlobaux?.reseauParent ?? "",
    );

    if (!reseauCidr) {
      return null;
    }

    try {
      return calculerPlanVlsm(
        reseauCidr.adresse,
        reseauCidr.prefixe,
        valeurs.vlans ?? [],
      );
    } catch {
      return null;
    }
  }, [valeurs.parametresGlobaux?.reseauParent, valeurs.vlans]);

  const conseils = useMemo(
    () =>
      obtenirConseils(
        valeurs.parametresGlobaux?.reseauParent ?? "",
        valeurs.parametresGlobaux?.domaineReseau ?? "",
        valeurs.parametresGlobaux?.modeleArchitecture ?? "",
      ),
    [
      valeurs.parametresGlobaux?.reseauParent,
      valeurs.parametresGlobaux?.domaineReseau,
      valeurs.parametresGlobaux?.modeleArchitecture,
    ],
  );

  function soumettre(configuration: NetworkInput) {
    enregistrerBrouillon(configuration);
    router.push(construireUrlResultats(configuration));
  }

  function sauvegarderManuellement() {
    enregistrerBrouillon(valeurs);
    setBrouillonEnregistre(true);

    setTimeout(() => {
      setBrouillonEnregistre(false);
    }, 2500);
  }

  return (
    <form onSubmit={handleSubmit(soumettre)} className="space-y-8">
      {/*brouillonRestaure ? (
        <div className="rounded-lg border border-info/40 bg-blue-950/40 p-4 text-body-sm text-blue-200">
          Brouillon précédent restauré depuis ce navigateur.
        </div>
      ) : null*/}

      <section className="rounded-lg border border-outline bg-surface-container p-6">
        <h2 className="mb-4 border-b border-outline pb-4 text-headline-sm font-bold text-on-surface">
          1. Paramètres du réseau global
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-label-sm font-label text-outline-variant">
              Nom du projet
            </label>

            <input
              {...register("parametresGlobaux.nomProjet")}
              maxLength={64}
              placeholder="Exemple : Refonte-LAN-Siege"
              className="w-full rounded border border-outline bg-surface-container-low px-3 py-2 font-mono text-body-sm text-on-surface"
            />

            {errors.parametresGlobaux?.nomProjet ? (
              <p className="mt-1 text-body-sm text-error">
                {errors.parametresGlobaux.nomProjet.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-label-sm font-label text-outline-variant">
              Réseau parent (CIDR)
            </label>

            <input
              {...register("parametresGlobaux.reseauParent")}
              maxLength={18}
              placeholder="Exemple : 192.168.0.0/16"
              className="w-full rounded border border-outline bg-surface-container-low px-3 py-2 font-mono text-body-sm text-on-surface"
            />

            {errors.parametresGlobaux?.reseauParent ? (
              <p className="mt-1 text-body-sm text-error">
                {errors.parametresGlobaux.reseauParent.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-label-sm font-label text-outline-variant">
              Domaine réseau
            </label>

            <input
              {...register("parametresGlobaux.domaineReseau")}
              maxLength={253}
              placeholder="Exemple : entreprise.local"
              className="w-full rounded border border-outline bg-surface-container-low px-3 py-2 font-mono text-body-sm text-on-surface"
            />

            {errors.parametresGlobaux?.domaineReseau ? (
              <p className="mt-1 text-body-sm text-error">
                {errors.parametresGlobaux.domaineReseau.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-label-sm font-label text-outline-variant">
              Modèle d’architecture
            </label>

            <select
              {...register("parametresGlobaux.modeleArchitecture")}
              className="w-full rounded border border-outline bg-surface-container-low px-3 py-2 text-body-sm text-on-surface"
            >
              <option value="pme-standard">PME / Entreprise standard</option>
              <option value="entreprise-etendue">Entreprise étendue</option>
              <option value="campus">Campus</option>
              <option value="personnalise">Personnalisé</option>
            </select>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-info/40 dark:bg-blue-950/30">
          <div className="mb-2 flex items-center gap-2 text-label-sm font-label font-semibold text-blue-700 dark:text-blue-300">
            <Info className="h-4 w-4" aria-hidden="true" />
            Conseils personnalisés
          </div>

          <ul className="space-y-1 text-body-sm text-blue-900 dark:text-blue-200">
            {conseils.map((conseil) => (
              <li key={conseil}>{conseil}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-lg border-2 border-accent/40 bg-surface-container p-6 shadow-xl">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-outline pb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">
              2. Segmentation VLANs &amp; Hôtes (VLSM)
            </h2>

            <p className="mt-1 text-body-sm text-outline-variant">
              Ajoute, supprime et configure tes sous-réseaux. Le plan VLSM est
              calculé en temps réel.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const identifiantsUtilises = (valeurs.vlans ?? []).map(
                (vlan) => vlan.id,
              );

              let nouvelIdentifiant = 10;

              while (identifiantsUtilises.includes(nouvelIdentifiant)) {
                nouvelIdentifiant += 10;
              }

              append({
                id: nouvelIdentifiant,
                nom: `VLAN_NOUVEAU_${nouvelIdentifiant}`,
                type: "utilisateurs",
                nombreHotes: 10,
                dhcpActive: true,
              });
            }}
            className="inline-flex items-center gap-2 rounded border border-outline bg-surface-container-high px-3.5 py-2 text-label-md font-label text-accent transition-colors hover:border-accent"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter un VLAN
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((champ, index) => (
            <div
              key={champ.id}
              className="rounded-lg border border-outline bg-surface-container-low p-5"
            >
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-20">
                  <label className="mb-1 block text-label-xs font-label text-outline-variant">
                    ID VLAN
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={4094}
                    {...register(`vlans.${index}.id`, {
                      valueAsNumber: true,
                    })}
                    placeholder="10"
                    className="w-full rounded border border-outline bg-surface-container px-2.5 py-1.5 font-mono text-code-md text-accent"
                  />
                </div>

                <div className="w-48">
                  <label className="mb-1 block text-label-xs font-label text-outline-variant">
                    Nom du VLAN
                  </label>

                  <input
                    {...register(`vlans.${index}.nom`)}
                    maxLength={32}
                    placeholder="Exemple : VLAN_UTILISATEURS"
                    className="w-full rounded border border-outline bg-surface-container px-2.5 py-1.5 font-mono text-body-sm text-on-surface"
                  />
                </div>

                <div className="w-40">
                  <label className="mb-1 block text-label-xs font-label text-outline-variant">
                    Type de trafic
                  </label>

                  <select
                    {...register(`vlans.${index}.type`)}
                    className="w-full rounded border border-outline bg-surface-container px-2.5 py-1.5 text-body-sm text-on-surface"
                  >
                    <option value="utilisateurs">Utilisateurs</option>
                    <option value="serveurs">Serveurs</option>
                    <option value="dmz">DMZ</option>
                    <option value="management">Management</option>
                    <option value="invites">Invités</option>
                    <option value="voip">VoIP</option>
                    <option value="imprimantes">Imprimantes</option>
                  </select>
                </div>

                <div className="w-28">
                  <label className="mb-1 block text-label-xs font-label text-outline-variant">
                    Postes / Hôtes
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={100000}
                    {...register(`vlans.${index}.nombreHotes`, {
                      valueAsNumber: true,
                    })}
                    placeholder="50"
                    className="w-full rounded border border-outline bg-surface-container px-2.5 py-1.5 font-mono text-code-md text-on-surface"
                  />
                </div>

                <label className="flex items-center gap-2 text-label-sm font-label text-on-surface">
                  <input
                    type="checkbox"
                    {...register(`vlans.${index}.dhcpActive`)}
                    className="rounded border-outline bg-surface-container text-accent"
                  />
                  DHCP
                </label>

                <button
                  type="button"
                  aria-label="Supprimer le VLAN"
                  onClick={() => remove(index)}
                  className="rounded p-1.5 text-outline-variant transition-colors hover:bg-surface-container hover:text-error"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {errors.vlans?.[index] ? (
                <p className="mt-2 text-body-sm text-error">
                  Vérifie les informations de ce VLAN.
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {planVlsm ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/40">
            <p className="text-body-sm text-emerald-800 dark:text-emerald-200">              {planVlsm.sousReseaux.length} sous-réseau(s) calculé(s).{" "}
              {planVlsm.totalHotesRequis} hôtes requis,{" "}
              {planVlsm.totalHotesAlloues} hôtes alloués.
            </p>

            {planVlsm.conflits.length > 0 ? (
              <ul className="mt-2 space-y-1 text-body-sm text-red-700 dark:text-red-300">
                {planVlsm.conflits.map((conflit, index) => (
                  <li key={`conflit-${index}-${conflit}`}>{conflit}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-outline bg-surface-container p-6">
        <h2 className="mb-6 border-b border-outline pb-4 text-headline-sm font-bold text-on-surface">
          3. Politiques de sécurité &amp; filtrage
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="flex items-center justify-between gap-4 rounded-lg border border-outline bg-surface-container-low p-4">
            <span className="text-body-md font-semibold text-on-surface">
              Isolation stricte de la DMZ
            </span>

            <input
              type="checkbox"
              {...register("securite.isolationDmz")}
              className="rounded border-outline bg-surface-container text-accent"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-lg border border-outline bg-surface-container-low p-4">
            <span className="text-body-md font-semibold text-on-surface">
              ACL inter-VLAN restrictives
            </span>

            <input
              type="checkbox"
              {...register("securite.aclInterVlanRestrictives")}
              className="rounded border-outline bg-surface-container text-accent"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-lg border border-outline bg-surface-container-low p-4">
            <span className="text-body-md font-semibold text-on-surface">
              Port Security Cisco
            </span>

            <input
              type="checkbox"
              {...register("securite.portSecurityCisco")}
              className="rounded border-outline bg-surface-container text-accent"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-lg border border-outline bg-surface-container-low p-4">
            <span className="text-body-md font-semibold text-on-surface">
              Désactivation des ports inutilisés
            </span>

            <input
              type="checkbox"
              {...register("securite.desactivationPortsInutilises")}
              className="rounded border-outline bg-surface-container text-accent"
            />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-outline bg-surface-container p-6">
        <h2 className="mb-6 border-b border-outline pb-4 text-headline-sm font-bold text-on-surface">
          4. Équipements &amp; fichiers de sortie
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-label-sm font-label text-outline-variant">
              Nom du switch cœur
            </label>

            <input
              {...register("equipements.nomSwitchCoeur")}
              maxLength={64}
              placeholder="Exemple : SW-CORE-01"
              className="w-full rounded border border-outline bg-surface-container-low px-3 py-2 font-mono text-body-sm text-on-surface"
            />
          </div>

          <div>
            <label className="mb-1 block text-label-sm font-label text-outline-variant">
              Nom du routeur / pare-feu
            </label>

            <input
              {...register("equipements.nomRouteurPareFeu")}
              maxLength={64}
              placeholder="Exemple : PFSENSE-FW01"
              className="w-full rounded border border-outline bg-surface-container-low px-3 py-2 font-mono text-body-sm text-on-surface"
            />
          </div>

          <div>
            <label className="mb-1 block text-label-sm font-label text-outline-variant">
              Nombre de ports switch
            </label>

            <select
              {...register("equipements.modelePortsSwitch")}
              className="w-full rounded border border-outline bg-surface-container-low px-3 py-2 text-body-sm text-on-surface"
            >
              <option value="24-gigabit-4-sfp-plus">
                24 ports Gigabit + 4 SFP+
              </option>
              <option value="48-gigabit-4-sfp-plus">
                48 ports Gigabit + 4 SFP+
              </option>
              <option value="8-compact">8 ports compact</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline pt-6">
        <button
          type="button"
          onClick={sauvegarderManuellement}
          className="inline-flex items-center gap-2 rounded border border-outline bg-surface-container px-4 py-2 text-label-md font-label text-outline-variant transition-colors hover:text-on-surface"
        >
          {brouillonEnregistre ? (
            <Check className="h-4 w-4 text-success" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}

          {brouillonEnregistre ? "Brouillon enregistré" : "Sauvegarder le brouillon"}
        </button>

        <button
          type="submit"
          className="rounded bg-accent px-6 py-2.5 text-label-lg font-label font-semibold text-on-accent shadow-lg transition-colors hover:bg-cyan-300"
        >
          Générer les configurations
        </button>
      </div>
    </form>
  );
}