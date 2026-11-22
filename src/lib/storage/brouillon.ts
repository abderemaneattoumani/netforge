
import { networkInputSchema } from "@/lib/validation/network-schema";

import type { NetworkInputValide } from "@/lib/validation/network-schema";

import type { NetworkInput } from "@/types/network";

const CLE_BROUILLON = "netforge:brouillon-configuration";

export function enregistrerBrouillon(configuration: NetworkInput): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      CLE_BROUILLON,
      JSON.stringify(configuration),
    );
  } catch {
    return;
  }
}

export function lireBrouillon(): NetworkInputValide | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const contenu = window.localStorage.getItem(CLE_BROUILLON);

    if (!contenu) {
      return null;
    }

    const configurationBrute = JSON.parse(contenu) as unknown;
    const resultat = networkInputSchema.safeParse(configurationBrute);

    if (!resultat.success) {
      return null;
    }

    return resultat.data;
  } catch {
    return null;
  }
}

export function supprimerBrouillon(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(CLE_BROUILLON);
  } catch {
    return;
  }
}