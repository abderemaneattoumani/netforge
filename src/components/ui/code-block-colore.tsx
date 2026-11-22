"use client";


import { useMemo } from "react";


interface CodeBlockColoreProps {
  contenu: string;
  langage: "cisco" | "powershell";
}


interface Jeton {
  texte: string;
  classe: string;
}


const classeCommentaire = "text-slate-400";
const classeMotCle = "text-cyan-400 font-semibold";
const classeCommande = "text-sky-400";
const classeAdresseIp = "text-green-400";
const classeChaine = "text-yellow-300";
const classeVariable = "text-pink-400";
const classeTexte = "text-slate-200";


function decouperLigne(ligne: string): string[] {
  return (
    ligne.match(
      /("[^"]*"|\b\d{1,3}(?:\.\d{1,3}){3}(?:\/\d+)?\b|\$\w+|\S+|\s+)/g,
    ) ?? [ligne]
  );
}


function coloriserCisco(ligne: string): Jeton[] {
  const ligneNettoyee = ligne.trim();


  if (ligneNettoyee.startsWith("!")) {
    return [{ texte: ligne, classe: classeCommentaire }];
  }


  const motsCles = [
    "enable",
    "exit",
    "end",
    "write",
    "memory",
    "no",
    "shutdown",
  ];


  const jetons = decouperLigne(ligne);
  let premierMotTraite = false;


  return jetons.map((jeton) => {
    const jetonNettoye = jeton.trim();


    if (!jeton) {
      return { texte: jeton, classe: "" };
    }


    if (/^\d{1,3}(?:\.\d{1,3}){3}(?:\/\d+)?$/.test(jetonNettoye)) {
      return { texte: jeton, classe: classeAdresseIp };
    }


    if (!premierMotTraite) {
      premierMotTraite = true;


      if (motsCles.includes(jetonNettoye)) {
        return { texte: jeton, classe: classeMotCle };
      }


      return { texte: jeton, classe: classeCommande };
    }


    return { texte: jeton, classe: classeTexte };
  });
}


function coloriserPowerShell(ligne: string): Jeton[] {
  const ligneNettoyee = ligne.trim();


  if (ligneNettoyee.startsWith("#")) {
    return [{ texte: ligne, classe: classeCommentaire }];
  }


  const jetons = decouperLigne(ligne);


  return jetons.map((jeton) => {
    const jetonNettoye = jeton.trim();


    if (!jeton) {
      return { texte: jeton, classe: "" };
    }


    if (jetonNettoye.startsWith("$")) {
      return { texte: jeton, classe: classeVariable };
    }


    if (jetonNettoye.startsWith('"') && jetonNettoye.endsWith('"')) {
      return { texte: jeton, classe: classeChaine };
    }


    if (/^\d{1,3}(?:\.\d{1,3}){3}(?:\/\d+)?$/.test(jetonNettoye)) {
      return { texte: jeton, classe: classeAdresseIp };
    }


    if (jetonNettoye.startsWith("-")) {
      return { texte: jeton, classe: classeCommande };
    }


    if (/^[A-Z][a-zA-Z]+-[A-Z][a-zA-Z]+$/.test(jetonNettoye)) {
      return { texte: jeton, classe: classeMotCle };
    }


    return { texte: jeton, classe: classeTexte };
  });
}


export function CodeBlockColore({
  contenu,
  langage,
}: CodeBlockColoreProps) {
  const lignes = useMemo(() => contenu.split("\n"), [contenu]);


  return (
    <div className="terminal-sombre overflow-x-auto p-6">
      <pre className="font-code text-code-sm leading-relaxed">
        <code>
          {lignes.map((ligne, index) => {
            const jetons =
              langage === "cisco"
                ? coloriserCisco(ligne)
                : coloriserPowerShell(ligne);


            return (
              <div key={`ligne-${index}`} className="whitespace-pre">
                {jetons.map((jeton, indexJeton) => (
                  <span
                    key={`jeton-${index}-${indexJeton}`}
                    className={jeton.classe}
                  >
                    {jeton.texte}
                  </span>
                ))}
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}