import type { NetworkInputValide } from "@/lib/validation/network-schema";

import type { AddressingPlan } from "@/types/network";

interface ParametresCisco {
  configuration: NetworkInputValide;
  planVlsm: AddressingPlan;
}

export function genererConfigurationCisco({
  configuration,
  planVlsm,
}: ParametresCisco): string {
  const lignes: string[] = [];

  const nomProjet = configuration.parametresGlobaux.nomProjet;
  const domaine = configuration.parametresGlobaux.domaineReseau;
  const nomSwitch = configuration.equipements.nomSwitchCoeur;

  lignes.push("! ========================================================");
  lignes.push("! NetForge - Configuration Cisco IOS Switch L3");
  lignes.push(`! Projet : ${nomProjet}`);
  lignes.push("! ========================================================");
  lignes.push("");
  lignes.push("enable");
  lignes.push("configure terminal");
  lignes.push(`hostname ${nomSwitch}`);
  lignes.push("ip routing");
  lignes.push(`ip domain-name ${domaine}`);
  lignes.push("");

  lignes.push("! --- SÉCURISATION DE L'ACCÈS D'ADMINISTRATION ---");
  lignes.push("crypto key generate rsa modulus 2048");
  lignes.push("ip ssh version 2");
  lignes.push("service password-encryption");
  lignes.push("");

  lignes.push("! --- CRÉATION DES VLANs ---");

  for (const vlan of configuration.vlans) {
    lignes.push(`vlan ${vlan.id}`);
    lignes.push(` name ${vlan.nom}`);
  }

  lignes.push("vlan 999");
  lignes.push(" name VLAN_PARKING_UNUSED");
  lignes.push("exit");
  lignes.push("");

  lignes.push("! --- INTERFACES ROUTÉES SVI (PASSERELLES PAR DÉFAUT) ---");

  for (const sousReseau of planVlsm.sousReseaux) {
    lignes.push(`interface Vlan${sousReseau.vlanId}`);
    lignes.push(` description Passerelle ${sousReseau.nom}`);
    lignes.push(
      ` ip address ${sousReseau.passerelle} ${sousReseau.masque}`,
    );

    if (sousReseau.modeAttribution === "dhcp") {
      lignes.push(" ip helper-address 192.168.20.2");
    }

    lignes.push(" no shutdown");
    lignes.push("!");
  }

  lignes.push("");

  lignes.push("! --- TRUNK 802.1Q VERS LE PARE-FEU ---");
  lignes.push("interface GigabitEthernet0/1");
  lignes.push(" description TRUNK vers Pare-feu");
  lignes.push(" switchport trunk encapsulation dot1q");
  lignes.push(" switchport mode trunk");

  const identifiantsVlans = planVlsm.sousReseaux
    .map((sousReseau) => sousReseau.vlanId)
    .join(",");

  lignes.push(` switchport trunk allowed vlan ${identifiantsVlans}`);
  lignes.push(" switchport trunk native vlan 999");
  lignes.push(" no shutdown");
  lignes.push("");

  if (configuration.securite.portSecurityCisco) {
    lignes.push("! --- PORT SECURITY SUR LES PORTS UTILISATEURS ---");
    lignes.push("interface range GigabitEthernet0/2 - 24");
    lignes.push(" description Ports Access Utilisateurs");
    lignes.push(" switchport mode access");
    lignes.push(" switchport access vlan 10");
    lignes.push(" switchport port-security");
    lignes.push(" switchport port-security maximum 2");
    lignes.push(" switchport port-security violation restrict");
    lignes.push(" spanning-tree portfast");
    lignes.push(" spanning-tree bpduguard enable");
    lignes.push("exit");
    lignes.push("");
  }

  if (configuration.securite.desactivationPortsInutilises) {
    lignes.push("! --- DÉSACTIVATION DES PORTS INUTILISÉS ---");
    lignes.push("interface range GigabitEthernet0/25 - 48");
    lignes.push(" switchport access vlan 999");
    lignes.push(" shutdown");
    lignes.push("exit");
    lignes.push("");
  }

  lignes.push("end");
  lignes.push("write memory");

  return lignes.join("\n");
}