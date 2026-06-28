import React from "react";
import type { RiskRadarData } from "../agents/readinessAgent";

interface RiskRadarChartProps {
  risks: RiskRadarData;
  mode: "preview" | "detailed";
  className?: string;
}

const categories = [
  { key: "evidenceRisk" as const, label: "Evidence" },
  { key: "deadlineRisk" as const, label: "Deadline" },
  { key: "recommenderRisk" as const, label: "Recommender" },
  { key: "storyRisk" as const, label: "Story" },
  { key: "fitRisk" as const, label: "Fit" },
  { key: "englishRisk" as const, label: "English" },
];

export default function RiskRadarChart({ risks, mode, className }: RiskRadarChartProps) {
  if (mode === "preview") {
    const polyPoints = categories.map((cat, idx) => {
      const angle = (Math.PI / 3) * idx - Math.PI / 2;
      const val = risks[cat.key] ?? 0;
      const dist = (val / 100) * 40;
      const x = 50 + dist * Math.cos(angle);
      const y = 50 + dist * Math.sin(angle);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");

    return (
      <svg viewBox="0 0 100 100" className={className}>
        {/* Rings */}
        {[25, 50, 75, 100].map(val => (
          <polygon
            key={val}
            points={Array.from({ length: 6 }).map((_, idx) => {
              const angle = (Math.PI / 3) * idx - Math.PI / 2;
              const dist = (val / 100) * 40;
              const x = 50 + dist * Math.cos(angle);
              const y = 50 + dist * Math.sin(angle);
              return `${x.toFixed(2)},${y.toFixed(2)}`;
            }).join(" ")}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="0.5"
          />
        ))}
        {/* Spoke lines */}
        {Array.from({ length: 6 }).map((_, idx) => {
          const angle = (Math.PI / 3) * idx - Math.PI / 2;
          const x = 50 + 40 * Math.cos(angle);
          const y = 50 + 40 * Math.sin(angle);
          return (
            <line
              key={idx}
              x1="50"
              y1="50"
              x2={x.toFixed(2)}
              y2={y.toFixed(2)}
              stroke="#e2e8f0"
              strokeWidth="0.5"
            />
          );
        })}
        {/* Risk Polygon */}
        <polygon
          points={polyPoints}
          fill="rgba(219, 68, 55, 0.08)"
          stroke="#db4437"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  // Detailed mode
  const polyPointsDetailed = categories.map((cat, idx) => {
    const angle = (Math.PI / 3) * idx - Math.PI / 2;
    const val = risks[cat.key] ?? 0;
    const dist = (val / 100) * 80;
    const x = 140 + dist * Math.cos(angle);
    const y = 140 + dist * Math.sin(angle);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 280 280" className={className}>
      {/* Concentric rings */}
      {[20, 40, 60, 80, 100].map((val) => {
        const pointsStr = Array.from({ length: 6 }).map((_, idx) => {
          const angle = (Math.PI / 3) * idx - Math.PI / 2;
          const dist = (val / 100) * 80;
          const x = 140 + dist * Math.cos(angle);
          const y = 140 + dist * Math.sin(angle);
          return `${x.toFixed(2)},${y.toFixed(2)}`;
        }).join(" ");
        return (
          <polygon
            key={val}
            points={pointsStr}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        );
      })}
      
      {/* Spoke lines */}
      {Array.from({ length: 6 }).map((_, idx) => {
        const angle = (Math.PI / 3) * idx - Math.PI / 2;
        const x = 140 + 80 * Math.cos(angle);
        const y = 140 + 80 * Math.sin(angle);
        return (
          <line
            key={idx}
            x1="140"
            y1="140"
            x2={x.toFixed(2)}
            y2={y.toFixed(2)}
            stroke="#cbd5e1"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Risk Polygon */}
      <polygon
        points={polyPointsDetailed}
        fill="rgba(234, 67, 37, 0.08)"
        stroke="#EA4335"
        strokeWidth="2"
      />

      {/* Center point */}
      <circle cx="140" cy="140" r="3" fill="#94a3b8" />

      {/* Labels */}
      {categories.map((cat, idx) => {
        const val = risks[cat.key] ?? 0;
        const angle = (Math.PI / 3) * idx - Math.PI / 2;
        const distance = 80 + 22;
        const x = 140 + distance * Math.cos(angle);
        const y = 140 + distance * Math.sin(angle);
        
        const cos = Math.cos(angle);
        let anchor = "middle";
        if (Math.abs(cos) >= 0.15) anchor = cos > 0 ? "start" : "end";

        const sin = Math.sin(angle);
        let baseline = "auto";
        if (Math.abs(sin) >= 0.15) baseline = sin > 0 ? "hanging" : "auto";
        
        const adjustedY = angle === -Math.PI / 2 ? y - 4 : y;

        return (
          <text
            key={idx}
            x={x}
            y={adjustedY}
            textAnchor={anchor}
            dominantBaseline={baseline === "auto" ? undefined : baseline}
            dy={baseline === "auto" ? "-0.2em" : undefined}
            className="text-[9px] font-extrabold text-slate-700 select-none"
          >
            {cat.label} ({val}%)
          </text>
        );
      })}
    </svg>
  );
}
