// MVP usage gate. Tracks free generations per browser via localStorage.
// This is NOT a real paywall — a user can clear storage and reset it.
// Once you add auth (e.g. NextAuth) + Stripe, replace this with a
// server-side check against the user's subscription status and a
// generations counter in your database.

const KEY = "threadline_usage_v1";
export const FREE_LIMIT = 2;

export function getUsage() {
  if (typeof window === "undefined") return { count: 0 };
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { count: 0 };
  } catch {
    return { count: 0 };
  }
}

export function recordGeneration() {
  if (typeof window === "undefined") return;
  const usage = getUsage();
  const next = { count: usage.count + 1 };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function hasFreeGenerationsLeft() {
  return getUsage().count < FREE_LIMIT;
}

export function remainingFree() {
  return Math.max(0, FREE_LIMIT - getUsage().count);
}
