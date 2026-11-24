import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// These two values are public (they ship in the web client config), so defaults are safe.
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0029250191";
const DATABASE_ID =
  process.env.FIRESTORE_DATABASE_ID || "ai-studio-40c22e6e-5fc3-462c-ad48-ab8924415ba7";

function readServiceAccount(): Record<string, unknown> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const text = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(text);
  } catch {
    console.error("[ADMIN] FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON/base64 JSON.");
    return null;
  }
}

const serviceAccount = readServiceAccount();

function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  // verifyIdToken only needs the project id; Firestore needs the service account.
  return initializeApp(
    serviceAccount
      ? { credential: cert(serviceAccount as any), projectId: PROJECT_ID }
      : { projectId: PROJECT_ID }
  );
}

/** True when the server can read/write Firestore (quota + promo codes are enforced). */
export const hasAdminDb = () => serviceAccount !== null;

export function adminDb(): Firestore | null {
  if (!serviceAccount) return null;
  return getFirestore(adminApp(), DATABASE_ID);
}

export async function verifyIdToken(idToken: string) {
  return getAuth(adminApp()).verifyIdToken(idToken);
}

/** When the Firebase Auth account was created (ms since epoch). */
export async function accountCreatedAt(uid: string): Promise<number> {
  const record = await getAuth(adminApp()).getUser(uid);
  return new Date(record.metadata.creationTime).getTime();
}

/** The email of a Firebase Auth account, or null when it has none (anonymous, deleted). */
export async function accountEmail(uid: string): Promise<string | null> {
  try {
    return (await getAuth(adminApp()).getUser(uid)).email ?? null;
  } catch {
    return null;
  }
}

/** Removes the Firebase Auth account. A missing account counts as done, so retries are safe. */
export async function deleteAuthUser(uid: string): Promise<void> {
  try {
    await getAuth(adminApp()).deleteUser(uid);
  } catch (error: any) {
    if (error?.code !== "auth/user-not-found") throw error;
  }
}
