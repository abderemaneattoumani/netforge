import { describe, expect, it } from "vitest";

import {
  construireUrlResultats,
  decoderConfiguration,
  encoderConfiguration,
} from "@/lib/network/config-codec";

import type { NetworkInput } from "@/types/network";

const configurationValide: NetworkInput = {
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
    artefacts: ["cisco-ios", "pfsense"],
  },
};

describe("encodage de configuration", () => {
  it("encode puis décode une configuration valide", () => {
    const configurationEncodee = encoderConfiguration(configurationValide);
    const configurationDecodee = decoderConfiguration(configurationEncodee);

    expect(configurationDecodee).toEqual(configurationValide);
  });

  it("construit une URL de résultats valide", () => {
    const url = construireUrlResultats(configurationValide);

    expect(url).toMatch(/^\/outil\/resultats\?config=/);
  });

  it("rejette une configuration invalide", () => {
    const configurationInvalide = {
      ...configurationValide,
      vlans: [],
    };

    const configurationEncodee = encoderConfiguration(
      configurationInvalide as NetworkInput,
    );

    const configurationDecodee = decoderConfiguration(configurationEncodee);

    expect(configurationDecodee).toBeNull();
  });
});