import { describe, expect, it } from "vitest";

import { calculerPlanVlsm } from "@/lib/network/vlsm";
import { genererConfigurationCisco } from "@/lib/generators/cisco";

import type { NetworkInput } from "@/types/network";

const configuration: NetworkInput = {
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
    artefacts: ["cisco-ios", "pfsense"],
  },
};

describe("genererConfigurationCisco", () => {
  it("génère les VLANs et les SVI", () => {
    const plan = calculerPlanVlsm("192.168.0.0", 16, configuration.vlans);

    const configurationCisco = genererConfigurationCisco({
      configuration,
      planVlsm: plan,
    });

    expect(configurationCisco).toContain("hostname SW-CORE-01");
    expect(configurationCisco).toContain("vlan 10");
    expect(configurationCisco).toContain("name VLAN_UTILISATEURS");
    expect(configurationCisco).toContain("interface Vlan10");
    expect(configurationCisco).toContain("ip address 192.168.0.1 255.255.255.192");
    expect(configurationCisco).toContain("ip helper-address 192.168.20.2");
  });

  it("génère le trunk 802.1Q avec le VLAN natif 999", () => {
    const plan = calculerPlanVlsm("192.168.0.0", 16, configuration.vlans);

    const configurationCisco = genererConfigurationCisco({
      configuration,
      planVlsm: plan,
    });

    expect(configurationCisco).toContain("switchport mode trunk");
    expect(configurationCisco).toContain("switchport trunk allowed vlan 10,20");
    expect(configurationCisco).toContain("switchport trunk native vlan 999");
  });

  it("génère Port Security uniquement si l’option est activée", () => {
    const plan = calculerPlanVlsm("192.168.0.0", 16, configuration.vlans);

    const configurationCisco = genererConfigurationCisco({
      configuration,
      planVlsm: plan,
    });

    expect(configurationCisco).toContain("switchport port-security");
    expect(configurationCisco).toContain(
      "switchport port-security violation restrict",
    );
  });
});