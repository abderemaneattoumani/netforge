export interface AdresseIPv4 {
  octets: [number, number, number, number];
}

export function convertirAdresseEnNombre(adresse: string): number | null {
  const parties = adresse.split(".");

  if (parties.length !== 4) {
    return null;
  }

  const octets: number[] = [];

  for (const partie of parties) {
    if (!/^\d{1,3}$/.test(partie)) {
      return null;
    }

    const octet = Number(partie);

    if (octet < 0 || octet > 255) {
      return null;
    }

    octets.push(octet);
  }

  return (
    ((octets[0] << 24) |
      (octets[1] << 16) |
      (octets[2] << 8) |
      octets[3]) >>>
    0
  );
}

export function convertirNombreEnAdresse(nombre: number): string {
  const octet1 = (nombre >>> 24) & 255;
  const octet2 = (nombre >>> 16) & 255;
  const octet3 = (nombre >>> 8) & 255;
  const octet4 = nombre & 255;

  return `${octet1}.${octet2}.${octet3}.${octet4}`;
}

export function convertirMasqueEnPrefixe(masque: string): number | null {
  const valeurMasque = convertirAdresseEnNombre(masque);

  if (valeurMasque === null) {
    return null;
  }

  if ((~valeurMasque & (valeurMasque + 1)) !== 0) {
    return null;
  }

  let prefixe = 0;
  let masqueRestant = valeurMasque;

  while (masqueRestant > 0) {
    if ((masqueRestant & 1) === 1) {
      prefixe += 1;
    }

    masqueRestant = masqueRestant >>> 1;
  }

  return prefixe;
}

export function convertirPrefixeEnMasque(prefixe: number): string {
  if (prefixe < 0 || prefixe > 32) {
    throw new Error("Le préfixe CIDR doit être compris entre 0 et 32.");
  }

  const masque = prefixe === 0 ? 0 : (0xffffffff << (32 - prefixe)) >>> 0;

  return convertirNombreEnAdresse(masque);
}

export function calculerMasqueReseau(
  adresse: number,
  prefixe: number,
): number {
  const masque = prefixe === 0 ? 0 : (0xffffffff << (32 - prefixe)) >>> 0;

  return (adresse & masque) >>> 0;
}

export function calculerAdresseDiffusion(
  adresseReseau: number,
  prefixe: number,
): number {
  const taille = 2 ** (32 - prefixe);

  return (adresseReseau + taille - 1) >>> 0;
}

export function calculerCapaciteTotale(prefixe: number): number {
  return 2 ** (32 - prefixe);
}

export function calculerHotesUtilisables(prefixe: number): number {
  const capacite = calculerCapaciteTotale(prefixe);

  if (capacite < 2) {
    return 0;
  }

  return capacite - 2;
}

export function calculerPrefixeMinimal(nombreHotes: number): number {
  if (!Number.isInteger(nombreHotes) || nombreHotes < 1) {
    throw new Error("Le nombre d’hôtes doit être un entier supérieur à 0.");
  }

  const adressesRequises = nombreHotes + 2;

  let capacite = 2;
  let prefixe = 31;

  while (capacite < adressesRequises) {
    capacite = capacite * 2;
    prefixe = prefixe - 1;
  }

  return prefixe;
}