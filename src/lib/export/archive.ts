import JSZip from "jszip";

interface FichierExport {
  nom: string;
  contenu: string;
}

export async function telechargerArchiveZip(
  nomProjet: string,
  fichiers: FichierExport[],
): Promise<void> {
  const archive = new JSZip();
  const dossier = `netforge-${nomProjet.toLowerCase()}`;

  for (const fichier of fichiers) {
    archive.file(`${dossier}/${fichier.nom}`, fichier.contenu);
  }

  const contenuArchive = await archive.generateAsync({
    type: "blob",
  });

  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(contenuArchive);
  lien.download = `${dossier}.zip`;

  document.body.appendChild(lien);
  lien.click();
  lien.remove();

  URL.revokeObjectURL(lien.href);
}