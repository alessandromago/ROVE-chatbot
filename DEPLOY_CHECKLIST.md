# Deploy Checklist

## 1. Ambiente locale

- Installa Node.js 20 o superiore
- Apri la cartella [rove-chatbot](/Users/alessandro/Desktop/Technologies%20for%20entrepreneurs/04_Lesson_3_AI_Agents_and_Automation/rove-chatbot)
- Esegui `npm install`
- Crea `.env.local` partendo da `.env.example`

## 2. Variabili ambiente

Nel file `.env.local` imposta:

- `OPENAI_API_KEY`
- `OPENAI_MANAGER_MODEL=gpt-4o-mini`
- `OPENAI_AGENT_MODEL=gpt-4.1-mini`

## 3. Validazione locale

Esegui:

- `npm run dev`
- apri il chatbot
- valida i casi in [PROMPT_VALIDATION_SCENARIOS.md](/Users/alessandro/Desktop/Technologies%20for%20entrepreneurs/04_Lesson_3_AI_Agents_and_Automation/Validation/PROMPT_VALIDATION_SCENARIOS.md)

Controlla in particolare:

- Discovery non vende troppo presto
- Sales entra solo dopo qualificazione
- Support si attiva su prenotazioni esistenti
- nome e colore agente cambiano correttamente

## 4. GitHub

Quando il progetto gira in locale:

- inizializza git nella cartella del progetto
- crea il repository su GitHub
- fai il primo commit
- pusha il branch principale

## 5. Vercel

- importa il repository GitHub in Vercel
- imposta le stesse variabili ambiente usate in `.env.local`
- avvia il deploy

## 6. Validazione post-deploy

Testa almeno questi scenari sul link pubblico:

1. Lead nuovo -> Discovery -> Sales
2. Richiesta di prezzo dopo qualificazione -> Sales
3. Problema su viaggio gia acquistato -> Support

## 7. Definition of Done

Il prodotto e allineato alle lezioni quando:

- esiste una chat pubblica funzionante
- il routing manager e stabile
- l'utente percepisce una chat unica
- il deploy Vercel e raggiungibile via URL pubblico

