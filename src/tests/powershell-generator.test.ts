import { describe, expect, it } from "vitest";

import { calculerPlanVlsm } from "@/lib/network/vlsm";
import { genererScriptPowerShell } from "@/lib/generators/powershell";

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
    artefacts: ["powershell-dhcp"],
  },
};

describe("genererScriptPowerShell", () => {
  it("génère une étendue DHCP pour le VLAN utilisateurs", () => {
    const plan = calculerPlanVlsm("192.168.0.0", 16, configuration.vlans);

    const script = genererScriptPowerShell({
      configuration,
      planVlsm: plan,
    });

    expect(script).toContain("Import-Module DhcpServer");
    expect(script).toContain('Add-DhcpServerv4Scope');
    expect(script).toContain("-StartRange 192.168.0.2");
    expect(script).toContain("-EndRange 192.168.0.62");
    expect(script).toContain("-SubnetMask 255.255.255.192");
  });

  it("configure la passerelle et le serveur DNS", () => {
    const plan = calculerPlanVlsm("192.168.0.0", 16, configuration.vlans);

    const script = genererScriptPowerShell({
      configuration,
      planVlsm: plan,
    });

    expect(script).toContain("-OptionId 3");
    expect(script).toContain("-Value 192.168.0.1");
    expect(script).toContain("-OptionId 6");
  });

  it("ne génère pas d’étendue pour un VLAN statique", () => {
    const plan = calculerPlanVlsm("192.168.0.0", 16, configuration.vlans);

    const script = genererScriptPowerShell({
      configuration,
      planVlsm: plan,
    });

    expect(script).not.toContain("VLAN_SERVEURS");
  });
});