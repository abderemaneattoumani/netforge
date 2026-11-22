function normaliserNom(valeur: string): string {
  return valeur
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function obtenirDateFichier(): string {
  const date = new Date();

  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");

  return `${annee}-${mois}-${jour}`;
}

export function genererNomFichier(
  nomProjet: string,
  nomEquipement: string,
  extension: string,
): string {
  const projet = normaliserNom(nomProjet);
  const equipement = normaliserNom(nomEquipement);
  const date = obtenirDateFichier();

  return `${projet}_${equipement}_${date}.${extension}`;
}