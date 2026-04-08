export type AgentId = "discovery" | "sales" | "support";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  agent?: AgentId;
};

export type ChatRequestBody = {
  message: string;
  history: ChatMessage[];
  currentAgent: AgentId | null;
};

export type RoutingDecision = {
  agent: AgentId;
  reason: string;
};

