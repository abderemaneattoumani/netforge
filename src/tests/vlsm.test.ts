import { describe, expect, it } from "vitest";

import { calculerPlanVlsm } from "@/lib/network/vlsm";

import type { VlanInput } from "@/types/network";

describe("calculerPlanVlsm", () => {
  it("calcule un plan VLSM pour trois VLANs", () => {
    const vlans: VlanInput[] = [
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
    ];

    const plan = calculerPlanVlsm("192.168.0.0", 16, vlans);

    expect(plan.sousReseaux).toHaveLength(3);

    expect(plan.sousReseaux[0].adresseReseau).toBe("192.168.0.0");
    expect(plan.sousReseaux[0].prefixe).toBe(26);
    expect(plan.sousReseaux[0].passerelle).toBe("192.168.0.1");
    expect(plan.sousReseaux[0].adresseDiffusion).toBe("192.168.0.63");
    expect(plan.sousReseaux[0].hotesUtilisables).toBe(62);

    expect(plan.sousReseaux[1].adresseReseau).toBe("192.168.0.64");
    expect(plan.sousReseaux[1].prefixe).toBe(30);
    expect(plan.sousReseaux[2].adresseReseau).toBe("192.168.0.68"); expect(plan.sousReseaux[2].prefixe).toBe(30);
    expect(plan.totalHotesRequis).toBe(52);
    expect(plan.totalHotesAlloues).toBe(66); expect(plan.conflits).toHaveLength(0);
  });

  it("attribue une plage DHCP qui exclut la passerelle", () => {
    const vlans: VlanInput[] = [
      {
        id: 10,
        nom: "VLAN_UTILISATEURS",
        type: "utilisateurs",
        nombreHotes: 10,
        dhcpActive: true,
      },
    ];

    const plan = calculerPlanVlsm("192.168.0.0", 24, vlans);

    expect(plan.sousReseaux[0].modeAttribution).toBe("dhcp");
    expect(plan.sousReseaux[0].plageDhcp).toEqual({
      debut: "192.168.0.2",
      fin: "192.168.0.14",
    });
  });

  it("détecte les identifiants VLAN dupliqués", () => {
    const vlans: VlanInput[] = [
      {
        id: 10,
        nom: "VLAN_A",
        type: "utilisateurs",
        nombreHotes: 10,
        dhcpActive: true,
      },
      {
        id: 10,
        nom: "VLAN_B",
        type: "serveurs",
        nombreHotes: 5,
        dhcpActive: false,
      },
    ];

    const plan = calculerPlanVlsm("192.168.0.0", 24, vlans);

    expect(plan.conflits).toContain(
      "L’identifiant VLAN 10 est utilisé plusieurs fois.",
    );
  });

  it("signale un espace insuffisant", () => {
    const vlans: VlanInput[] = [
      {
        id: 10,
        nom: "VLAN_UTILISATEURS",
        type: "utilisateurs",
        nombreHotes: 100,
        dhcpActive: true,
      },
    ];

    const plan = calculerPlanVlsm("192.168.0.0", 30, vlans);

    expect(plan.conflits.length).toBeGreaterThan(0);
    expect(plan.sousReseaux).toHaveLength(0);
  });
});