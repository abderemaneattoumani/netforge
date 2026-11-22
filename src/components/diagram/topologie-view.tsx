"use client";


import { useMemo } from "react";


import Link from "next/link";


import { useSearchParams } from "next/navigation";


import { Globe, ShieldCheck, Server } from "lucide-react";


import { decoderConfiguration } from "@/lib/network/config-codec";
import { calculerPlanVlsm } from "@/lib/network/vlsm";


import { lireBrouillon } from "@/lib/storage/brouillon";


export function TopologieView() {
    const parametres = useSearchParams();
    const configurationEncodee = parametres.get("config");


    const configuration = useMemo(() => {
        if (configurationEncodee === "draft") {
            return lireBrouillon();
        }


        if (!configurationEncodee) {
            return null;
        }


        return decoderConfiguration(configurationEncodee);
    }, [configurationEncodee]);


    const planVlsm = useMemo(() => {
        if (!configuration) {
            return null;
        }


        const parties = configuration.parametresGlobaux.reseauParent.split("/");


        if (parties.length !== 2) {
            return null;
        }


        return calculerPlanVlsm(
            parties[0],
            Number(parties[1]),
            configuration.vlans,
        );
    }, [configuration]);


    if (!configuration || !planVlsm) {
        return (
            <section className="mx-auto max-w-5xl px-6 py-16 text-center">
                <h1 className="text-headline-lg font-bold text-on-surface">
                    Aucune configuration valide
                </h1>


                <p className="mt-4 text-body-lg text-outline-variant">
                    Génère d’abord une configuration depuis l’assistant.
                </p>


                <Link
                    href="/outil"
                    className="mt-8 inline-flex rounded bg-accent px-6 py-2.5 text-label-lg font-label font-semibold text-on-accent"
                >
                    Ouvrir l’assistant
                </Link>
            </section>
        );
    }


    return (
        <main className="mx-auto w-full max-w-7xl px-6 py-8">
            <section className="mb-8 flex flex-col justify-between gap-4 border-b border-outline bg-surface-container-low py-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="flex flex-wrap items-center gap-3 text-headline-md font-bold text-on-surface">
                        Schéma topologique : {configuration.parametresGlobaux.nomProjet}


                        <span className="rounded border border-emerald-800/40 bg-emerald-950 px-2 py-0.5 font-mono text-code-xs text-emerald-400">
                            Topologie L2 / L3
                        </span>
                    </h1>


                    <p className="mt-1 text-body-sm text-outline-variant">
                        Visualisation des liaisons trunk 802.1Q, des passerelles SVI et de
                        l’isolation de la DMZ.
                    </p>
                </div>


                <div className="flex flex-wrap items-center gap-4 rounded-lg border border-outline bg-surface-container px-3 py-1.5 text-label-sm font-label">
                    {planVlsm.sousReseaux.map((sousReseau) => (
                        <span
                            key={sousReseau.vlanId}
                            className="flex items-center gap-1.5"
                            style={{ color: sousReseau.couleur }}
                        >
                            <span
                                className="inline-block h-3 w-3 rounded"
                                style={{ backgroundColor: sousReseau.couleur }}
                            />
                            VLAN {sousReseau.vlanId}
                        </span>
                    ))}
                </div>
            </section>


            <div className="terminal-sombre relative flex min-h-[640px] flex-col justify-between overflow-hidden rounded-lg border border-outline p-6 shadow-2xl">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1c2633_1px,transparent_1px),linear-gradient(to_bottom,#1c2633_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40" />


                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex w-full max-w-md items-center gap-4 rounded-lg border-2 border-[#232d38] bg-[#131a22] p-4 shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center rounded border border-[#232d38] bg-[#0e141b] text-cyan-400">
                            <Globe className="h-5 w-5" aria-hidden="true" />
                        </div>


                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <span className="text-headline-sm font-bold text-slate-100">
                                    WAN / Internet
                                </span>


                                <span className="font-mono text-code-sm text-cyan-400">
                                    Passerelle FAI
                                </span>
                            </div>


                            <div className="mt-0.5 font-mono text-code-xs text-slate-400">
                                Réseau public / FAI
                            </div>
                        </div>
                    </div>
                </div>


                <div className="relative z-10 -my-2 flex w-full justify-center pointer-events-none">
                    <svg width={200} height={40} className="overflow-visible">
                        <line
                            x1={100}
                            y1={0}
                            x2={100}
                            y2={40}
                            stroke="#22d3ee"
                            strokeWidth={2}
                            className="flow-line"
                        />
                    </svg>
                </div>


                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex w-full max-w-xl items-center gap-5 rounded-lg border-2 border-emerald-500/60 bg-[#0e141b] p-5 shadow-xl">
                        <div className="flex h-14 w-14 items-center justify-center rounded border border-emerald-800/80 bg-emerald-950/80 text-emerald-400">
                            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                        </div>


                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-label-xs font-label font-semibold uppercase text-emerald-400">
                                        Pare-feu de périmètre
                                    </span>


                                    <h2 className="text-headline-sm font-bold text-slate-100">
                                        {configuration.equipements.nomRouteurPareFeu}
                                    </h2>
                                </div>


                                <span className="rounded border border-emerald-800/40 bg-emerald-950 px-2 py-0.5 font-mono text-code-xs font-bold text-emerald-300">
                                    Default Deny
                                </span>
                            </div>


                            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#232d38] pt-2 font-mono text-label-xs text-slate-400">
                                <div>
                                    WAN : <span className="text-cyan-400">vtnet0</span>
                                </div>


                                <div>
                                    LAN Trunk :{" "}
                                    <span className="text-cyan-300">vtnet1 (802.1Q)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="relative z-10 -my-2 flex w-full justify-center pointer-events-none">
                    <svg width={200} height={56} className="overflow-visible">
                        <line
                            x1={100}
                            y1={0}
                            x2={100}
                            y2={40}
                            stroke="#22d3ee"
                            strokeWidth={2}
                            className="flow-line"
                        />


                        <text
                            x={110}
                            y={24}
                            fill="#94a3b8"
                            fontSize={11}
                            fontFamily="var(--font-jetbrains-mono), monospace"
                        >
                            Trunk 802.1Q
                        </text>
                    </svg>
                </div>


                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex w-full max-w-2xl items-center gap-5 rounded-lg border-2 border-cyan-400 bg-[#131a22] p-5 shadow-2xl">
                        <div className="flex h-14 w-14 items-center justify-center rounded border border-[#232d38] bg-[#0e141b] text-cyan-400">
                            <Server className="h-6 w-6" aria-hidden="true" />
                        </div>


                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-label-xs font-label font-semibold uppercase text-cyan-400">
                                        Commutateur cœur L3
                                    </span>


                                    <h2 className="text-headline-sm font-bold text-slate-100">
                                        {configuration.equipements.nomSwitchCoeur}
                                    </h2>
                                </div>


                                <span className="rounded border border-[#232d38] bg-[#0e141b] px-2 py-0.5 font-mono text-code-xs text-slate-400">
                                    Native VLAN 999
                                </span>
                            </div>


                            <div className="mt-2 flex items-center justify-between font-mono text-label-xs text-slate-400">
                                <span>
                                    SVI :{" "}
                                    <span className="font-semibold text-cyan-400">
                                        {planVlsm.sousReseaux
                                            .map((sousReseau) => sousReseau.passerelle)
                                            .join(" / ")}
                                    </span>
                                </span>


                                <span className="text-emerald-400">
                                    Port Security :{" "}
                                    {configuration.securite.portSecurityCisco ? "Actif" : "Inactif"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="relative z-10 -my-2 flex w-full justify-center pointer-events-none">
                    <svg
                        width={800}
                        height={50}
                        className="w-full max-w-3xl overflow-visible"
                    >
                        {planVlsm.sousReseaux.map((sousReseau, index) => {
                            const positions = [140, 400, 660];
                            const positionX = positions[index % positions.length];


                            return (
                                <path
                                    key={sousReseau.vlanId}
                                    d={`M 400 0 L 400 20 L ${positionX} 20 L ${positionX} 50`}
                                    fill="none"
                                    stroke={sousReseau.couleur}
                                    strokeWidth={2}
                                    className="flow-line"
                                />
                            );
                        })}
                    </svg>
                </div>


                <div className="relative z-10 grid grid-cols-1 gap-6 pt-2 md:grid-cols-3">
                    {planVlsm.sousReseaux.map((sousReseau) => (
                        <div
                            key={sousReseau.vlanId}
                            className="flex flex-col justify-between rounded-lg border-2 bg-[#0e141b] p-5 shadow-lg"
                            style={{ borderColor: `${sousReseau.couleur}99` }}
                        >
                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <span
                                        className="text-label-xs font-label font-bold uppercase tracking-wider"
                                        style={{ color: sousReseau.couleur }}
                                    >
                                        VLAN {sousReseau.vlanId}
                                    </span>


                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: sousReseau.couleur }}
                                    />
                                </div>


                                <h3 className="mb-1 text-headline-sm font-bold text-slate-100">
                                    {sousReseau.nom}
                                </h3>


                                <div
                                    className="mb-3 font-mono text-code-xs"
                                    style={{ color: sousReseau.couleur }}
                                >
                                    {sousReseau.adresseReseau}/{sousReseau.prefixe}
                                </div>


                                <p className="mb-4 text-body-sm text-slate-400">
                                    {sousReseau.modeAttribution === "dhcp"
                                        ? "Attribution dynamique des adresses via DHCP."
                                        : "Attribution statique des adresses IP."}
                                </p>
                            </div>


                            <div className="space-y-1 border-t border-[#232d38] pt-3 font-mono text-code-xs text-slate-400">
                                <div>
                                    Plage :{" "}
                                    <span className="text-slate-100">
                                        {sousReseau.premiereAdresseUtilisable} –{" "}
                                        {sousReseau.derniereAdresseUtilisable}
                                    </span>
                                </div>


                                <div>
                                    GW :{" "}
                                    <span
                                        className="font-semibold"
                                        style={{ color: sousReseau.couleur }}
                                    >
                                        {sousReseau.passerelle}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}