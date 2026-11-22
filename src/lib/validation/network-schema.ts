import { z } from "zod";

const motifNomTechnique = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export const vlanTypeSchema = z.enum([
  "utilisateurs",
  "serveurs",
  "dmz",
  "management",
  "invites",
  "voip",
  "imprimantes",
]);

export const architectureSchema = z.enum([
  "pme-standard",
  "entreprise-etendue",
  "campus",
  "personnalise",
]);

export const securityProfileSchema = z.enum([
  "basique",
  "recommande",
  "strict-anssi",
]);

export const switchPortSchema = z.enum([
  "24-gigabit-4-sfp-plus",
  "48-gigabit-4-sfp-plus",
  "8-compact",
]);

export const generatedArtifactSchema = z.enum([
  "cisco-ios",
  "pfsense",
  "powershell-dhcp",
  "documentation-pdf",
]);

export const adresseIpv4Schema = z
  .string()
  .regex(
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
    "L’adresse IPv4 est invalide.",
  );

export const reseauParentSchema = z
  .string()
  .regex(
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}\/([0-9]|[12]\d|3[0-2])$/,
    "Le réseau parent doit être au format CIDR, par exemple 192.168.0.0/16.",
  );

export const domaineReseauSchema = z
  .string()
  .min(3, "Le domaine réseau doit contenir au moins 3 caractères.")
  .max(253, "Le domaine réseau est trop long.")
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/,
    "Le domaine doit être valide, par exemple entreprise.local.",
  );

export const vlanSchema = z.object({
  id: z
    .number()
    .int("L’identifiant VLAN doit être un entier.")
    .min(1, "L’identifiant VLAN doit être supérieur à 0.")
    .max(4094, "L’identifiant VLAN doit être inférieur ou égal à 4094."),
  nom: z
    .string()
    .min(1, "Le nom du VLAN est obligatoire.")
    .max(32, "Le nom du VLAN ne doit pas dépasser 32 caractères.")
    .regex(
      motifNomTechnique,
      "Le nom du VLAN ne peut contenir que des lettres, chiffres, points, tirets et underscores.",
    ),
  type: vlanTypeSchema,
  nombreHotes: z
    .number()
    .int("Le nombre d’hôtes doit être un entier.")
    .min(1, "Le nombre d’hôtes doit être au moins égal à 1.")
    .max(100000, "Le nombre d’hôtes est trop élevé."),
  dhcpActive: z.boolean(),
});

export const networkInputSchema = z.object({
  parametresGlobaux: z.object({
    nomProjet: z
      .string()
      .min(1, "Le nom du projet est obligatoire.")
      .max(64, "Le nom du projet ne doit pas dépasser 64 caractères.")
      .regex(
        motifNomTechnique,
        "Le nom du projet ne peut contenir que des lettres, chiffres, points, tirets et underscores.",
      ),
    reseauParent: reseauParentSchema,
    domaineReseau: domaineReseauSchema,
    modeleArchitecture: architectureSchema,
  }),
  vlans: z
    .array(vlanSchema)
    .min(1, "Au moins un VLAN doit être configuré.")
    .max(64, "Le nombre maximum de VLANs est 64."),
  securite: z.object({
    profil: securityProfileSchema,
    isolationDmz: z.boolean(),
    aclInterVlanRestrictives: z.boolean(),
    portSecurityCisco: z.boolean(),
    desactivationPortsInutilises: z.boolean(),
  }),
  equipements: z.object({
    nomSwitchCoeur: z
      .string()
      .min(1, "Le nom du switch cœur est obligatoire.")
      .max(64, "Le nom du switch cœur est trop long.")
      .regex(
        motifNomTechnique,
        "Le nom du switch ne peut contenir que des lettres, chiffres, points, tirets et underscores.",
      ),
    nomRouteurPareFeu: z
      .string()
      .min(1, "Le nom du routeur ou pare-feu est obligatoire.")
      .max(64, "Le nom du routeur ou pare-feu est trop long.")
      .regex(
        motifNomTechnique,
        "Le nom du pare-feu ne peut contenir que des lettres, chiffres, points, tirets et underscores.",
      ),
    modelePortsSwitch: switchPortSchema,
  }),
  sorties: z.object({
    artefacts: z.array(generatedArtifactSchema),
  }),
});

export type NetworkInputValide = z.infer<typeof networkInputSchema>;