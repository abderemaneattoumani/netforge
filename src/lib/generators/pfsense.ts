import type { NetworkInputValide } from "@/lib/validation/network-schema";

import type {
  AddressingPlan,
  FirewallRule,
  Subnet,
} from "@/types/network";

interface ParametresPfSense {
  configuration: NetworkInputValide;
  planVlsm: AddressingPlan;
}

function obtenirSousReseau(
  planVlsm: AddressingPlan,
  type: Subnet["type"],
): Subnet | undefined {
  return planVlsm.sousReseaux.find(
    (sousReseau) => sousReseau.type === type,
  );
}

export function genererReglesPfSense({
  configuration,
  planVlsm,
}: ParametresPfSense): FirewallRule[] {
  const regles: FirewallRule[] = [];

  const sousReseauServeurs = obtenirSousReseau(planVlsm, "serveurs");
  const sousReseauDmz = obtenirSousReseau(planVlsm, "dmz");

  const premierSousReseauUtilisateurs = planVlsm.sousReseaux.find(
    (sousReseau) => sousReseau.type === "utilisateurs",
  );

  for (const sousReseau of planVlsm.sousReseaux) {
    const interfaceVlan = `VLAN${sousReseau.vlanId}`;
    const sourceVlan = `${interfaceVlan} net`;

    if (sousReseau.type === "utilisateurs") {
      if (
        sousReseauServeurs &&
        sousReseau.vlanId === premierSousReseauUtilisateurs?.vlanId
      ) {
        regles.push({
          id: `dns-${sousReseau.vlanId}-vers-serveurs`,
          interface: interfaceVlan,
          action: "pass",
          protocole: "udp",
          source: sourceVlan,
          portSource: "*",
          destination: sousReseauServeurs.passerelle,
          portDestination: "53 (DNS)",
          description: `Résolution DNS depuis ${sousReseau.nom}`,
        });
      }

      regles.push({
        id: `internet-${sousReseau.vlanId}`,
        interface: interfaceVlan,
        action: "pass",
        protocole: "tcp",
        source: sourceVlan,
        portSource: "*",
        destination: "WAN net",
        portDestination: "80, 443",
        description: `Navigation Internet autorisée pour ${sousReseau.nom}`,
      });

      if (
        configuration.securite.aclInterVlanRestrictives &&
        sousReseauServeurs &&
        sousReseau.vlanId === premierSousReseauUtilisateurs?.vlanId
      ) {
        regles.push({
          id: `bureautique-${sousReseau.vlanId}-vers-serveurs`,
          interface: interfaceVlan,
          action: "pass",
          protocole: "tcp",
          source: sourceVlan,
          portSource: "*",
          destination: `VLAN${sousReseauServeurs.vlanId} net`,
          portDestination: "445, 3389",
          description: `Accès bureautique restreint depuis ${sousReseau.nom}`,
        });
      }
    }

    if (sousReseau.type === "serveurs") {
      regles.push({
        id: `administration-${sousReseau.vlanId}`,
        interface: interfaceVlan,
        action: "pass",
        protocole: "tcp",
        source: sourceVlan,
        portSource: "*",
        destination: sousReseau.passerelle,
        portDestination: "22, 443",
        description: `Administration SSH et HTTPS de ${sousReseau.nom}`,
      });

      if (configuration.securite.aclInterVlanRestrictives) {
        regles.push({
          id: `protection-serveurs-${sousReseau.vlanId}`,
          interface: interfaceVlan,
          action: "block",
          protocole: "any",
          source: "RFC1918_Subnets",
          portSource: "*",
          destination: sourceVlan,
          portDestination: "*",
          description: `Accès inter-VLAN restreint vers ${sousReseau.nom}`,
        });
      }
    }

    if (sousReseau.type === "management") {
      regles.push({
        id: `administration-reseau-${sousReseau.vlanId}`,
        interface: interfaceVlan,
        action: "pass",
        protocole: "tcp",
        source: sourceVlan,
        portSource: "*",
        destination: sousReseau.passerelle,
        portDestination: "22, 443",
        description: `Administration sécurisée du réseau depuis ${sousReseau.nom}`,
      });

      if (configuration.securite.aclInterVlanRestrictives) {
        regles.push({
          id: `protection-management-${sousReseau.vlanId}`,
          interface: interfaceVlan,
          action: "block",
          protocole: "any",
          source: "RFC1918_Subnets",
          portSource: "*",
          destination: sourceVlan,
          portDestination: "*",
          description: `Accès au VLAN management limité depuis ${sousReseau.nom}`,
        });
      }
    }

    if (sousReseau.type === "invites") {
      regles.push({
        id: `internet-invites-${sousReseau.vlanId}`,
        interface: interfaceVlan,
        action: "pass",
        protocole: "tcp",
        source: sourceVlan,
        portSource: "*",
        destination: "WAN net",
        portDestination: "80, 443",
        description: `Accès Internet limité pour ${sousReseau.nom}`,
      });

      regles.push({
        id: `isolation-invites-${sousReseau.vlanId}`,
        interface: interfaceVlan,
        action: "block",
        protocole: "any",
        source: sourceVlan,
        portSource: "*",
        destination: "RFC1918_Subnets",
        portDestination: "*",
        description: `Isolation du réseau invités ${sousReseau.nom}`,
      });
    }

    if (sousReseau.type === "voip") {
      regles.push({
        id: `sip-${sousReseau.vlanId}`,
        interface: interfaceVlan,
        action: "pass",
        protocole: "udp",
        source: sourceVlan,
        portSource: "*",
        destination: "WAN net",
        portDestination: "5060 (SIP)",
        description: `Signalisation SIP pour ${sousReseau.nom}`,
      });

      regles.push({
        id: `rtp-${sousReseau.vlanId}`,
        interface: interfaceVlan,
        action: "pass",
        protocole: "udp",
        source: sourceVlan,
        portSource: "*",
        destination: "WAN net",
        portDestination: "10000-20000 (RTP)",
        description: `Flux audio RTP pour ${sousReseau.nom}`,
      });
    }

    if (sousReseau.type === "imprimantes") {
      if (configuration.securite.aclInterVlanRestrictives) {
        const sousReseauUtilisateurs = obtenirSousReseau(
          planVlsm,
          "utilisateurs",
        );

        if (sousReseauUtilisateurs) {
          regles.push({
            id: `impression-${sousReseauUtilisateurs.vlanId}-vers-${sousReseau.vlanId}`,
            interface: `VLAN${sousReseauUtilisateurs.vlanId}`,
            action: "pass",
            protocole: "tcp",
            source: `VLAN${sousReseauUtilisateurs.vlanId} net`,
            portSource: "*",
            destination: sourceVlan,
            portDestination: "9100, 631",
            description: `Impression depuis les utilisateurs vers ${sousReseau.nom}`,
          });
        }
      }

      regles.push({
        id: `isolation-imprimantes-${sousReseau.vlanId}`,
        interface: interfaceVlan,
        action: "block",
        protocole: "any",
        source: sourceVlan,
        portSource: "*",
        destination: "WAN net",
        portDestination: "*",
        description: `Accès Internet bloqué pour ${sousReseau.nom}`,
      });
    }

    if (sousReseau.type === "dmz") {
      if (configuration.securite.isolationDmz) {
        regles.push({
          id: `isolation-dmz-${sousReseau.vlanId}`,
          interface: interfaceVlan,
          action: "block",
          protocole: "any",
          source: sourceVlan,
          portSource: "*",
          destination: "RFC1918_Subnets",
          portDestination: "*",
          description: `Isolation totale de ${sousReseau.nom} vers le LAN et les serveurs`,
        });
      }

      regles.push({
        id: `publication-web-${sousReseau.vlanId}`,
        interface: "WAN",
        action: "pass",
        protocole: "tcp",
        source: "*",
        portSource: "*",
        destination: sousReseau.passerelle,
        portDestination: "443 (HTTPS)",
        description: `Publication HTTPS du serveur situé dans ${sousReseau.nom}`,
      });
    }
  }

  return regles;
}