import { z } from "zod";
import { AGENT_META } from "@/lib/agents";
import { getAgentModel, getManagerModel, requireOpenAiKey } from "@/lib/openai";
import {
  readManagerPrompt,
  readPrompt,
  readSharedKnowledgeBase,
  readVerticalKnowledgeBase
} from "@/lib/knowledge-base";
import type {
  AgentId,
  ChatHistoryEntry,
  ChatMessage,
  RoutingDecision
} from "@/lib/types";

const routingSchema = z.object({
  agent: z.enum(["discovery", "sales", "support"]),
  reason: z.string()
});

const encoder = new TextEncoder();

export function truncateHistory(history: ChatMessage[]): ChatHistoryEntry[] {
  return history.slice(-20).map((message) => ({
    role: message.role,
    content: message.content
  }));
}

export async function routeConversation(input: {
  message: string;
  currentAgent: AgentId | null;
  history: ChatHistoryEntry[];
}): Promise<RoutingDecision> {
  const managerPrompt = await readManagerPrompt();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${requireOpenAiKey()}`
    },
    body: JSON.stringify({
      model: getManagerModel(),
      response_format: {
        type: "json_object"
      },
      messages: [
        {
          role: "system",
          content: managerPrompt
        },
        {
          role: "user",
          content: JSON.stringify({
            message: input.message,
            current_agent: input.currentAgent,
            history: input.history
          })
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Manager call failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Manager returned an empty response");
  }

  const parsed = routingSchema.parse(JSON.parse(content));

  return parsed;
}

export async function generateAgentReply(input: {
  agent: AgentId;
  message: string;
  history: ChatHistoryEntry[];
}) {
  const [prompt, sharedKb, verticalKb] = await Promise.all([
    readPrompt(input.agent),
    readSharedKnowledgeBase(),
    readVerticalKnowledgeBase(input.agent)
  ]);

  const history = input.history
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${requireOpenAiKey()}`
    },
    body: JSON.stringify({
      model: getAgentModel(),
      stream: true,
      messages: [
        {
          role: "system",
          content: `${prompt}\n\n---\n\n${sharedKb}\n\n---\n\n${verticalKb}`
        },
        {
          role: "user",
          content: `Conversation history:\n${history}\n\nLatest user message:\n${input.message}`
        }
      ]
    })
  });

  if (!response.ok || !response.body) {
    throw new Error(`Agent call failed with status ${response.status}`);
  }

  const decoder = new TextDecoder();

  const textStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const reader = response.body!.getReader();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed.startsWith("data:")) {
              continue;
            }

            const payload = trimmed.replace(/^data:\s*/, "");

            if (payload === "[DONE]") {
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(payload) as {
                choices?: Array<{
                  delta?: {
                    content?: string;
                  };
                }>;
              };

              const delta = parsed.choices?.[0]?.delta?.content;

              if (delta) {
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // Ignore malformed SSE chunks and continue reading.
            }
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return {
    agent: input.agent,
    color: AGENT_META[input.agent].color,
    stream: textStream
  };
}
