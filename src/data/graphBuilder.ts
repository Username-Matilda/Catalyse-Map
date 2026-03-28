import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { MapData, NodeType, NodeStatus } from "./types";

const NODE_SIZES: Record<NodeType, number> = {
  goal: 32,
  pillar: 24,
  strategy: 16,
  intervention: 11,
  annotation: 9,
};

export const STATUS_COLORS: Record<NodeStatus, string> = {
  "well-covered": "#22c55e",
  "in-progress": "#f59e0b",
  neglected: "#ef4444",
  unfunded: "#a855f7",
  unknown: "#6b7280",
};

export const TYPE_COLORS: Record<NodeType, string> = {
  goal: "#f59e0b",
  pillar: "#3b82f6",
  strategy: "#e2e4eb",
  intervention: "#e2e4eb",
  annotation: "#6b7280",
};

export function buildGraph(data: MapData): Graph {
  const graph = new Graph();

  for (const node of data.nodes) {
    const isTopLevel = node.type === "goal" || node.type === "pillar";
    graph.addNode(node.id, {
      label: node.title,
      size: NODE_SIZES[node.type],
      color: isTopLevel ? "#1a1d27" : STATUS_COLORS[node.status],
      borderColor: isTopLevel ? TYPE_COLORS[node.type] : STATUS_COLORS[node.status],
      borderRatio: isTopLevel ? 0.15 : 0.08,
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
          ? "rgba(168, 85, 247, 0.7)"
          : "rgba(255, 255, 255, 0.25)",
        size: edge.type === "cross-link" ? 1.5 : 2,
        type: edge.type === "cross-link" ? "curvedArrow" : "arrow",
        curvature: edge.type === "cross-link" ? 0.3 : 0,
      });
    }
  }

  return graph;
}

export function applyCascadeLayout(graph: Graph, data: MapData) {
  const childrenMap = new Map<string, string[]>();
  const roots: string[] = [];

  for (const node of data.nodes) {
    if (node.parentId) {
      const siblings = childrenMap.get(node.parentId) || [];
      siblings.push(node.id);
      childrenMap.set(node.parentId, siblings);
    } else {
      roots.push(node.id);
    }
  }

  const subtreeWidth = new Map<string, number>();

  function calcWidth(nodeId: string): number {
    const kids = childrenMap.get(nodeId) || [];
    if (kids.length === 0) {
      subtreeWidth.set(nodeId, 1);
      return 1;
    }
    let total = 0;
    for (const kid of kids) {
      total += calcWidth(kid);
    }
    subtreeWidth.set(nodeId, total);
    return total;
  }

  for (const root of roots) {
    calcWidth(root);
  }

  const LEAF_SPACING = 14;
  const DEPTH_SPACING = 12;

  function assignPositions(nodeId: string, depth: number, leftX: number, allocatedWidth: number) {
    const centerX = leftX + allocatedWidth / 2;
    const y = -depth * DEPTH_SPACING;

    if (graph.hasNode(nodeId)) {
      graph.setNodeAttribute(nodeId, "x", centerX);
      graph.setNodeAttribute(nodeId, "y", y);
    }

    const kids = childrenMap.get(nodeId) || [];
    if (kids.length === 0) return;

    const totalChildWidth = kids.reduce((sum, kid) => sum + (subtreeWidth.get(kid) || 1), 0);
    let currentX = leftX;

    for (const kid of kids) {
      const kidWidth = subtreeWidth.get(kid) || 1;
      const kidAllocated = (kidWidth / totalChildWidth) * allocatedWidth;
      assignPositions(kid, depth + 1, currentX, kidAllocated);
      currentX += kidAllocated;
    }
  }

  const totalLeaves = roots.reduce((sum, root) => sum + (subtreeWidth.get(root) || 1), 0);
  const totalWidth = totalLeaves * LEAF_SPACING;

  let currentX = -totalWidth / 2;
  for (const root of roots) {
    const rootWidth = subtreeWidth.get(root) || 1;
    const rootAllocated = (rootWidth / totalLeaves) * totalWidth;
    assignPositions(root, 0, currentX, rootAllocated);
    currentX += rootAllocated;
  }
}

export const TAG_COLORS: Record<string, string> = {
  policy: "#3b82f6",
  messaging: "#f59e0b",
  organizing: "#22c55e",
  labor: "#ef4444",
  economic: "#a855f7",
  branding: "#ec4899",
  writing: "#14b8a6",
  lobbying: "#6366f1",
  research: "#06b6d4",
  regional: "#84cc16",
  "coalition-building": "#f97316",
  "talent-pipeline": "#8b5cf6",
  "proof-of-concept": "#0ea5e9",
};

// Network layout: force-directed with tag-based attraction edges
export function applyNetworkLayout(graph: Graph, data: MapData) {
  // Add temporary "tag hub" nodes and edges to create tag-based clustering
  const tagGraph = graph.copy();
  const tagHubs: string[] = [];

  // Collect all tags
  const allTags = new Set<string>();
  for (const node of data.nodes) {
    for (const tag of node.tags) {
      allTags.add(tag);
    }
  }

  // Add invisible tag hub nodes and connect tagged nodes to them
  for (const tag of allTags) {
    const hubId = `__tag_hub_${tag}`;
    tagHubs.push(hubId);
    tagGraph.addNode(hubId, { x: Math.random() * 100 - 50, y: Math.random() * 100 - 50, size: 1 });

    for (const node of data.nodes) {
      if (node.tags.includes(tag) && tagGraph.hasNode(node.id)) {
        tagGraph.addEdge(node.id, hubId, { weight: 3 });
      }
    }
  }

  // Randomize starting positions
  tagGraph.forEachNode((node) => {
    if (!tagHubs.includes(node)) {
      tagGraph.setNodeAttribute(node, "x", Math.random() * 100 - 50);
      tagGraph.setNodeAttribute(node, "y", Math.random() * 100 - 50);
    }
  });

  // Run force-directed layout on the augmented graph
  forceAtlas2.assign(tagGraph, {
    iterations: 200,
    settings: {
      gravity: 0.8,
      scalingRatio: 12,
      strongGravityMode: false,
      barnesHutOptimize: true,
      slowDown: 5,
      edgeWeightInfluence: 1,
    },
  });

  // Copy positions back to the real graph (skip tag hubs)
  tagGraph.forEachNode((node, attrs) => {
    if (!tagHubs.includes(node) && graph.hasNode(node)) {
      graph.setNodeAttribute(node, "x", attrs.x);
      graph.setNodeAttribute(node, "y", attrs.y);
    }
  });
}

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
