import { convertirAdresseEnNombre } from "./ip";

export interface ReseauCidr {
  adresse: string;
  prefixe: number;
}

export function parserReseauCidr(valeur: string): ReseauCidr | null {
  const parties = valeur.split("/");

  if (parties.length !== 2) {
    return null;
  }

  const adresse = parties[0];
  const prefixe = Number(parties[1]);

  if (!Number.isInteger(prefixe) || prefixe < 0 || prefixe > 32) {
    return null;
  }

  if (convertirAdresseEnNombre(adresse) === null) {
    return null;
  }

  return {
    adresse,
    prefixe,
  };
}