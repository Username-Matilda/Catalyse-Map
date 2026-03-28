import { useEffect, useRef, useState } from "react";
import Graph from "graphology";
import Sigma from "sigma";
import { createNodeBorderProgram } from "@sigma/node-border";
import { EdgeCurvedArrowProgram } from "@sigma/edge-curve";
import { MapData, ViewMode } from "../data/types";
import { buildGraph, applyCascadeLayout, applyNetworkLayout, getSubtreeNodes } from "../data/graphBuilder";
import Legend from "./Legend";

const NodeBorderProg = createNodeBorderProgram({
  borders: [
    {
      size: { attribute: "borderRatio", defaultValue: 0.1 },
      color: { attribute: "borderColor", defaultValue: "#ffffff" },
    },
    { size: { fill: true }, color: { attribute: "color" } },
  ],
});

interface GraphViewProps {
  data: MapData;
  showCrossLinks: boolean;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  focusedSubtree: string | null;
  onFocusSubtree: (id: string | null) => void;
  viewMode: ViewMode;
  highlightedTag: string | null;
}

export default function GraphView({
  data,
  showCrossLinks,
  selectedNodeId,
  onSelectNode,
  focusedSubtree,
  onFocusSubtree,
  viewMode,
  highlightedTag,
}: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Build and render graph — recreate when viewMode changes
  useEffect(() => {
    if (!containerRef.current) return;

    const graph = buildGraph(data);

    if (viewMode === "cascade") {
      applyCascadeLayout(graph, data);
    } else {
      applyNetworkLayout(graph, data);
    }

    graphRef.current = graph;

    let currentHoveredNode: string | null = null;

    const sigma = new Sigma(graph, containerRef.current, {
      allowInvalidContainer: true,
      renderEdgeLabels: false,
      labelColor: { color: "#e2e4eb" },
      labelSize: 13,
      labelWeight: "bold",
      labelFont: "Inter, sans-serif",
      defaultEdgeType: "arrow",
      labelRenderedSizeThreshold: 3,
      zoomToSizeRatioFunction: () => 1,
      defaultNodeColor: "#6b7280",
      defaultEdgeColor: "rgba(255,255,255,0.15)",
      stagePadding: 80,
      labelDensity: 1.5,
      labelGridCellSize: 120,

      nodeProgramClasses: {
        border: NodeBorderProg,
      },
      defaultNodeType: "border",
      edgeProgramClasses: {
        curvedArrow: EdgeCurvedArrowProgram,
      },

      nodeReducer: (node, attrs) => {
        const res = { ...attrs };
        const activeNode = currentHoveredNode || selectedNodeId;

        if (activeNode && graph.hasNode(activeNode)) {
          const neighbors = new Set<string>();
          neighbors.add(activeNode);
          graph.forEachNeighbor(activeNode, (neighbor) => {
            neighbors.add(neighbor);
          });

          if (node === activeNode) {
            res.highlighted = true;
            res.zIndex = 2;
          } else if (neighbors.has(node)) {
            res.zIndex = 1;
          } else {
            res.color = "rgba(100, 100, 120, 0.15)";
            res.borderColor = "rgba(100, 100, 120, 0.1)";
            res.label = null;
            res.zIndex = 0;
          }
        }

        return res;
      },

      edgeReducer: (edge, attrs) => {
        const res = { ...attrs };
        const activeNode = currentHoveredNode || selectedNodeId;

        if (activeNode && graph.hasNode(activeNode)) {
          const source = graph.source(edge);
          const target = graph.target(edge);

          if (source !== activeNode && target !== activeNode) {
            res.color = "rgba(255, 255, 255, 0.02)";
          } else {
            res.color = "rgba(255, 255, 255, 0.6)";
            res.size = (attrs.size || 1.5) + 1;
          }
        }

        return res;
      },
    });

    sigma.on("clickNode", ({ node }) => {
      onSelectNode(node);
    });

    sigma.on("doubleClickNode", ({ node }) => {
      if (viewMode === "cascade") {
        const nodeData = data.nodes.find((n) => n.id === node);
        if (nodeData && (nodeData.type === "pillar" || nodeData.type === "strategy")) {
          onFocusSubtree(node);
        }
      }
    });

    sigma.on("enterNode", ({ node }) => {
      currentHoveredNode = node;
      setHoveredNode(node);
      sigma.refresh();
    });
    sigma.on("leaveNode", () => {
      currentHoveredNode = null;
      setHoveredNode(null);
      sigma.refresh();
    });

    sigma.on("clickStage", () => {
      onSelectNode(null);
    });

    sigmaRef.current = sigma;

    return () => {
      sigma.kill();
    };
  }, [data, viewMode]);

  // Handle cross-links visibility
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    graph.forEachEdge((edge, attrs) => {
      if (attrs.edgeType === "cross-link") {
        // In network mode, always show cross-links
        graph.setEdgeAttribute(edge, "hidden", viewMode === "cascade" ? !showCrossLinks : false);
      }
    });

    sigmaRef.current?.refresh();
  }, [showCrossLinks, viewMode]);

  // Handle focused subtree (cascade mode only)
  useEffect(() => {
    if (viewMode !== "cascade") return;
    const graph = graphRef.current;
    const sigma = sigmaRef.current;
    if (!graph || !sigma) return;

    if (focusedSubtree) {
      const subtreeNodes = getSubtreeNodes(focusedSubtree, data);

      graph.forEachNode((node) => {
        graph.setNodeAttribute(node, "hidden", !subtreeNodes.has(node));
      });

      graph.forEachEdge((edge) => {
        const source = graph.source(edge);
        const target = graph.target(edge);
        graph.setEdgeAttribute(edge, "hidden",
          !subtreeNodes.has(source) || !subtreeNodes.has(target)
        );
      });

      const subtreeData: MapData = {
        nodes: data.nodes.filter((n) => subtreeNodes.has(n.id)),
        edges: data.edges.filter(
          (e) => subtreeNodes.has(e.source) && subtreeNodes.has(e.target)
        ),
      };
      applyCascadeLayout(graph, subtreeData);
    } else {
      graph.forEachNode((node) => {
        graph.setNodeAttribute(node, "hidden", false);
      });
      graph.forEachEdge((edge, attrs) => {
        const isCrossLink = attrs.edgeType === "cross-link";
        graph.setEdgeAttribute(edge, "hidden", isCrossLink && !showCrossLinks);
      });
      applyCascadeLayout(graph, data);
    }

    sigma.refresh();
    sigma.getCamera().animatedReset({ duration: 300 });
  }, [focusedSubtree, data, showCrossLinks, viewMode]);

  // Handle tag highlighting + selection dimming
  useEffect(() => {
    const sigma = sigmaRef.current;
    const graph = graphRef.current;
    if (!sigma || !graph) return;

    // Build set of node IDs matching the highlighted tag
    const taggedNodes = new Set<string>();
    if (highlightedTag) {
      for (const node of data.nodes) {
        if (node.tags.includes(highlightedTag)) {
          taggedNodes.add(node.id);
        }
      }
    }

    sigma.setSetting("nodeReducer", (node: string, attrs: any) => {
      const res = { ...attrs };

      // Tag highlighting takes priority
      if (highlightedTag) {
        if (taggedNodes.has(node)) {
          res.highlighted = true;
          res.zIndex = 2;
        } else {
          res.color = "rgba(100, 100, 120, 0.15)";
          res.borderColor = "rgba(100, 100, 120, 0.1)";
          res.label = null;
          res.zIndex = 0;
        }
        return res;
      }

      // Node hover/selection highlighting
      const activeNode = hoveredNode || selectedNodeId;
      if (activeNode && graph.hasNode(activeNode)) {
        const neighbors = new Set<string>();
        neighbors.add(activeNode);
        graph.forEachNeighbor(activeNode, (neighbor) => {
          neighbors.add(neighbor);
        });

        if (node === activeNode) {
          res.highlighted = true;
          res.zIndex = 2;
        } else if (neighbors.has(node)) {
          res.zIndex = 1;
        } else {
          res.color = "rgba(100, 100, 120, 0.15)";
          res.borderColor = "rgba(100, 100, 120, 0.1)";
          res.label = null;
          res.zIndex = 0;
        }
      }

      return res;
    });

    sigma.setSetting("edgeReducer", (edge: string, attrs: any) => {
      const res = { ...attrs };

      if (highlightedTag) {
        const source = graph.source(edge);
        const target = graph.target(edge);
        if (taggedNodes.has(source) && taggedNodes.has(target)) {
          res.color = "rgba(255, 255, 255, 0.4)";
        } else {
          res.color = "rgba(255, 255, 255, 0.02)";
        }
        return res;
      }

      const activeNode = hoveredNode || selectedNodeId;
      if (activeNode && graph.hasNode(activeNode)) {
        const source = graph.source(edge);
        const target = graph.target(edge);

        if (source !== activeNode && target !== activeNode) {
          res.color = "rgba(255, 255, 255, 0.02)";
        } else {
          res.color = "rgba(255, 255, 255, 0.6)";
          res.size = (attrs.size || 1.5) + 1;
        }
      }

      return res;
    });

    sigma.refresh();
  }, [selectedNodeId, hoveredNode, highlightedTag, data]);

  return (
    <div className="graph-view" ref={containerRef}>
      {hoveredNode && (
        <div className="graph-tooltip">
          {data.nodes.find((n) => n.id === hoveredNode)?.title}
        </div>
      )}
      {focusedSubtree && viewMode === "cascade" && (
        <button className="back-btn" onClick={() => onFocusSubtree(null)}>
          ← Back to full map
        </button>
      )}
      <Legend />
    </div>
  );
}
