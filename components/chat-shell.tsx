"use client";

import { FormEvent, useState } from "react";
import { AGENT_META } from "@/lib/agents";
import type { AgentId, ChatMessage } from "@/lib/types";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  agent: "discovery",
  content:
    "Ciao, sono qui per aiutarti a trovare il viaggio giusto. Per iniziare, qual e il budget indicativo per persona?"
};

export function ChatShell() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [currentAgent, setCurrentAgent] = useState<AgentId>("discovery");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agentMeta = AGENT_META[currentAgent];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = input.trim();
    if (!value || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: value
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: value,
          history: messages,
          currentAgent
        })
      });

      if (!response.ok) {
        throw new Error("La risposta del server non e valida.");
      }

      const data = (await response.json()) as {
        agent: AgentId;
        message: string;
      };

      const assistantMessage: ChatMessage = {
        id: makeId(),
        role: "assistant",
        agent: data.agent,
        content: data.message
      };

      setCurrentAgent(data.agent);
      setMessages([...nextHistory, assistantMessage]);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Errore imprevisto.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <section className="rounded-[32px] border border-black/10 bg-white/75 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-black/45">
                Technology for Entrepreneurs
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-ink md:text-5xl">
                ROVE Multi-Agent Chatbot
              </h1>
            </div>
            <div
              className="inline-flex w-fit items-center gap-3 rounded-full px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: agentMeta.color }}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
              {agentMeta.label}
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-black/65 md:text-base">
            Una sola chat, tre agenti specialisti e un manager invisibile che
            instrada la conversazione in base al contesto.
          </p>
        </section>

        <section className="rounded-[32px] border border-black/10 bg-[#fffdf8] p-4 shadow-[0_12px_50px_rgba(0,0,0,0.06)] md:p-6">
          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
            {messages.map((message) => {
              const isAssistant = message.role === "assistant";
              const bubbleColor = isAssistant
                ? message.agent
                  ? AGENT_META[message.agent].color
                  : "#121212"
                : "#121212";

              return (
                <article
                  key={message.id}
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[24px] px-4 py-3 text-sm leading-6 md:text-base ${
                      isAssistant ? "text-black" : "text-white"
                    }`}
                    style={{
                      backgroundColor: isAssistant
                        ? `${bubbleColor}18`
                        : bubbleColor,
                      border: isAssistant ? `1px solid ${bubbleColor}40` : "none"
                    }}
                  >
                    {isAssistant && message.agent ? (
                      <p
                        className="mb-2 text-xs font-semibold uppercase tracking-[0.2em]"
                        style={{ color: bubbleColor }}
                      >
                        {AGENT_META[message.agent].label}
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <form className="mt-6 flex flex-col gap-3" onSubmit={onSubmit}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Scrivi qui il messaggio del viaggiatore..."
              className="min-h-28 rounded-[24px] border border-black/10 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-black/30"
            />
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-black/55">
                {loading
                  ? "L'agente sta preparando la risposta..."
                  : "Nessun database. KB statiche e routing via manager."}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Invio..." : "Invia"}
              </button>
            </div>
          </form>

          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        </section>
      </div>
    </main>
  );
}

