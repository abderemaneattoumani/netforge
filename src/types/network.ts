export type VlanType =
  | "utilisateurs"
  | "serveurs"
  | "dmz"
  | "management"
  | "invites"
  | "voip"
  | "imprimantes";

export type ArchitectureModel =
  | "pme-standard"
  | "entreprise-etendue"
  | "campus"
  | "personnalise";

export type SecurityProfile = "basique" | "recommande" | "strict-anssi";

export type SwitchPortModel =
  | "24-gigabit-4-sfp-plus"
  | "48-gigabit-4-sfp-plus"
  | "8-compact";

export type GeneratedArtifact =
  | "cisco-ios"
  | "pfsense"
  | "powershell-dhcp"
  | "documentation-pdf";

export type AddressAssignmentMode = "dhcp" | "statique";

export type FirewallAction = "pass" | "block";

export type NetworkProtocol = "tcp" | "udp" | "any";

export type ResultTab =
  | "adressage"
  | "cisco"
  | "pfsense"
  | "powershell"
  | "documentation";

export interface NetworkGlobalSettings {
  nomProjet: string;
  reseauParent: string;
  domaineReseau: string;
  modeleArchitecture: ArchitectureModel;
}

export interface VlanInput {
  id: number;
  nom: string;
  type: VlanType;
  nombreHotes: number;
  dhcpActive: boolean;
}

export interface SecurityOptions {
  profil: SecurityProfile;
  isolationDmz: boolean;
  aclInterVlanRestrictives: boolean;
  portSecurityCisco: boolean;
  desactivationPortsInutilises: boolean;
}

export interface EquipmentSettings {
  nomSwitchCoeur: string;
  nomRouteurPareFeu: string;
  modelePortsSwitch: SwitchPortModel;
}

export interface OutputSettings {
  artefacts: GeneratedArtifact[];
}

export interface NetworkInput {
  parametresGlobaux: NetworkGlobalSettings;
  vlans: VlanInput[];
  securite: SecurityOptions;
  equipements: EquipmentSettings;
  sorties: OutputSettings;
}

export interface Subnet {
  vlanId: number;
  nom: string;
  type: VlanType;
  adresseReseau: string;
  masque: string;
  prefixe: number;
  passerelle: string;
  premiereAdresseUtilisable: string;
  derniereAdresseUtilisable: string;
  adresseDiffusion: string;
  capaciteTotale: number;
  hotesUtilisables: number;
  modeAttribution: AddressAssignmentMode;
  couleur: string;
  plageDhcp?: {
    debut: string;
    fin: string;
  };
}

export interface AddressingPlan {
  reseauParent: string;
  prefixeParent: number;
  sousReseaux: Subnet[];
  totalHotesRequis: number;
  totalHotesAlloues: number;
  conflits: string[];
}

export interface FirewallRule {
  id: string;
  interface: string;
  action: FirewallAction;
  protocole: NetworkProtocol;
  source: string;
  portSource?: string;
  destination: string;
  portDestination?: string;
  description: string;
}

export interface SecurityAuditItem {
  id: string;
  statut: "conforme" | "attention" | "non-conforme";
  titre: string;
  description: string;
}

export interface SecurityAudit {
  score: number;
  items: SecurityAuditItem[];
}

export interface GeneratedConfig {
  resume: {
    nomProjet: string;
    reseauParent: string;
    prefixeParent: number;
    nombreVlansActifs: number;
    hotesRequis: number;
    hotesAlloues: number;
    dateGeneration: string;
  };
  adressage: AddressingPlan;
  reglesPareFeu: FirewallRule[];
  commandesCisco: string;
  scriptPowerShell: string;
  documentationMarkdown: string;
  auditSecurite: SecurityAudit;
}