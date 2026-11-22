interface CodeBlockProps {
  contenu: string;
  nomFichier: string;
}

export function CodeBlock({ contenu, nomFichier }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-outline bg-surface-container">
      <div className="flex items-center justify-between border-b border-outline bg-surface-container-high px-4 py-3">
        <span className="font-mono text-code-sm font-semibold text-on-surface">
          {nomFichier}
        </span>
      </div>

      <div className="overflow-x-auto bg-surface-container-low p-6">
        <pre className="font-mono text-code-sm leading-relaxed text-on-surface">
          <code>{contenu}</code>
        </pre>
      </div>
    </div>
  );
}