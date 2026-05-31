import { UserProfile, Message, AIModelType, KnowledgeTree } from "../types";
import { db } from "../lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

/**
 * GENIUS ENGINE v5.0 (Secure Proxy Layer with Quota Limits)
 * NO DIRECT API CALLS. ALL DATA PROXIED VIA SERVER.
 */

const LOCAL_BURN_KEY = 'tf_device_burn_tokens';

function getLocalDeviceTokens(): number {
  try {
    return parseInt(localStorage.getItem(LOCAL_BURN_KEY) || '0', 10);
  } catch (e) {
    return 0;
  }
}

function incrementLocalDeviceTokens(amount: number) {
  try {
    const current = getLocalDeviceTokens();
    localStorage.setItem(LOCAL_BURN_KEY, (current + amount).toString());
  } catch (e) {
    // silently catch in iframe sandbox
  }
}

async function burnTokens(uid: string, amount: number) {
  incrementLocalDeviceTokens(amount);
  if (!uid || uid === 'demo-uid-123') return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      aiTokensUsed: increment(amount)
    });
  } catch (err) {
    console.warn("Could not increment token quota usage in Firestore:", err);
  }
}

async function callServerAI(endpoint: string, payload: any, profile?: UserProfile): Promise<any> {
  // Check limit beforehand
  if (profile) {
    const isPremium = profile.isPremium === true;
    
    if (!isPremium) {
      const dbUsed = profile.aiTokensUsed ?? 0;
      const localUsed = getLocalDeviceTokens();
      const realTokensUsed = Math.max(dbUsed, localUsed);
      const limit = profile.aiTokenLimit ?? 15000;
      
      if (realTokensUsed >= limit) {
        throw new Error("PRO_LIMIT_REACHED");
      }
    }
  }

  try {
    const response = await fetch(`/api/ai/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server Error (${response.status})`);
    }

    return await response.json();
  } catch (error: any) {
    if (error.message === "PRO_LIMIT_REACHED") throw error;
    if (error.message.includes('Key')) throw new Error("ИИ временно недоступен (ошибка ключа на сервере).");
    if (error.message.includes('429')) throw new Error("Слишком много запросов. Подождите 1 минуту.");
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
  const result = await callServerAI('chat', { type, prompt, profile, history, attachment }, profile);
  const textResult = result.text || "AI failed to generate a response.";
  
  // Calculate tokens burned
  const promptTokens = Math.max(120, Math.ceil((prompt || "").length * 1.3));
  const responseTokens = Math.max(180, Math.ceil(textResult.length * 1.6));
  const totalBurn = promptTokens + responseTokens;
  
  await burnTokens(profile.uid, totalBurn);
  
  return textResult;
}

export async function generateKnowledgeTree(topic: string, profile: UserProfile): Promise<KnowledgeTree> {
  const result = await callServerAI('tree', { topic, profile }, profile);
  // Trees take a lot of AI computing power to output structured schemas (approx 4500 tokens)
  await burnTokens(profile.uid, 4500);
  return result;
}

export async function verifyTask(task: any, answer: string, profile: UserProfile) {
  const result = await callServerAI('verify', { task, answer, profile }, profile);
  // Task verification parses context and returns schemas (approx 1200 tokens)
  await burnTokens(profile.uid, 1200);
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
