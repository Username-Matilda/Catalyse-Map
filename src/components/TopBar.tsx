interface TopBarProps {
  showCrossLinks: boolean;
  onToggleCrossLinks: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function TopBar({
  showCrossLinks,
  onToggleCrossLinks,
  searchQuery,
  onSearchChange,
}: TopBarProps) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">Catalyse Map</div>
        <div className="topbar-subtitle">AI Pause Interventions</div>
      </div>
      <div className="topbar-controls">
        <input
          className="search-input"
          placeholder="Search interventions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button
          className={`toggle-btn ${showCrossLinks ? "active" : ""}`}
          onClick={onToggleCrossLinks}
        >
          Cross-links
        </button>
        <button className="toggle-btn add-node-btn">+ Add node</button>
      </div>
    </div>
  );
}
