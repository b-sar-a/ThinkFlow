import { UserProfile, Message, AIModelType, KnowledgeTree } from "../types";
import { authedPost } from "./http";

/**
 * GENIUS ENGINE v6.0 (authenticated proxy)
 * No API keys in the browser. Every call goes to our server with the user's Firebase
 * ID token; the server enforces the token quota and writes aiTokensUsed to Firestore.
 */

const ERRORS: Record<string, string> = {
  AUTH_REQUIRED: "Войдите в аккаунт, чтобы пользоваться ИИ.",
  AUTH_INVALID: "Сессия истекла. Войдите заново.",
  RATE_LIMITED: "Слишком много запросов. Подождите минуту.",
  AI_BUSY: "ИИ сейчас перегружен. Попробуйте через 10 секунд.",
  AI_BUSY_TODAY: "На сегодня запросы к ИИ закончились. Попробуйте завтра.",
};

async function callServerAI(endpoint: string, payload: any): Promise<any> {
  try {
    return await authedPost(`/api/ai/${endpoint}`, payload);
  } catch (error: any) {
    const message = String(error?.message || "");
    if (message === "PRO_LIMIT_REACHED") throw error;
    if (ERRORS[message]) throw new Error(ERRORS[message]);
    throw error;
  }
}

export async function askThinkFlowAI(
  type: AIModelType,
  prompt: string,
  profile: UserProfile,
  history: Message[] = [],
  attachment?: any
) {
  const result = await callServerAI('chat', { type, prompt, profile, history, attachment });
  return result.text || "AI failed to generate a response.";
}

export async function generateKnowledgeTree(topic: string, profile: UserProfile): Promise<KnowledgeTree> {
  const result = await callServerAI('tree', { topic, profile });
  return result;
}

export async function verifyTask(task: any, answer: string, profile: UserProfile) {
  const result = await callServerAI('verify', { task, answer, profile });
  return result;
}

export async function getPersonalizedExplanation(topic: string, interests: string[]) {
  // General helper fallback
  const result = await callServerAI('chat', {
    type: 'coach',
    prompt: `Explain "${topic}" using metaphors from: ${interests.join(', ')}.`,
    profile: { language: 'ru', interests },
    history: []
  });
  return result.text;
}

export function isLocalMode() {
  return false; 
}
