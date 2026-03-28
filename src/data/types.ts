export type NodeType = "goal" | "pillar" | "strategy" | "intervention" | "annotation";
export type NodeStatus = "neglected" | "unfunded" | "in-progress" | "well-covered" | "unknown";

export interface Resource {
  id: string;
  type: "post" | "paper" | "org" | "grant" | "event" | "tool" | "other";
  title: string;
  url?: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  url?: string;
}

export interface ResearchQuestion {
  id: string;
  text: string;
}

export interface MapNode {
  id: string;
  title: string;
  description?: string;
  type: NodeType;
  status: NodeStatus;
  parentId?: string;
  tags: string[];
  researchQuestions: ResearchQuestion[];
  resources: Resource[];
  people: Person[];
}

export type ViewMode = "cascade" | "network";

export interface MapEdge {
  id: string;
  source: string;
  target: string;
  type: "cascade" | "cross-link";
  label?: string;
}

export interface MapData {
  nodes: MapNode[];
  edges: MapEdge[];
}
