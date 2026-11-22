import {
  calculerAdresseDiffusion,
  calculerCapaciteTotale,
  calculerHotesUtilisables,
  calculerMasqueReseau,
  calculerPrefixeMinimal,
  convertirAdresseEnNombre,
  convertirNombreEnAdresse,
  convertirPrefixeEnMasque,
} from "./ip";

import type { AddressingPlan, Subnet, VlanInput } from "@/types/network";

interface SousReseauCalcule {
  vlan: VlanInput;
  adresseReseau: number;
  prefixe: number;
}

export function calculerPlanVlsm(
  reseauParent: string,
  prefixeParent: number,
  vlans: VlanInput[],
): AddressingPlan {
  const adresseParent = convertirAdresseEnNombre(reseauParent);

  if (adresseParent === null) {
    throw new Error("L’adresse du réseau parent est invalide.");
  }

  if (prefixeParent < 0 || prefixeParent > 32) {
    throw new Error("Le préfixe du réseau parent est invalide.");
  }

  if (vlans.length === 0) {
    throw new Error("Au moins un VLAN doit être configuré.");
  }

  const identifiantsVus = new Set<number>();
  const conflits: string[] = [];

  for (const vlan of vlans) {
    if (identifiantsVus.has(vlan.id)) {
      conflits.push(
        `L’identifiant VLAN ${vlan.id} est utilisé plusieurs fois.`,
      );
    }

    identifiantsVus.add(vlan.id);
  }

  const vlansTries = [...vlans].sort(
    (vlanA, vlanB) => vlanB.nombreHotes - vlanA.nombreHotes,
  );

  const sousReseauxCalcules: SousReseauCalcule[] = [];
  let adresseCourante = adresseParent;

  for (const vlan of vlansTries) {
    const prefixe = calculerPrefixeMinimal(vlan.nombreHotes);

    if (prefixe < prefixeParent) {
      conflits.push(
        `Le VLAN ${vlan.id} (${vlan.nom}) nécessite un espace plus grand que le réseau parent /${prefixeParent}.`,
      );

      continue;
    }

    const masqueParent = calculerMasqueReseau(
      adresseCourante,
      prefixeParent,
    );

    const finReseauParent =
      (adresseParent + calculerCapaciteTotale(prefixeParent) - 1) >>> 0;

    if (
      adresseCourante < masqueParent ||
      adresseCourante > finReseauParent
    ) {
      conflits.push(
        `Espace d’adressage insuffisant pour le VLAN ${vlan.id} (${vlan.nom}).`,
      );

      continue;
    }

    sousReseauxCalcules.push({
      vlan,
      adresseReseau: adresseCourante,
      prefixe,
    });

    adresseCourante =
      (adresseCourante + calculerCapaciteTotale(prefixe)) >>> 0;
  }

  const sousReseaux: Subnet[] = sousReseauxCalcules.map((sousReseau) => {
    const diffusion = calculerAdresseDiffusion(
      sousReseau.adresseReseau,
      sousReseau.prefixe,
    );

    const premiereAdresse = sousReseau.adresseReseau + 1;
    const derniereAdresse = diffusion - 1;

    const sousReseauFinal: Subnet = {
      vlanId: sousReseau.vlan.id,
      nom: sousReseau.vlan.nom,
      type: sousReseau.vlan.type,
      adresseReseau: convertirNombreEnAdresse(sousReseau.adresseReseau),
      masque: convertirPrefixeEnMasque(sousReseau.prefixe),
      prefixe: sousReseau.prefixe,
      passerelle: convertirNombreEnAdresse(premiereAdresse),
      premiereAdresseUtilisable: convertirNombreEnAdresse(premiereAdresse),
      derniereAdresseUtilisable: convertirNombreEnAdresse(derniereAdresse),
      adresseDiffusion: convertirNombreEnAdresse(diffusion),
      capaciteTotale: calculerCapaciteTotale(sousReseau.prefixe),
      hotesUtilisables: calculerHotesUtilisables(sousReseau.prefixe),
      modeAttribution: sousReseau.vlan.dhcpActive ? "dhcp" : "statique",
      couleur: obtenirCouleurVlan(sousReseau.vlan.id),
    };

    if (
      sousReseau.vlan.dhcpActive &&
      sousReseau.prefixe <= 30 &&
      derniereAdresse > premiereAdresse
    ) {
      sousReseauFinal.plageDhcp = {
        debut: convertirNombreEnAdresse(premiereAdresse + 1),
        fin: convertirNombreEnAdresse(derniereAdresse),
      };
    }

    return sousReseauFinal;
  });

  const sousReseauxParVlanId = [...sousReseaux].sort(
    (sousReseauA, sousReseauB) => sousReseauA.vlanId - sousReseauB.vlanId,
  );

  const totalHotesRequis = vlans.reduce(
    (total, vlan) => total + vlan.nombreHotes,
    0,
  );

  const totalHotesAlloues = sousReseaux.reduce(
    (total, sousReseau) => total + sousReseau.hotesUtilisables,
    0,
  );

  return {
    reseauParent,
    prefixeParent,
    sousReseaux: sousReseauxParVlanId,
    totalHotesRequis,
    totalHotesAlloues,
    conflits,
  };
}

function obtenirCouleurVlan(vlanId: number): string {
  const couleurs = [
    "#22d3ee",
    "#3b82f6",
    "#f59e0b",
    "#10b981",
    "#a855f7",
    "#ef4444",
    "#ec4899",
    "#14b8a6",
    "#8b5cf6",
    "#f97316",
    "#84cc16",
    "#06b6d4",
    "#eab308",
    "#f43f5e",
    "#6366f1",
    "#2dd4bf",
  ];

  return couleurs[vlanId % couleurs.length];
}