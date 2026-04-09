# ROVE Chatbot — IDE Rules (Plan and Solve)

> These rules configure the AI-assisted IDE for this project. Every code generation action must comply with these constraints.

## 1. Project Identity
ROVE multi-agent chatbot for L'Astrolabio — Lesson 3 MVP.

## 2. Tech Stack
- Next.js 14.2.x with App Router
- React 18.3.x
- Tailwind CSS 3.4.x
- TypeScript strict
- Vercel AI SDK (`ai` 3.x)
- OpenAI as the LLM provider

## 3. Architecture
Target architecture:
Every user message will eventually trigger two server-side LLM calls:
1. **Manager** — called in structured object mode (fast model: `gpt-4o-mini`). Returns `{ agent, reason }`. The Manager NEVER generates user-facing text.
2. **Specialist Agent** — called with streaming (full model: `gpt-4.1-mini`). Returns the user-facing reply.

Current implementation checkpoint:
- Up to Sprint 2, only Manager routing is active
- The Manager only routes
- Specialist agent generation is reserved for Sprint 3+

## 4. API Contract
Single API route: `POST /api/chat`.
Accepts: `{ message, currentAgent, history }`.
Sprint 2 response: JSON only, `{ "agent": "...", "reason": "..." }`.
Sprint 3+ response: streaming response where the first line is JSON metadata `{"agent":"...","color":"..."}` and the remaining stream is the LLM text.

## 5. File Structure
```
/knowledge-base/shared.md       — shared KB for all agents
/knowledge-base/discovery.md    — Discovery vertical KB
/knowledge-base/sales.md        — Sales vertical KB
/knowledge-base/support.md      — Support vertical KB
/prompts/manager.md             — Manager system prompt
/prompts/discovery.md           — Discovery system prompt
/prompts/sales.md               — Sales system prompt
/prompts/support.md             — Support system prompt
/lib/openai.ts                  — OpenAI client initialization
/lib/knowledge-base.ts          — KB and prompt loading utilities
/lib/agents.ts                  — Agent metadata (names, colors)
/lib/types.ts                   — Shared TypeScript types
/lib/chat.ts                    — Routing and agent call logic
/app/api/chat/route.ts          — API route handler
/app/page.tsx                   — Single chat page
```

## 6. Language Rule
All user-facing agent output must be in Italian. KB files remain in English. Never mix languages in one message.

## 7. Valid Agents
Only three agent names exist: `discovery`, `sales`, `support`.
Colors: discovery = `#6475FA`, sales = `#E8650A`, support = `#22C55E`.

## 8. FORBIDDEN — Do Not Add
- Database (no Prisma, no Drizzle, no Supabase, no Redis, no SQLite)
- ORM of any kind
- RAG, embeddings, or vector store
- Authentication or login
- Admin dashboard or config UI
- Payment processing
- Analytics or tracking
- Automated tests (validation is manual)
- SEO optimization
- Multi-language support (Italian only for user-facing)
- Server-side session persistence

## 9. Coding Style
- TypeScript with strict mode
- Minimal abstraction — no unnecessary wrappers
- Comments in English
- One component per file
- No barrel exports (no `index.ts` re-exports)

## 10. State Management
Conversation history lives in React state only. Page refresh = conversation reset. No persistence across sessions.
