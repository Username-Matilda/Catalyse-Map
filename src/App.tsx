import { useState, useMemo } from "react";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import GraphView from "./components/GraphView";
import DetailPanel from "./components/DetailPanel";
import { initialData } from "./data/initialData";
import "./styles.css";

export default function App() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showCrossLinks, setShowCrossLinks] = useState(false);
  const [focusedSubtree, setFocusedSubtree] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const data = initialData;

  const selectedNode = useMemo(
    () => (selectedNodeId ? data.nodes.find((n) => n.id === selectedNodeId) : null),
    [selectedNodeId, data]
  );

  return (
    <div className="app">
      <TopBar
        showCrossLinks={showCrossLinks}
        onToggleCrossLinks={() => setShowCrossLinks(!showCrossLinks)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="layout">
        <Sidebar
          data={data}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />
        <GraphView
          data={data}
          showCrossLinks={showCrossLinks}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          focusedSubtree={focusedSubtree}
          onFocusSubtree={setFocusedSubtree}
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
