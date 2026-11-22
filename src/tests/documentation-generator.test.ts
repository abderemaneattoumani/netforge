import { describe, expect, it } from "vitest";

import { calculerPlanVlsm } from "@/lib/network/vlsm";
import { genererDocumentationMarkdown } from "@/lib/generators/documentation";

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
    artefacts: ["documentation-pdf"],
  },
};

describe("genererDocumentationMarkdown", () => {
  it("génère un titre et les paramètres généraux", () => {
    const plan = calculerPlanVlsm("192.168.0.0", 16, configuration.vlans);

    const documentation = genererDocumentationMarkdown({
      configuration,
      planVlsm: plan,
    });

    expect(documentation).toContain(
      "# Dossier d’Architecture Technique — Refonte-LAN-Siege",
    );
    expect(documentation).toContain("192.168.0.0/16");
    expect(documentation).toContain("entreprise.local");
  });

  it("génère le tableau d’adressage", () => {
    const plan = calculerPlanVlsm("192.168.0.0", 16, configuration.vlans);

    const documentation = genererDocumentationMarkdown({
      configuration,
      planVlsm: plan,
    });

    expect(documentation).toContain("| VLAN | Nom | Type |");
    expect(documentation).toContain("192.168.0.0/26");
    expect(documentation).toContain("192.168.0.1");
  });

  it("signale les conflits détectés", () => {
    const plan = calculerPlanVlsm("192.168.0.0", 30, configuration.vlans);

    const documentation = genererDocumentationMarkdown({
      configuration,
      planVlsm: plan,
    });

    expect(documentation).toContain("## 6. Conflits détectés");
  });
});