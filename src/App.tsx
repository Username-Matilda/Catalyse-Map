import { useState, useMemo } from "react";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import GraphView from "./components/GraphView";
import DetailPanel from "./components/DetailPanel";
import { initialData } from "./data/initialData";
import { ViewMode } from "./data/types";
import "./styles.css";

export default function App() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showCrossLinks, setShowCrossLinks] = useState(false);
  const [focusedSubtree, setFocusedSubtree] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("cascade");
  const [highlightedTag, setHighlightedTag] = useState<string | null>(null);

  const data = initialData;

  const selectedNode = useMemo(
    () => (selectedNodeId ? data.nodes.find((n) => n.id === selectedNodeId) : null),
    [selectedNodeId, data]
  );

  // When switching to network mode, clear focused subtree
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setFocusedSubtree(null);
  };

  return (
    <div className="app">
      <TopBar
        showCrossLinks={showCrossLinks}
        onToggleCrossLinks={() => setShowCrossLinks(!showCrossLinks)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
      <div className="layout">
        <Sidebar
          data={data}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          viewMode={viewMode}
          highlightedTag={highlightedTag}
          onHighlightTag={setHighlightedTag}
        />
        <GraphView
          data={data}
          showCrossLinks={showCrossLinks}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          focusedSubtree={focusedSubtree}
          onFocusSubtree={setFocusedSubtree}
          viewMode={viewMode}
          highlightedTag={highlightedTag}
        />
        {selectedNode && (
          <DetailPanel
            node={selectedNode}
            data={data}
            onClose={() => setSelectedNodeId(null)}
            onSelectNode={setSelectedNodeId}
            onFocusSubtree={setFocusedSubtree}
          />
        )}
      </div>
    </div>
  );
}
