import { useEffect, useRef, useState } from "react";
import Graph from "graphology";
import Sigma from "sigma";
import { MapData } from "../data/types";
import { buildGraph, applyCascadeLayout, getSubtreeNodes } from "../data/graphBuilder";

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

  // Build and render graph
  useEffect(() => {
    if (!containerRef.current) return;

    const graph = buildGraph(data);
    applyCascadeLayout(graph, data);
    graphRef.current = graph;

    const sigma = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      labelColor: { color: "#e2e4eb" },
      labelSize: 12,
      labelFont: "Inter, sans-serif",
      defaultEdgeType: "arrow",
      labelRenderedSizeThreshold: 4,
      zoomToSizeRatioFunction: () => 1,
      defaultNodeColor: "#6b7280",
      defaultEdgeColor: "rgba(255,255,255,0.12)",
      stagePadding: 60,
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

    sigma.on("enterNode", ({ node }) => setHoveredNode(node));
    sigma.on("leaveNode", () => setHoveredNode(null));

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

  // Highlight selected node
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    sigmaRef.current?.refresh();
  }, [selectedNodeId]);

  return (
    <div className="graph-view" ref={containerRef}>
      {hoveredNode && (
        <div className="graph-tooltip">
          {data.nodes.find((n) => n.id === hoveredNode)?.title}
        </div>
      )}
      {focusedSubtree && (
        <button className="back-btn" onClick={() => onFocusSubtree(null)}>
          ← Back to full map
        </button>
      )}
    </div>
  );
}
