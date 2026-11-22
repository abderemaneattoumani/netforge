import type { NetworkInputValide } from "@/lib/validation/network-schema";

import type {
  AddressingPlan
} from "@/types/network";

interface ParametresDocumentation {
  configuration: NetworkInputValide;
  planVlsm: AddressingPlan;
}

export function genererDocumentationMarkdown({
  configuration,
  planVlsm,
}: ParametresDocumentation): string {
  const lignes: string[] = [];

  const parametres = configuration.parametresGlobaux;

  lignes.push(`# Dossier d’Architecture Technique — ${parametres.nomProjet}`);
  lignes.push("");
  lignes.push(
    "Ce document décrit l’adressage, la segmentation et les règles de sécurité générées par NetForge.",
  );
  lignes.push("");
  lignes.push("## 1. Paramètres généraux");
  lignes.push("");
  lignes.push(`- **Nom du projet :** ${parametres.nomProjet}`);
  lignes.push(`- **Réseau parent :** ${parametres.reseauParent}`);
  lignes.push(`- **Domaine réseau :** ${parametres.domaineReseau}`);
  lignes.push(`- **Modèle d’architecture :** ${parametres.modeleArchitecture}`);
  lignes.push("");
  lignes.push("## 2. Plan d’adressage VLSM");
  lignes.push("");
  lignes.push(
    `Le réseau parent ${planVlsm.reseauParent}/${planVlsm.prefixeParent} est segmenté en ${planVlsm.sousReseaux.length} sous-réseau(x).`,
  );
  lignes.push("");
  lignes.push(
    `Total d’hôtes requis : **${planVlsm.totalHotesRequis}**. Total d’hôtes alloués : **${planVlsm.totalHotesAlloues}**.`,
  );
  lignes.push("");
  lignes.push("| VLAN | Nom | Type | Sous-réseau | Masque | Passerelle | Mode |");
  lignes.push("|---|---|---|---|---|---|---|");

  for (const sousReseau of planVlsm.sousReseaux) {
    lignes.push(
      `| ${sousReseau.vlanId} | ${sousReseau.nom} | ${sousReseau.type} | ${sousReseau.adresseReseau}/${sousReseau.prefixe} | ${sousReseau.masque} | ${sousReseau.passerelle} | ${sousReseau.modeAttribution} |`,
    );
  }

  lignes.push("");
  lignes.push("## 3. Sécurité et filtrage");
  lignes.push("");
  lignes.push(
    `- Profil de sécurité : **${configuration.securite.profil}**`,
  );
  lignes.push(
    `- Isolation stricte de la DMZ : **${configuration.securite.isolationDmz ? "activée" : "désactivée"}**`,
  );
  lignes.push(
    `- ACL inter-VLAN restrictives : **${configuration.securite.aclInterVlanRestrictives ? "activées" : "désactivées"}**`,
  );
  lignes.push(
    `- Port Security Cisco : **${configuration.securite.portSecurityCisco ? "activé" : "désactivé"}**`,
  );
  lignes.push(
    `- Désactivation des ports inutilisés : **${configuration.securite.desactivationPortsInutilises ? "activée" : "désactivée"}**`,
  );
  lignes.push("");
  lignes.push("## 4. Équipements");
  lignes.push("");
  lignes.push(
    `- Switch cœur : **${configuration.equipements.nomSwitchCoeur}**`,
  );
  lignes.push(
    `- Routeur / pare-feu : **${configuration.equipements.nomRouteurPareFeu}**`,
  );
  lignes.push(
    `- Modèle de ports : **${configuration.equipements.modelePortsSwitch}**`,
  );
  lignes.push("");
  lignes.push("## 5. Consignes d’exploitation");
  lignes.push("");
  lignes.push(
    "Toute configuration générée doit être validée dans un environnement de laboratoire isolé, tel que Cisco Packet Tracer, GNS3 ou une maquette physique, avant tout déploiement en production.",
  );
  lignes.push("");
  lignes.push(
    "Le VLAN natif du trunk 802.1Q doit rester isolé du VLAN 1 et être attribué à un VLAN de parc, par exemple le VLAN 999.",
  );

  if (planVlsm.conflits.length > 0) {
    lignes.push("");
    lignes.push("## 6. Conflits détectés");
    lignes.push("");

    for (const conflit of planVlsm.conflits) {
      lignes.push(`- ${conflit}`);
    }
  }

  return lignes.join("\n");
}