# ROVE Chatbot

Progetto Next.js per la lezione 3 del corso.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- OpenAI API via server-side route
- KB statiche da file

## Setup

1. Installa Node.js 20+
2. Installa dipendenze con `npm install`
3. Crea `.env.local` partendo da `.env.example`
4. Avvia con `npm run dev`
5. Valida i casi in `../Validation/PROMPT_VALIDATION_SCENARIOS.md`

## Variabili ambiente

- `OPENAI_API_KEY`
- `OPENAI_MANAGER_MODEL`
- `OPENAI_AGENT_MODEL`

## Flow

1. Il frontend manda `message`, `history`, `currentAgent` a `/api/chat`
2. Il server chiama il Manager
3. Il Manager decide l'agente
4. Il server carica prompt + KB condivisa + KB verticale
5. Il server genera la risposta dell'agente
6. Il frontend aggiorna badge agente e messaggio

## Stato attuale

Lo scaffold e pronto, ma in questo ambiente non e stato possibile eseguire:

- `npm install`
- `npm run dev`
- build
- deploy

perche `node`, `npm` e gli strumenti git di sistema non sono installati.

## Percorso file utili

- Prompt finali: `../Final_Prompts/`
- Scenari di validazione: `../Validation/PROMPT_VALIDATION_SCENARIOS.md`
- Checklist deploy: `./DEPLOY_CHECKLIST.md`
