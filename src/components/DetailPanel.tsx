import { MapNode, MapData } from "../data/types";

interface DetailPanelProps {
  node: MapNode;
  data: MapData;
  onClose: () => void;
  onSelectNode: (id: string) => void;
  onFocusSubtree: (id: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  "well-covered": "Well covered",
  "in-progress": "In progress",
  neglected: "Neglected",
  unfunded: "Unfunded",
  unknown: "Unknown",
};

const STATUS_CLASSES: Record<string, string> = {
  "well-covered": "badge-well-covered",
  "in-progress": "badge-in-progress",
  neglected: "badge-neglected",
  unfunded: "badge-unfunded",
  unknown: "badge-unknown",
};

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  post: "Post",
  paper: "Paper",
  org: "Org",
  grant: "Grant",
  event: "Event",
  tool: "Tool",
  other: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  "well-covered": "#22c55e",
  "in-progress": "#f59e0b",
  neglected: "#ef4444",
  unfunded: "#a855f7",
  unknown: "#6b7280",
};

export default function DetailPanel({
  node,
  data,
  onClose,
  onSelectNode,
  onFocusSubtree,
}: DetailPanelProps) {
  const children = data.nodes.filter((n) => n.parentId === node.id);
  const canExpand = node.type === "pillar" || node.type === "strategy";

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <div className="detail-type">{node.type}</div>
          <div className="detail-title">{node.title}</div>
        </div>
        <button className="detail-close" onClick={onClose}>
          &times;
        </button>
      </div>

      {/* Status */}
      <div className="detail-section">
        <span className={`node-badge ${STATUS_CLASSES[node.status]}`}>
          {STATUS_LABELS[node.status]}
        </span>
        {canExpand && (
          <button
            className="expand-btn"
            onClick={() => onFocusSubtree(node.id)}
          >
            Expand subtree →
          </button>
        )}
      </div>

      {/* Description */}
      {node.description && (
        <div className="detail-section">
          <div className="detail-section-title">Description</div>
          <div className="detail-description">{node.description}</div>
        </div>
      )}

      {/* Research Questions */}
      <div className="detail-section">
        <div className="detail-section-title">
          Research Questions
          <span className="count">{node.researchQuestions.length}</span>
        </div>
        {node.researchQuestions.map((q) => (
          <div key={q.id} className="research-q">
            {q.text}
          </div>
        ))}
        <button className="add-btn">+ Add a research question</button>
      </div>

      {/* Resources */}
      <div className="detail-section">
        <div className="detail-section-title">
          Resources
          <span className="count">{node.resources.length}</span>
        </div>
        {node.resources.map((r) => (
          <div key={r.id} className="resource-item">
            <span className="resource-tag">
              {RESOURCE_TYPE_LABELS[r.type]}
            </span>
            {r.url ? (
              <a className="resource-link" href={r.url} target="_blank" rel="noreferrer">
                {r.title}
              </a>
            ) : (
              <span>{r.title}</span>
            )}
          </div>
        ))}
        <button className="add-btn">+ Add a resource</button>
      </div>

      {/* People */}
      <div className="detail-section">
        <div className="detail-section-title">
          Who's on this
          <span className="count">{node.people.length}</span>
        </div>
        {node.people.map((p) => (
          <div key={p.id} className="person-item">
            <div className="person-avatar">
              {p.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <div className="person-name">
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noreferrer">{p.name}</a>
                ) : (
                  p.name
                )}
              </div>
              <div className="person-role">{p.role}</div>
            </div>
          </div>
        ))}
        <button className="add-btn">+ I'm working on this</button>
        <button className="add-btn">+ I know someone working on this</button>
      </div>

      {/* Child Nodes */}
      {children.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-title">
            Child nodes
            <span className="count">{children.length}</span>
          </div>
          {children.map((child) => (
            <div
              key={child.id}
              className="child-node-item"
              onClick={() => onSelectNode(child.id)}
            >
              <span
                className="status-dot"
                style={{ backgroundColor: STATUS_COLORS[child.status] }}
              />
              <span>{child.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
