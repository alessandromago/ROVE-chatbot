import { NextResponse } from "next/server";
import { routeConversation } from "@/lib/chat";
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

    return NextResponse.json(decision);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
