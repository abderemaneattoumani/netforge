import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const reglesPfSense = [
  {
    action: "PASS",
    flux: "VLAN_10 → WAN (HTTP/HTTPS)",
    ports: "TCP 80, 443",
    couleur: "text-emerald-400",
    point: "bg-emerald-400",
  },
  {
    action: "BLOCK",
    flux: "VLAN_30 (DMZ) → VLAN_10, 20",
    ports: "TOUT TRAFIC",
    couleur: "text-red-400",
    point: "bg-red-400",
  },
  {
    action: "PASS",
    flux: "VLAN_10 → VLAN_20 (Serveurs)",
    ports: "TCP 445, 3389",
    couleur: "text-emerald-400",
    point: "bg-emerald-400",
  },
];

export function ConfigPreview() {
  return (
    <section className="border-t border-outline bg-surface-container-low py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="text-label-sm font-label uppercase tracking-wider text-accent">
              Aperçu en direct
            </span>

            <h2 className="mt-1 text-headline-md font-bold text-on-surface">
              Extrait d’une configuration générée (3 VLANs)
            </h2>
          </div>

          <a
            href="/outil/resultats"
            className="inline-flex items-center gap-1 text-label-md font-label text-accent hover:underline"
          >
            Ouvrir le tableau de bord complet
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>

        <div className="overflow-hidden rounded-lg border border-outline bg-surface-container shadow-2xl">
          <div className="flex items-center justify-between border-b border-outline bg-surface-container-high px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-error" />
              <span className="inline-block h-3 w-3 rounded-full bg-warning" />
              <span className="inline-block h-3 w-3 rounded-full bg-success" />

              <span className="ml-3 font-mono text-code-sm text-outline-variant">
                Cisco-Catalyst-Core-SW01.ios — Syntaxe vérifiée
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="success">Conforme CIS Benchmark</Badge>
              <span className="font-mono text-code-sm text-outline-variant">
                UTF-8
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 overflow-x-auto p-6 font-mono text-code-md lg:grid-cols-2">
            <div>
              <div className="mb-2 font-mono text-code-sm text-outline-variant">
                // --- SEGMENTATION VLANS &amp; SVIs ---
              </div>

              <pre className="leading-relaxed text-on-surface">
                <code>
                  {`! Définition des VLANs
vlan 10
 name VLAN_UTILISATEURS
vlan 20
 name VLAN_SERVEURS
vlan 30
 name VLAN_DMZ_PUBLIQUE
exit

! Passerelles virtuelles (SVI)
interface Vlan10
 description GW Utilisateurs (50 postes)
 ip address 192.168.10.1 255.255.255.192
 no shutdown
!
interface Vlan20
 description GW Serveurs Applicatifs
 ip address 192.168.20.1 255.255.255.240
 no shutdown`}
                </code>
              </pre>
            </div>

            <div className="border-t border-outline pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="mb-2 font-mono text-code-sm text-outline-variant">
                // --- MATRICE DE ROUTAGE pfSense ---
              </div>

              <div className="space-y-2 font-mono text-body-sm">
                {reglesPfSense.map((regle) => (
                  <div
                    key={regle.flux}
                    className="flex items-center justify-between rounded border border-outline bg-surface-container-low p-2.5"
                  >
                    <span
                      className={`flex items-center gap-1.5 font-semibold ${regle.couleur}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${regle.point}`}
                      />
                      {regle.action}
                    </span>

                    <span className="text-on-surface">{regle.flux}</span>

                    <span className="text-accent">{regle.ports}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-end">
                <a
                  href="/outil/resultats"
                  className="inline-flex items-center gap-1 text-label-sm font-label text-accent hover:underline"
                >
                  Voir les 14 règles de filtrage →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}