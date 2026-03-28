import { STATUS_COLORS, TYPE_COLORS } from "../data/graphBuilder";

const nodeTypes = [
  { label: "Goal", color: TYPE_COLORS.goal, size: 14 },
  { label: "Pillar", color: TYPE_COLORS.pillar, size: 12 },
  { label: "Strategy", color: TYPE_COLORS.strategy, size: 10 },
  { label: "Intervention", color: TYPE_COLORS.intervention, size: 7 },
];

const statuses = [
  { label: "Well-covered", color: STATUS_COLORS["well-covered"] },
  { label: "In-progress", color: STATUS_COLORS["in-progress"] },
  { label: "Neglected", color: STATUS_COLORS["neglected"] },
  { label: "Unfunded", color: STATUS_COLORS["unfunded"] },
  { label: "Unknown", color: STATUS_COLORS["unknown"] },
];

export default function Legend() {
  return (
    <div className="legend">
      <div className="legend-section">
        <div className="legend-title">Node Types</div>
        <div className="legend-items">
          {nodeTypes.map((t) => (
            <div className="legend-item" key={t.label}>
              <span
                className="legend-circle"
                style={{
                  width: t.size,
                  height: t.size,
                  backgroundColor: t.label === "Strategy" || t.label === "Intervention"
                    ? "transparent"
                    : t.color,
                  border: `2px solid ${t.color}`,
                }}
              />
              <span className="legend-label">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="legend-section">
        <div className="legend-title">Status</div>
        <div className="legend-items">
          {statuses.map((s) => (
            <div className="legend-item" key={s.label}>
              <span
                className="legend-dot"
                style={{ backgroundColor: s.color }}
              />
              <span className="legend-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
