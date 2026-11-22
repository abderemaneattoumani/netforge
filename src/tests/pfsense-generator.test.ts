import { describe, expect, it } from "vitest";

import { genererReglesPfSense } from "@/lib/generators/pfsense";
import { calculerPlanVlsm } from "@/lib/network/vlsm";

import type { NetworkInput } from "@/types/network";

const configurationTest: NetworkInput = {
  parametresGlobaux: {
    nomProjet: "Refonte-LAN-Siege",
    reseauParent: "192.168.0.0/16",
    domaineReseau: "entreprise.local",
    modeleArchitecture: "pme-standard",
  },
  vlans: [
    {
      id: 10,
      nom: "VLAN_UTILISATEURS",
      type: "utilisateurs",
      nombreHotes: 50,
      dhcpActive: true,
    },
    {
      id: 20,
      nom: "VLAN_SERVEURS",
      type: "serveurs",
      nombreHotes: 1,
      dhcpActive: false,
    },
    {
      id: 30,
      nom: "VLAN_DMZ_PUBLIQUE",
      type: "dmz",
      nombreHotes: 1,
      dhcpActive: false,
    },
  ],
  securite: {
    profil: "recommande",
    isolationDmz: true,
    aclInterVlanRestrictives: true,
    portSecurityCisco: true,
    desactivationPortsInutilises: true,
  },
  equipements: {
    nomSwitchCoeur: "SW-CORE-01",
    nomRouteurPareFeu: "PFSENSE-FW01",
    modelePortsSwitch: "24-gigabit-4-sfp-plus",
  },
  sorties: {
    artefacts: [
      "cisco-ios",
      "pfsense",
      "powershell-dhcp",
      "documentation-pdf",
    ],
  },
};

describe("genererReglesPfSense", () => {
  it("génère une règle DNS depuis le VLAN utilisateurs", () => {
    const planVlsm = calculerPlanVlsm("192.168.0.0", 16, configurationTest.vlans);

    const regles = genererReglesPfSense({
      configuration: configurationTest,
      planVlsm,
    });

    const regleDns = regles.find(
      (regle) => regle.id === "dns-10-vers-serveurs",
    );

    expect(regleDns).toBeDefined();
    expect(regleDns?.action).toBe("pass");
    expect(regleDns?.protocole).toBe("udp");
    expect(regleDns?.interface).toBe("VLAN10");
    expect(regleDns?.portDestination).toBe("53 (DNS)");
  });

  it("génère l’isolation de la DMZ", () => {
    const planVlsm = calculerPlanVlsm("192.168.0.0", 16, configurationTest.vlans);

    const regles = genererReglesPfSense({
      configuration: configurationTest,
      planVlsm,
    });

    const regleIsolation = regles.find(
      (regle) => regle.id === "isolation-dmz-30",
    );

    expect(regleIsolation).toBeDefined();
    expect(regleIsolation?.action).toBe("block");
    expect(regleIsolation?.destination).toBe("RFC1918_Subnets");
    expect(regleIsolation?.interface).toBe("VLAN30");
  });

  it("génère la publication HTTPS de la DMZ", () => {
    const planVlsm = calculerPlanVlsm("192.168.0.0", 16, configurationTest.vlans);

    const regles = genererReglesPfSense({
      configuration: configurationTest,
      planVlsm,
    });

    const regleWeb = regles.find(
      (regle) => regle.id === "publication-web-30",
    );

    expect(regleWeb).toBeDefined();
    expect(regleWeb?.portDestination).toBe("443 (HTTPS)");
    expect(regleWeb?.destination).toBeDefined();
  });

  it("génère des règles pour plusieurs VLANs dynamiquement", () => {
    const configurationMultiVlans: NetworkInput = {
      ...configurationTest,
      vlans: [
        ...configurationTest.vlans,
        {
          id: 40,
          nom: "VLAN_INVITES",
          type: "invites",
          nombreHotes: 10,
          dhcpActive: true,
        },
        {
          id: 50,
          nom: "VLAN_VOIP",
          type: "voip",
          nombreHotes: 10,
          dhcpActive: true,
        },
      ],
    };

    const planVlsm = calculerPlanVlsm(
      "192.168.0.0",
      16,
      configurationMultiVlans.vlans,
    );

    const regles = genererReglesPfSense({
      configuration: configurationMultiVlans,
      planVlsm,
    });

    expect(
      regles.some((regle) => regle.id === "internet-invites-40"),
    ).toBe(true);

    expect(
      regles.some((regle) => regle.id === "isolation-invites-40"),
    ).toBe(true);

    expect(regles.some((regle) => regle.id === "sip-50")).toBe(true);
    expect(regles.some((regle) => regle.id === "rtp-50")).toBe(true);
  });
});