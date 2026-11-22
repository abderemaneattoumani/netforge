import {
  networkInputSchema,
  type NetworkInputValide,
} from "@/lib/validation/network-schema";

import type { NetworkInput } from "@/types/network";

export function encoderConfiguration(
  configuration: NetworkInput,
): string {
  return btoa(JSON.stringify(configuration));
}

export function decoderConfiguration(
  configurationEncodee: string,
): NetworkInputValide | null {
  try {
    const configurationJson = atob(configurationEncodee);
    const configurationBrute = JSON.parse(configurationJson) as unknown;

    const resultat = networkInputSchema.safeParse(configurationBrute);

    if (!resultat.success) {
      return null;
    }

    return resultat.data;
  } catch {
    return null;
  }
}

export function construireUrlResultats(
  configuration: NetworkInput,
): string {
  const configurationEncodee = encoderConfiguration(configuration);

  return `/outil/resultats?config=${encodeURIComponent(configurationEncodee)}`;
}