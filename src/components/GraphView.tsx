import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MapData, ViewMode } from "../data/types";
import { buildCascadeLayout, buildNetworkLayout, getSubtreeNodes, STATUS_COLORS } from "../data/graphBuilder";
import { nodeTypes } from "./MapNodes";
import Legend from "./Legend";

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
  const layoutData = useMemo(() => {
    if (viewMode === "network") {
      return buildNetworkLayout(data);
    }

    if (focusedSubtree) {
      const subtreeNodeIds = getSubtreeNodes(focusedSubtree, data);
      const subtreeData: MapData = {
        nodes: data.nodes.filter((n) => subtreeNodeIds.has(n.id)),
        edges: data.edges.filter(
          (e) => subtreeNodeIds.has(e.source) && subtreeNodeIds.has(e.target)
        ),
      };
      return buildCascadeLayout(subtreeData);
    }

    return buildCascadeLayout(data);
  }, [data, viewMode, focusedSubtree]);

  const displayNodes = useMemo(() => {
    return layoutData.nodes.map((node) => {
      const nodeData = node.data as any;
      let className = "";

      if (highlightedTag) {
        const nodeTags: string[] = nodeData.tags || [];
        if (!nodeTags.includes(highlightedTag)) {
          className = "rf-dimmed";
        }
      } else if (selectedNodeId && selectedNodeId !== node.id) {
        const isNeighbor = data.edges.some(
          (e) =>
            (e.source === selectedNodeId && e.target === node.id) ||
            (e.target === selectedNodeId && e.source === node.id)
        );
        if (!isNeighbor) {
          className = "rf-dimmed";
        }
      }

      return {
        ...node,
        className,
        selected: node.id === selectedNodeId,
      };
    });
  }, [layoutData.nodes, highlightedTag, selectedNodeId, data.edges]);

  const displayEdges = useMemo(() => {
    return layoutData.edges.filter((edge) => {
      const edgeData = edge.data as any;
      if (edgeData?.edgeType === "cross-link") {
        return viewMode === "network" || showCrossLinks;
      }
      return true;
    }).map((edge) => {
      let opacity = 1;

      if (highlightedTag) {
        const sourceNode = data.nodes.find((n) => n.id === edge.source);
        const targetNode = data.nodes.find((n) => n.id === edge.target);
        const srcHasTag = sourceNode?.tags.includes(highlightedTag);
        const tgtHasTag = targetNode?.tags.includes(highlightedTag);
        if (!srcHasTag || !tgtHasTag) {
          opacity = 0.08;
        }
      } else if (selectedNodeId) {
        if (edge.source !== selectedNodeId && edge.target !== selectedNodeId) {
          opacity = 0.08;
        }
      }

      return {
        ...edge,
        style: {
          ...edge.style,
          opacity,
        },
      };
    });
  }, [layoutData.edges, showCrossLinks, viewMode, highlightedTag, selectedNodeId, data.nodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(displayNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(displayEdges);

  useMemo(() => {
    setNodes(displayNodes);
    setEdges(displayEdges);
  }, [displayNodes, displayEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (viewMode === "cascade") {
        const nodeData = data.nodes.find((n) => n.id === node.id);
        if (nodeData && (nodeData.type === "pillar" || nodeData.type === "strategy")) {
          onFocusSubtree(node.id);
        }
      }
    },
    [data, viewMode, onFocusSubtree]
  );

  const onPaneClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  return (
    <div className="graph-view">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={viewMode === "network"}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: "smoothstep",
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={30} size={1} color="rgba(255,255,255,0.06)" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const d = node.data as any;
            if (d.nodeType === "goal") return "#f59e0b";
            if (d.nodeType === "pillar") return "#3b82f6";
            return STATUS_COLORS[d.status as keyof typeof STATUS_COLORS] || "#6b7280";
          }}
          maskColor="rgba(15, 17, 23, 0.8)"
          style={{ background: "#1a1d27", borderColor: "#2a2e3d" }}
        />
      </ReactFlow>

      {focusedSubtree && viewMode === "cascade" && (
        <button className="back-btn" onClick={() => onFocusSubtree(null)}>
          \u2190 Back to full map
        </button>
      )}
      <Legend />
    </div>
  );
}
