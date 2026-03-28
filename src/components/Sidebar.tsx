import { useState } from "react";
import { MapData, MapNode } from "../data/types";

interface SidebarProps {
  data: MapData;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  "well-covered": "#22c55e",
  "in-progress": "#f59e0b",
  neglected: "#ef4444",
  unfunded: "#a855f7",
  unknown: "#6b7280",
};

function TreeNode({
  node,
  data,
  depth,
  selectedNodeId,
  onSelectNode,
}: {
  node: MapNode;
  data: MapData;
  depth: number;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const children = data.nodes.filter((n) => n.parentId === node.id);
  const hasChildren = children.length > 0;
  const isSelected = selectedNodeId === node.id;

  return (
    <div>
      <div
        className={`tree-node ${isSelected ? "selected" : ""}`}
        style={{ paddingLeft: 16 + depth * 16 }}
        onClick={() => onSelectNode(node.id)}
      >
        {hasChildren && (
          <span
            className={`tree-arrow ${expanded ? "expanded" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            &#9654;
          </span>
        )}
        {!hasChildren && <span className="tree-arrow-spacer" />}
        <span
          className="status-dot"
          style={{ backgroundColor: STATUS_COLORS[node.status] }}
        />
        <span className="tree-label">{node.title}</span>
      </div>
      {hasChildren && expanded && (
        <div className="tree-children">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              data={data}
              depth={depth + 1}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ data, selectedNodeId, onSelectNode }: SidebarProps) {
  const roots = data.nodes.filter((n) => !n.parentId);

  return (
    <div className="sidebar">
      <div className="sidebar-header">Intervention Tree</div>
      {roots.map((root) => (
        <TreeNode
          key={root.id}
          node={root}
          data={data}
          depth={0}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
        />
      ))}
    </div>
  );
}
