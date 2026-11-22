import type { NetworkInputValide } from "@/lib/validation/network-schema";

import type {
  AddressingPlan
} from "@/types/network";

interface ParametresPowerShell {
  configuration: NetworkInputValide;
  planVlsm: AddressingPlan;
}

export function genererScriptPowerShell({
  configuration,
  planVlsm,
}: ParametresPowerShell): string {
  const lignes: string[] = [];

  const domaine = configuration.parametresGlobaux.domaineReseau;
  const nomProjet = configuration.parametresGlobaux.nomProjet;

  const vlanServeurs = planVlsm.sousReseaux.find(
    (sousReseau) => sousReseau.type === "serveurs",
  );

  const adresseServeurDns = vlanServeurs
    ? vlanServeurs.passerelle
    : "192.168.20.2";

  lignes.push("# ========================================================");
  lignes.push("# Script PowerShell - Configuration DHCP Windows Server");
  lignes.push(`# Projet : ${nomProjet}`);
  lignes.push(`# Domaine : ${domaine}`);
  lignes.push("# ========================================================");
  lignes.push("");
  lignes.push("Import-Module DhcpServer");
  lignes.push("");

  for (const sousReseau of planVlsm.sousReseaux) {
    if (sousReseau.modeAttribution !== "dhcp" || !sousReseau.plageDhcp) {
      continue;
    }

    lignes.push(`# --- ÉTENDUE DHCP VLAN ${sousReseau.vlanId} ---`);
    lignes.push(`$ScopeId = "${sousReseau.adresseReseau}"`);
    lignes.push("Add-DhcpServerv4Scope `");
    lignes.push(`  -Name "${sousReseau.nom}" \``);
    lignes.push(`  -StartRange ${sousReseau.plageDhcp.debut} \``);
    lignes.push(`  -EndRange ${sousReseau.plageDhcp.fin} \``);
    lignes.push(`  -SubnetMask ${sousReseau.masque} \``);
    lignes.push("  -State Active `");
    lignes.push("  -LeaseDuration (New-TimeSpan -Days 8)");
    lignes.push("");
    lignes.push("# Option 003 : Passerelle par défaut");
    lignes.push("Set-DhcpServerv4OptionValue `");
    lignes.push("  -ScopeId $ScopeId `");
    lignes.push("  -OptionId 3 `");
    lignes.push(`  -Value ${sousReseau.passerelle}`);
    lignes.push("");
    lignes.push("# Option 006 : Serveur DNS");
    lignes.push("Set-DhcpServerv4OptionValue `");
    lignes.push("  -ScopeId $ScopeId `");
    lignes.push("  -OptionId 6 `");
    lignes.push(`  -Value ${adresseServeurDns}`);
    lignes.push("");
    lignes.push(
      `[OK] Étendue DHCP VLAN ${sousReseau.vlanId} configurée avec succès.`,
    );
    lignes.push("");
  }

  lignes.push("Write-Host \"Configuration DHCP terminée.\" -ForegroundColor Green");

  return lignes.join("\n");
}