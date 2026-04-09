import { NextResponse } from "next/server";
import { generateAgentReply, routeConversation, truncateHistory } from "@/lib/chat";
import { requireOpenAiKey } from "@/lib/openai";
import type { ChatRequestBody } from "@/lib/types";

export async function POST(request: Request) {
  try {
    requireOpenAiKey();

    const body = (await request.json()) as ChatRequestBody;

    if (!body.message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const history = truncateHistory(body.history || []);

    const decision = await routeConversation({
      message: body.message,
      currentAgent: body.currentAgent,
      history
    });

    const reply = await generateAgentReply({
      agent: decision.agent,
      message: body.message,
      history
    });

    const encoder = new TextEncoder();
    const metadataLine = `${JSON.stringify({
      agent: decision.agent,
      color: reply.color
    })}\n`;

    const combinedStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = reply.stream.getReader();

        try {
          controller.enqueue(encoder.encode(metadataLine));

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            if (value) {
              controller.enqueue(value);
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      }
    });

    return new Response(combinedStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
