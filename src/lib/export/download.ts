export interface OptionsTelechargement {
  contenu: string;
  nomFichier: string;
  typeMime: string;
}

export function telechargerFichierTexte({
  contenu,
  nomFichier,
  typeMime,
}: OptionsTelechargement): void {
  const blob = new Blob([contenu], {
    type: typeMime,
  });

  const urlObjet = URL.createObjectURL(blob);

  const lien = document.createElement("a");
  lien.href = urlObjet;
  lien.download = nomFichier;

  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);

  URL.revokeObjectURL(urlObjet);
}