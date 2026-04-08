import { generateObject, generateText } from "ai";
import { z } from "zod";
import { AGENT_META } from "@/lib/agents";
import { agentModel, managerModel } from "@/lib/openai";
import {
  readManagerPrompt,
  readPrompt,
  readSharedKnowledgeBase,
  readVerticalKnowledgeBase
} from "@/lib/knowledge-base";
import type { AgentId, ChatMessage, RoutingDecision } from "@/lib/types";

const routingSchema = z.object({
  agent: z.enum(["discovery", "sales", "support"]),
  reason: z.string()
});

function trimHistory(history: ChatMessage[]) {
  return history.slice(-20).map((message) => ({
    role: message.role,
    content: message.content
  }));
}

export async function routeConversation(input: {
  message: string;
  currentAgent: AgentId | null;
  history: ChatMessage[];
}): Promise<RoutingDecision> {
  const managerPrompt = await readManagerPrompt();

  const result = await generateObject({
    model: managerModel,
    schema: routingSchema,
    system: managerPrompt,
    prompt: JSON.stringify({
      message: input.message,
      current_agent: input.currentAgent,
      history: trimHistory(input.history)
    })
  });

  return result.object;
}

export async function generateAgentReply(input: {
  agent: AgentId;
  message: string;
  history: ChatMessage[];
}) {
  const [prompt, sharedKb, verticalKb] = await Promise.all([
    readPrompt(input.agent),
    readSharedKnowledgeBase(),
    readVerticalKnowledgeBase(input.agent)
  ]);

  const history = trimHistory(input.history)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");

  const response = await generateText({
    model: agentModel,
    system: `${prompt}\n\n## SHARED KNOWLEDGE BASE\n${sharedKb}\n\n## VERTICAL KNOWLEDGE BASE\n${verticalKb}`,
    prompt: `Conversation history:\n${history}\n\nLatest user message:\n${input.message}`
  });

  return {
    agent: input.agent,
    agentLabel: AGENT_META[input.agent].label,
    color: AGENT_META[input.agent].color,
    message: response.text
  };
}

