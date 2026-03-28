import { MapData } from "./types";

export const initialData: MapData = {
  nodes: [
    // ── GOAL ──
    {
      id: "goal",
      title: "Globally endorsed & enforced 10yr+ AI Pause",
      description:
        "A globally endorsed and enforced 10 year+ pause on frontier AI/ASI research, with deep public and institutional buy-in. Key components: (1) add friction to buy time, (2) channel things in the right direction for pause tractability, buy-in and ease of implementation.",
      type: "goal",
      status: "unknown",
      researchQuestions: [
        { id: "gq1", text: "What does 'frontier AI' actually mean in a treaty context — where is the line?" },
        { id: "gq2", text: "What are the most plausible enforcement mechanisms for a global pause?" },
      ],
      resources: [],
      people: [],
    },

    // ── PILLARS ──
    {
      id: "treaty",
      title: "Enforced International Treaty",
      description:
        "A binding international treaty that prohibits frontier AI capabilities research, with real enforcement mechanisms. Requires broad state-level buy-in and verification infrastructure.",
      type: "pillar",
      status: "in-progress",
      parentId: "goal",
      researchQuestions: [
        { id: "tq1", text: "Which existing treaty frameworks (NPT, CWC, etc.) are closest analogues?" },
        { id: "tq2", text: "What verification mechanisms could detect covert frontier AI research?" },
        { id: "tq3", text: "Which nations are most/least likely to sign, and what are their incentives?" },
      ],
      resources: [
        { id: "tr1", type: "paper", title: "Pause Giant AI Experiments: An Open Letter", url: "https://futureoflife.org/open-letter/pause-giant-ai-experiments/" },
      ],
      people: [],
    },
    {
      id: "public-buyin",
      title: "Buy-in from global populations",
      description:
        "Deep, widespread public support for an AI pause — not just awareness, but active demand. People need to understand the risks, feel empowered to act, and see clear pathways to making a difference.",
      type: "pillar",
      status: "neglected",
      parentId: "goal",
      researchQuestions: [
        { id: "pq1", text: "What does public opinion on AI risk actually look like across countries?" },
        { id: "pq2", text: "Which framings of AI risk resonate most with different demographics?" },
      ],
      resources: [],
      people: [],
    },
    {
      id: "economic",
      title: "Economic incentives changed to decrease capabilities advantage",
      description:
        "Reshape the economic landscape so that pursuing frontier AI capabilities is less financially attractive, and safety/pause-aligned activity is more rewarded.",
      type: "pillar",
      status: "neglected",
      parentId: "goal",
      researchQuestions: [
        { id: "eq1", text: "How much of the AI investment boom is based on realistic vs. inflated expectations?" },
        { id: "eq2", text: "What economic levers (subsidies, taxes, procurement rules) could shift incentives?" },
      ],
      resources: [],
      people: [],
    },

    // ── STRATEGIES (Treaty) ──
    {
      id: "policy-prospects",
      title: "Advance policy prospects",
      description:
        "Build the policy pipeline: draft model legislation, brief policymakers, develop relationships with government officials, and create the conditions for treaty negotiations.",
      type: "strategy",
      status: "in-progress",
      parentId: "treaty",
      researchQuestions: [
        { id: "ppq1", text: "Which legislators/officials are most receptive and influential?" },
        { id: "ppq2", text: "What policy wins (even small ones) would create momentum toward a treaty?" },
      ],
      resources: [],
      people: [],
    },

    // ── STRATEGIES (Public buy-in) ──
    {
      id: "messaging",
      title: "Messaging & framing",
      description:
        "Develop messaging that informs, empowers, effectively directs and motivates people. Reach into IRL communities. Have clear goals. The framing needs to feel more like 'climate change' and less like 'antivax'.",
      type: "strategy",
      status: "neglected",
      parentId: "public-buyin",
      researchQuestions: [
        { id: "mq1", text: "What framings have been tested? What resonates vs. backfires?" },
        { id: "mq2", text: "How do we avoid the 'AI doomer' label while communicating genuine risk?" },
      ],
      resources: [],
      people: [],
    },
    {
      id: "community-organising",
      title: "Community organising",
      description:
        "Organise people into becoming organisers in their communities. If we expect heavy job losses, mobilise people then. Build IRL networks that can take coordinated action.",
      type: "strategy",
      status: "neglected",
      parentId: "public-buyin",
      researchQuestions: [
        { id: "coq1", text: "Which communities are most affected by AI displacement and most ready to organise?" },
      ],
      resources: [],
      people: [],
    },
    {
      id: "talent-funnel",
      title: "Funnel talented people toward useful interventions",
      description:
        "Identify talented people who want to help and channel them toward the highest-impact interventions. Reduce the gap between 'I want to help' and 'I am helping effectively'.",
      type: "strategy",
      status: "in-progress",
      parentId: "public-buyin",
      researchQuestions: [
        { id: "tfq1", text: "What are the biggest bottlenecks for people trying to contribute?" },
      ],
      resources: [],
      people: [],
    },
    {
      id: "neglected-regions",
      title: "Neglected regions: Asia & Africa",
      description:
        "Asia and Africa are neglected in pause advocacy. Consider supply chain implications — civil servants, miners for raw minerals, and other people who are important links in the chain whose buy-in could cause friction.",
      type: "strategy",
      status: "neglected",
      parentId: "public-buyin",
      researchQuestions: [
        { id: "nrq1", text: "Which supply chain actors have the most leverage over AI hardware production?" },
        { id: "nrq2", text: "What does AI risk discourse look like in major Asian and African countries?" },
      ],
      resources: [],
      people: [],
    },

    // ── STRATEGIES (Economic) ──
    {
      id: "burst-bubble",
      title: "Burst the AI bubble",
      description:
        "Show that AI investment is overvalued. Convince asset holders their AI-related assets will depreciate. Anti-AI sentiment is already present — inform and direct it. Show software companies that the rise of AI can be mitigated.",
      type: "strategy",
      status: "unfunded",
      parentId: "economic",
      researchQuestions: [
        { id: "bbq1", text: "What's the best evidence that AI capabilities are overhyped relative to investment?" },
        { id: "bbq2", text: "Can we prove AI capabilities gains can be slowed down, as a proof of concept?" },
      ],
      resources: [],
      people: [],
    },
    {
      id: "rebrand-pause",
      title: "Rebranding the pause",
      description:
        "Create a brand that says 'pausing is how the world works'. Change the branding of a 'pause' to be more like 'climate change' and less 'antivax'. Make it feel mainstream, responsible, and inevitable.",
      type: "strategy",
      status: "neglected",
      parentId: "economic",
      researchQuestions: [
        { id: "rpq1", text: "What successful rebranding campaigns from other movements can we learn from?" },
      ],
      resources: [],
      people: [],
    },
    {
      id: "union-organising",
      title: "Union organising in AI labs",
      description:
        "Organise AI lab employees into unions that can collectively bargain for safety conditions, including conditional agreements to pause frontier capabilities research.",
      type: "strategy",
      status: "unfunded",
      parentId: "economic",
      researchQuestions: [
        { id: "uoq1", text: "What legal frameworks exist for tech worker unionisation in US, UK, and EU?" },
        { id: "uoq2", text: "Which labs have the most receptive employee sentiment toward collective action?" },
        { id: "uoq3", text: "What would a 'conditional pause agreement' actually look like contractually?" },
      ],
      resources: [
        { id: "ur1", type: "org", title: "Alphabet Workers Union — case study" },
      ],
      people: [
        { id: "up1", name: "Jamie Richardson", role: "Researching legal frameworks" },
        { id: "up2", name: "Sarah Kim", role: "Connected to Anthropic employees" },
      ],
    },
    {
      id: "adoption-advisors",
      title: "Influence people who inform entities on how to adopt AI",
      description:
        "Target the consultants, analysts, and advisors who tell companies how to adopt AI. If they change their message, entire industries shift.",
      type: "strategy",
      status: "neglected",
      parentId: "economic",
      researchQuestions: [
        { id: "aaq1", text: "Who are the most influential AI adoption consultancies and analysts?" },
      ],
      resources: [],
      people: [],
    },
    {
      id: "safety-subsidies",
      title: "Government subsidies for AI safety research",
      description:
        "Get AI companies subsidised by government for their safety research, making safety work more financially attractive than capabilities work.",
      type: "strategy",
      status: "in-progress",
      parentId: "economic",
      researchQuestions: [
        { id: "ssq1", text: "Which government funding programmes already support AI safety?" },
      ],
      resources: [],
      people: [],
    },

    // ── INTERVENTIONS ──
    {
      id: "rebrand-climate",
      title: "Rebrand pause: more 'climate change', less 'antivax'",
      type: "intervention",
      status: "neglected",
      parentId: "messaging",
      researchQuestions: [],
      resources: [],
      people: [],
    },
    {
      id: "mobilise-job-losses",
      title: "Mobilise communities around expected job losses",
      type: "intervention",
      status: "neglected",
      parentId: "community-organising",
      researchQuestions: [],
      resources: [],
      people: [],
    },
    {
      id: "show-waste",
      title: "Show companies they're wasting money on AI",
      type: "intervention",
      status: "neglected",
      parentId: "burst-bubble",
      researchQuestions: [],
      resources: [],
      people: [],
    },
    {
      id: "prove-slowdown",
      title: "Prove AI capabilities gains can be slowed — proof of concept",
      type: "intervention",
      status: "neglected",
      parentId: "burst-bubble",
      researchQuestions: [],
      resources: [],
      people: [],
    },
    {
      id: "pause-brand",
      title: "Create brand: 'pausing is how the world works'",
      type: "intervention",
      status: "neglected",
      parentId: "rebrand-pause",
      researchQuestions: [],
      resources: [],
      people: [],
    },
    {
      id: "pro-union-piece",
      title: "Write piece making AI lab members think a union is good",
      type: "intervention",
      status: "neglected",
      parentId: "union-organising",
      researchQuestions: [],
      resources: [],
      people: [],
    },
    {
      id: "libertarians",
      title: "Get influential libertarians onboard (Paul Graham et al.)",
      type: "intervention",
      status: "neglected",
      parentId: "union-organising",
      researchQuestions: [],
      resources: [],
      people: [],
    },
    {
      id: "union-strikes",
      title: "Union strikes for a conditional agreement to a pause",
      type: "intervention",
      status: "neglected",
      parentId: "union-organising",
      researchQuestions: [],
      resources: [],
      people: [],
    },
  ],
  edges: [
    // Cascade edges (parent→child)
    { id: "e1", source: "goal", target: "treaty", type: "cascade" },
    { id: "e2", source: "goal", target: "public-buyin", type: "cascade" },
    { id: "e3", source: "goal", target: "economic", type: "cascade" },
    { id: "e4", source: "policy-prospects", target: "treaty", type: "cascade" },
    { id: "e5", source: "public-buyin", target: "messaging", type: "cascade" },
    { id: "e6", source: "public-buyin", target: "community-organising", type: "cascade" },
    { id: "e7", source: "public-buyin", target: "talent-funnel", type: "cascade" },
    { id: "e8", source: "public-buyin", target: "neglected-regions", type: "cascade" },
    { id: "e9", source: "economic", target: "burst-bubble", type: "cascade" },
    { id: "e10", source: "economic", target: "rebrand-pause", type: "cascade" },
    { id: "e11", source: "economic", target: "union-organising", type: "cascade" },
    { id: "e12", source: "economic", target: "adoption-advisors", type: "cascade" },
    { id: "e13", source: "economic", target: "safety-subsidies", type: "cascade" },
    { id: "e14", source: "messaging", target: "rebrand-climate", type: "cascade" },
    { id: "e15", source: "community-organising", target: "mobilise-job-losses", type: "cascade" },
    { id: "e16", source: "burst-bubble", target: "show-waste", type: "cascade" },
    { id: "e17", source: "burst-bubble", target: "prove-slowdown", type: "cascade" },
    { id: "e18", source: "rebrand-pause", target: "pause-brand", type: "cascade" },
    { id: "e19", source: "union-organising", target: "pro-union-piece", type: "cascade" },
    { id: "e20", source: "union-organising", target: "libertarians", type: "cascade" },
    { id: "e21", source: "union-organising", target: "union-strikes", type: "cascade" },

    // Cross-links
    { id: "cx1", source: "messaging", target: "rebrand-pause", type: "cross-link", label: "framing synergy" },
    { id: "cx2", source: "community-organising", target: "union-organising", type: "cross-link", label: "organising skills transfer" },
    { id: "cx3", source: "public-buyin", target: "treaty", type: "cross-link", label: "public pressure enables policy" },
  ],
};
