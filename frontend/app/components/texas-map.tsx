"use client";

const points = [
  { city: "Austin", x: 52, y: 62 },
  { city: "Dallas", x: 56, y: 35 },
  { city: "Houston", x: 66, y: 70 },
  { city: "San Antonio", x: 45, y: 74 },
];

export function TexasMap({
  selectedCity,
  onSelectCity,
}: {
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
}) {
  return (
    <div className="texasMapWrap" aria-label="Texas market signal map">
      <svg viewBox="0 0 100 100" role="img" aria-label="Austin, Dallas, Houston, and San Antonio signals">
        <path
          className="texasShape"
          d="M18 12 L42 17 L52 12 L62 18 L66 31 L78 36 L85 51 L78 68 L67 70 L61 83 L50 91 L41 82 L33 82 L29 72 L21 64 L17 51 L10 45 L15 34 Z"
        />
        <path className="mapLine" d="M56 35 L52 62 L45 74" />
        <path className="mapLine muted" d="M52 62 L66 70" />
        {points.map((point) => (
          <g
            aria-label={`Select ${point.city}`}
            className="mapButton"
            key={point.city}
            onClick={() => onSelectCity?.(point.city)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                onSelectCity?.(point.city);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <circle className="signalHalo" cx={point.x} cy={point.y} r="6" />
            <circle
              className={`cityPoint ${selectedCity === point.city ? "selected" : ""}`}
              cx={point.x}
              cy={point.y}
              r="2.2"
            />
            <text x={point.x + 3.2} y={point.y + 1.2}>
              {point.city}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
