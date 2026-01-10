import { createClient } from "@supabase/supabase-js";

async function fetchWithTimeoutAndRetry(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const timeoutMs = 12000;
  const maxAttempts = 2;

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const signal = init?.signal;
    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    try {
      const res = await fetch(input, { ...(init ?? {}), signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (err) {
      clearTimeout(timeout);
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 250));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError;
}

export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: fetchWithTimeoutAndRetry as any,
    },
  });
}
