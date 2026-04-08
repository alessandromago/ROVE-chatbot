import { NextResponse } from "next/server";
import { generateAgentReply, routeConversation } from "@/lib/chat";
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

    const decision = await routeConversation({
      message: body.message,
      currentAgent: body.currentAgent,
      history: body.history || []
    });

    const reply = await generateAgentReply({
      agent: decision.agent,
      message: body.message,
      history: body.history || []
    });

    return NextResponse.json({
      ...reply,
      reason: decision.reason
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
