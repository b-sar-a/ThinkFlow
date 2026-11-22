import { authedPost } from "../services/http";

const KEY = "tf_ref";
const CODE = /^[A-Za-z0-9]{6,12}$/;

/** Remember ?ref=CODE from the landing URL until the visitor has an account. */
export function captureReferral() {
  try {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("ref");
    if (code && CODE.test(code)) localStorage.setItem(KEY, code);
    if (url.searchParams.has("ref")) {
      url.searchParams.delete("ref");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }
  } catch {
    // storage can be blocked (private mode); the referral is simply skipped
  }
}

/**
 * Ask the server to credit the invite once. A definite answer (credited, already used,
 * invalid, too late) clears the stored code; a temporary failure keeps it for next time.
 */
export async function claimPendingReferral(ownUid: string): Promise<void> {
  let code: string | null = null;
  try {
    code = localStorage.getItem(KEY);
  } catch {
    return;
  }
  if (!code || ownUid.startsWith(code)) {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    return;
  }
  try {
    await authedPost("/api/referral/claim", { ref: code });
  } catch (err: any) {
    const reason = String(err?.message || "");
    if (reason === "REFERRAL_UNAVAILABLE" || /Server Error|Failed to fetch|AUTH_/.test(reason)) return;
  }
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
