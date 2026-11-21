import { auth } from "../lib/firebase";

/** POST JSON to our API with the signed-in user's Firebase ID token. Throws Error(code) on failure. */
export async function authedPost<T = any>(path: string, body: unknown): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new Error("AUTH_REQUIRED");

  const token = await user.getIdToken();
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Server Error (${response.status})`);
  }
  return response.json();
}
