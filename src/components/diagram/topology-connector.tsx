interface TopologyConnectorProps {
  couleur: string;
  label?: string;
}

export function TopologyConnector({ couleur, label }: TopologyConnectorProps) {
  return (
    <div className="relative z-10 flex w-full justify-center pointer-events-none -my-2">
      <svg
        width={200}
        height={label ? 56 : 40}
        className="overflow-visible"
        aria-hidden="true"
      >
        <line
          x1={100}
          y1={0}
          x2={100}
          y2={label ? 40 : 40}
          stroke={couleur}
          strokeWidth={2}
          className="flow-line"
        />

        {label ? (
          <text
            x={110}
            y={24}
            fill="#94a3b8"
            fontSize={11}
            fontFamily="var(--font-jetbrains-mono), monospace"
          >
            {label}
          </text>
        ) : null}
      </svg>
    </div>
  );
}