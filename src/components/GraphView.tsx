import { useEffect, useRef, useState, useCallback } from "react";
import Graph from "graphology";
import Sigma from "sigma";
import { MapData } from "../data/types";
import { buildGraph, applyCascadeLayout, getSubtreeNodes } from "../data/graphBuilder";
import Legend from "./Legend";

interface GraphViewProps {
  data: MapData;
  showCrossLinks: boolean;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  focusedSubtree: string | null;
  onFocusSubtree: (id: string | null) => void;
}

export default function GraphView({
  data,
  showCrossLinks,
  selectedNodeId,
  onSelectNode,
  focusedSubtree,
  onFocusSubtree,
}: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Compute neighbor sets for hover/selection highlighting
  const getNeighborSet = useCallback(
    (nodeId: string, graph: Graph): Set<string> => {
      const neighbors = new Set<string>();
      neighbors.add(nodeId);
      graph.forEachNeighbor(nodeId, (neighbor) => {
        neighbors.add(neighbor);
      });
      return neighbors;
    },
    [],
  );

  // Build and render graph
  useEffect(() => {
    if (!containerRef.current) return;

    const graph = buildGraph(data);
    applyCascadeLayout(graph, data);
    graphRef.current = graph;

    // We capture the current state in a closure-safe way
    let currentHoveredNode: string | null = null;
    let currentSelectedNode: string | null = selectedNodeId;

    const sigma = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      labelColor: { color: "#e2e4eb" },
      labelSize: 14,
      labelWeight: "bold",
      labelFont: "Inter, sans-serif",
      defaultEdgeType: "arrow",
      labelRenderedSizeThreshold: 6,
      zoomToSizeRatioFunction: () => 1,
      defaultNodeColor: "#6b7280",
      defaultEdgeColor: "rgba(255,255,255,0.12)",
      stagePadding: 60,
      labelDensity: 2,
      labelGridCellSize: 100,

      // Node reducer: handles hover dimming + selection highlight
      nodeReducer: (node, attrs) => {
        const res = { ...attrs };
        const activeNode = currentHoveredNode || currentSelectedNode;

        if (activeNode) {
          const neighbors = new Set<string>();
          neighbors.add(activeNode);
          graph.forEachNeighbor(activeNode, (neighbor) => {
            neighbors.add(neighbor);
          });

          if (node === activeNode) {
            // Highlighted ring for the active node
            res.highlighted = true;
            res.zIndex = 2;
          } else if (neighbors.has(node)) {
            // Neighbors stay visible
            res.zIndex = 1;
          } else {
            // Dim everything else
            res.color = "rgba(255, 255, 255, 0.08)";
            res.label = null;
            res.zIndex = 0;
          }
        }

        return res;
      },

      // Edge reducer: dim edges not connected to hovered/selected node
      edgeReducer: (edge, attrs) => {
        const res = { ...attrs };
        const activeNode = currentHoveredNode || currentSelectedNode;

        if (activeNode) {
          const source = graph.source(edge);
          const target = graph.target(edge);

          if (source !== activeNode && target !== activeNode) {
            res.color = "rgba(255, 255, 255, 0.03)";
            res.hidden = false;
          } else {
            // Make connected edges more visible
            res.color = "rgba(255, 255, 255, 0.5)";
            res.size = (attrs.size || 1.5) + 0.5;
          }
        }

        return res;
      },
    });

    sigma.on("clickNode", ({ node }) => {
      onSelectNode(node);
    });

    sigma.on("doubleClickNode", ({ node }) => {
      const nodeData = data.nodes.find((n) => n.id === node);
      if (nodeData && (nodeData.type === "pillar" || nodeData.type === "strategy")) {
        onFocusSubtree(node);
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

    // Click on stage to deselect
    sigma.on("clickStage", () => {
      onSelectNode(null);
    });

    sigmaRef.current = sigma;

    return () => {
      sigma.kill();
    };
  }, [data]);

  // Handle cross-links visibility
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    graph.forEachEdge((edge, attrs) => {
      if (attrs.edgeType === "cross-link") {
        graph.setEdgeAttribute(edge, "hidden", !showCrossLinks);
      }
    });

    sigmaRef.current?.refresh();
  }, [showCrossLinks]);

  // Handle focused subtree (click-to-expand)
  useEffect(() => {
    const graph = graphRef.current;
    const sigma = sigmaRef.current;
    if (!graph || !sigma) return;

    if (focusedSubtree) {
      const subtreeNodes = getSubtreeNodes(focusedSubtree, data);

      graph.forEachNode((node) => {
        const inSubtree = subtreeNodes.has(node);
        graph.setNodeAttribute(node, "hidden", !inSubtree);
        if (inSubtree) {
          graph.setNodeAttribute(node, "color",
            graph.getNodeAttribute(node, "color") || "#6b7280"
          );
        }
      });

      graph.forEachEdge((edge) => {
        const source = graph.source(edge);
        const target = graph.target(edge);
        graph.setEdgeAttribute(edge, "hidden",
          !subtreeNodes.has(source) || !subtreeNodes.has(target)
        );
      });

      // Re-layout just the subtree
      const subtreeData: MapData = {
        nodes: data.nodes.filter((n) => subtreeNodes.has(n.id)),
        edges: data.edges.filter(
          (e) => subtreeNodes.has(e.source) && subtreeNodes.has(e.target)
        ),
      };
      applyCascadeLayout(graph, subtreeData);
    } else {
      // Show all nodes
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
  }, [focusedSubtree, data, showCrossLinks]);

  // Update selected node in the reducer's closure
  useEffect(() => {
    const sigma = sigmaRef.current;
    const graph = graphRef.current;
    if (!sigma || !graph) return;

    sigma.setSetting("nodeReducer", (node: string, attrs: any) => {
      const res = { ...attrs };
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
          res.color = "rgba(255, 255, 255, 0.08)";
          res.label = null;
          res.zIndex = 0;
        }
      }

      return res;
    });

    sigma.setSetting("edgeReducer", (edge: string, attrs: any) => {
      const res = { ...attrs };
      const activeNode = hoveredNode || selectedNodeId;

      if (activeNode && graph.hasNode(activeNode)) {
        const source = graph.source(edge);
        const target = graph.target(edge);

        if (source !== activeNode && target !== activeNode) {
          res.color = "rgba(255, 255, 255, 0.03)";
        } else {
          res.color = "rgba(255, 255, 255, 0.5)";
          res.size = (attrs.size || 1.5) + 0.5;
        }
      }

      return res;
    });

    sigma.refresh();
  }, [selectedNodeId, hoveredNode]);

  return (
    <div className="graph-view" ref={containerRef}>
      {hoveredNode && (
        <div className="graph-tooltip">
          {data.nodes.find((n) => n.id === hoveredNode)?.title}
        </div>
      )}
      {focusedSubtree && (
        <button className="back-btn" onClick={() => onFocusSubtree(null)}>
          \u2190 Back to full map
        </button>
      )}
      <Legend />
    </div>
  );
}
