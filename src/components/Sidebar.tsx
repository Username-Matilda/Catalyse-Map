import { useState, useMemo } from "react";
import { MapData, MapNode, ViewMode } from "../data/types";
import { TAG_COLORS } from "../data/graphBuilder";

interface SidebarProps {
  data: MapData;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  viewMode: ViewMode;
  highlightedTag: string | null;
  onHighlightTag: (tag: string | null) => void;
}

const STATUS_COLORS: Record<string, string> = {
  "well-covered": "#22c55e",
  "in-progress": "#f59e0b",
  neglected: "#ef4444",
  unfunded: "#a855f7",
  unknown: "#6b7280",
};

// ── Tree View (cascade mode) ──

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

// ── Tag View (network mode) ──

function TagGroup({
  tag,
  nodes,
  selectedNodeId,
  onSelectNode,
  isHighlighted,
  onHighlightTag,
}: {
  tag: string;
  nodes: MapNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  isHighlighted: boolean;
  onHighlightTag: (tag: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const color = TAG_COLORS[tag] || "#6b7280";

  return (
    <div className="tag-group">
      <div
        className={`tag-group-header ${isHighlighted ? "highlighted" : ""}`}
        onClick={() => onHighlightTag(isHighlighted ? null : tag)}
      >
        <span
          className={`tree-arrow ${expanded ? "expanded" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          &#9654;
        </span>
        <span className="tag-pill" style={{ backgroundColor: color }}>
          {tag}
        </span>
        <span className="tag-count">{nodes.length}</span>
      </div>
      {expanded && (
        <div className="tag-group-nodes">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`tree-node ${selectedNodeId === node.id ? "selected" : ""}`}
              style={{ paddingLeft: 32 }}
              onClick={() => onSelectNode(node.id)}
            >
              <span
                className="status-dot"
                style={{ backgroundColor: STATUS_COLORS[node.status] }}
              />
              <span className="tree-label">{node.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  data,
  selectedNodeId,
  onSelectNode,
  viewMode,
  highlightedTag,
  onHighlightTag,
}: SidebarProps) {
  const roots = data.nodes.filter((n) => !n.parentId);

  // Group nodes by tag for network view
  const tagGroups = useMemo(() => {
    const groups = new Map<string, MapNode[]>();
    for (const node of data.nodes) {
      for (const tag of node.tags) {
        const list = groups.get(tag) || [];
        list.push(node);
        groups.set(tag, list);
      }
    }
    // Sort by count descending
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [data]);

  if (viewMode === "cascade") {
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

  return (
    <div className="sidebar">
      <div className="sidebar-header">By Tag</div>
      {tagGroups.map(([tag, nodes]) => (
        <TagGroup
          key={tag}
          tag={tag}
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          isHighlighted={highlightedTag === tag}
          onHighlightTag={onHighlightTag}
        />
      ))}
    </div>
  );
}
