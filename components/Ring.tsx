"use client";

interface RingProps {
  value: number;
  max: number;
  color: string;
  over?: boolean;
  size?: number;
  strokeWidth?: number;
}

export function Ring({ value, max, color, over = false, size = 52, strokeWidth = 5 }: RingProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / Math.max(max, 1), 1);
  const dash = pct * circ;
  const strokeColor = over ? "var(--cherry)" : color;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8DDD0" strokeWidth={strokeWidth} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={strokeColor} strokeWidth={over ? strokeWidth + 1 : strokeWidth}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
      {over && (
        <text
          x={size/2} y={size/2}
          textAnchor="middle" dominantBaseline="middle"
          style={{ transform: `rotate(90deg) translate(0, -${size/2}px)`, fontSize: "10px", fill: "var(--cherry)" }}
          transform={`rotate(90, ${size/2}, ${size/2})`}
        >!</text>
      )}
    </svg>
  );
}
