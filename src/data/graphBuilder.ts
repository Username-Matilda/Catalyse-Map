import Graph from "graphology";
import { MapData, NodeType, NodeStatus } from "./types";

const NODE_SIZES: Record<NodeType, number> = {
  goal: 20,
  pillar: 15,
  strategy: 10,
  intervention: 7,
  annotation: 6,
};

const STATUS_COLORS: Record<NodeStatus, string> = {
  "well-covered": "#22c55e",
  "in-progress": "#f59e0b",
  neglected: "#ef4444",
  unfunded: "#a855f7",
  unknown: "#6b7280",
};

const TYPE_COLORS: Record<NodeType, string> = {
  goal: "#f59e0b",
  pillar: "#3b82f6",
  strategy: "#e2e4eb",
  intervention: "#e2e4eb",
  annotation: "#6b7280",
};

export function buildGraph(data: MapData): Graph {
  const graph = new Graph();

  for (const node of data.nodes) {
    graph.addNode(node.id, {
      label: node.title,
      size: NODE_SIZES[node.type],
      color: node.type === "goal" || node.type === "pillar"
        ? TYPE_COLORS[node.type]
        : STATUS_COLORS[node.status],
      nodeType: node.type,
      status: node.status,
      x: 0,
      y: 0,
    });
  }

  for (const edge of data.edges) {
    if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      graph.addEdge(edge.source, edge.target, {
        edgeType: edge.type,
        label: edge.label,
        color: edge.type === "cross-link"
          ? "rgba(168, 85, 247, 0.35)"
          : "rgba(255, 255, 255, 0.12)",
        size: edge.type === "cross-link" ? 1 : 1.5,
        type: "arrow",
      });
    }
  }

  return graph;
}

// Hierarchical top-down layout for cascade view
export function applyCascadeLayout(graph: Graph, data: MapData) {
  const children = new Map<string, string[]>();
  const roots: string[] = [];

  for (const node of data.nodes) {
    if (node.parentId) {
      const siblings = children.get(node.parentId) || [];
      siblings.push(node.id);
      children.set(node.parentId, siblings);
    } else {
      roots.push(node.id);
    }
  }

  const layerCount: Record<number, number> = {};
  const layerIndex: Record<number, number> = {};

  // First pass: count nodes per layer
  function countLayer(nodeId: string, depth: number) {
    layerCount[depth] = (layerCount[depth] || 0) + 1;
    const kids = children.get(nodeId) || [];
    for (const kid of kids) {
      countLayer(kid, depth + 1);
    }
  }
  for (const root of roots) countLayer(root, 0);

  // Second pass: assign positions
  function assignPositions(nodeId: string, depth: number) {
    const count = layerCount[depth] || 1;
    const idx = layerIndex[depth] || 0;
    layerIndex[depth] = idx + 1;

    const spacing = Math.max(8, 40 / count);
    const totalWidth = spacing * (count - 1);
    const x = -totalWidth / 2 + idx * spacing;
    const y = -depth * 10;

    if (graph.hasNode(nodeId)) {
      graph.setNodeAttribute(nodeId, "x", x);
      graph.setNodeAttribute(nodeId, "y", y);
    }

    const kids = children.get(nodeId) || [];
    for (const kid of kids) {
      assignPositions(kid, depth + 1);
    }
  }

  for (const root of roots) {
    assignPositions(root, 0);
  }
}

// Get the subtree rooted at a given node
export function getSubtreeNodes(nodeId: string, data: MapData): Set<string> {
  const result = new Set<string>();
  result.add(nodeId);
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const node of data.nodes) {
      if (node.parentId === current && !result.has(node.id)) {
        result.add(node.id);
        queue.push(node.id);
      }
    }
  }
  return result;
}
