export function requireOpenAiKey() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "your_openai_api_key_here") {
    throw new Error(
      "OPENAI_API_KEY mancante o non valida in .env.local. Inserisci la tua key reale e riavvia il server."
    );
  }

  return apiKey;
}

export function getManagerModel() {
  return process.env.OPENAI_MANAGER_MODEL || "gpt-4o-mini";
}

export function getAgentModel() {
  return process.env.OPENAI_AGENT_MODEL || "gpt-4.1-mini";
}
