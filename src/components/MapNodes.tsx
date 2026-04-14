import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

const STATUS_COLORS: Record<string, string> = {
  "well-covered": "#22c55e",
  "in-progress": "#f59e0b",
  neglected: "#ef4444",
  unfunded: "#a855f7",
  unknown: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  "well-covered": "Well covered",
  "in-progress": "In progress",
  neglected: "Neglected",
  unfunded: "Unfunded",
  unknown: "Unknown",
};

type MapNodeData = {
  label: string;
  nodeType: string;
  status: string;
  tags?: string[];
};

export const GoalNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as MapNodeData;
  return (
    <div className="rf-node rf-node-goal">
      <Handle type="source" position={Position.Bottom} />
      <div className="rf-node-title">{d.label}</div>
    </div>
  );
});

export const PillarNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as MapNodeData;
  return (
    <div className="rf-node rf-node-pillar">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="rf-node-badge" style={{ backgroundColor: STATUS_COLORS[d.status] }}>
        {STATUS_LABELS[d.status]}
      </div>
      <div className="rf-node-title">{d.label}</div>
    </div>
  );
});

export const StrategyNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as MapNodeData;
  const color = STATUS_COLORS[d.status] || "#6b7280";
  return (
    <div className="rf-node rf-node-strategy" style={{ borderLeftColor: color }}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="rf-node-badge" style={{ backgroundColor: color }}>
        {STATUS_LABELS[d.status]}
      </div>
      <div className="rf-node-title">{d.label}</div>
    </div>
  );
});

export const InterventionNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as MapNodeData;
  const color = STATUS_COLORS[d.status] || "#6b7280";
  return (
    <div className="rf-node rf-node-intervention" style={{ borderLeftColor: color }}>
      <Handle type="target" position={Position.Top} />
      <div className="rf-node-title">{d.label}</div>
    </div>
  );
});

export const nodeTypes = {
  goal: GoalNode,
  pillar: PillarNode,
  strategy: StrategyNode,
  intervention: InterventionNode,
  annotation: InterventionNode,
};
