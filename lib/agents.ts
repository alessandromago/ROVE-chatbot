import type { AgentId } from "@/lib/types";

export const AGENT_META: Record<
  AgentId,
  { label: string; color: string }
> = {
  discovery: {
    label: "ROVE Discovery",
    color: "#6475FA"
  },
  sales: {
    label: "ROVE Sales",
    color: "#E8650A"
  },
  support: {
    label: "ROVE Support",
    color: "#22C55E"
  }
};

