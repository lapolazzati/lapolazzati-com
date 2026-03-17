/**
 * Pitchdeck Gate Worker
 *
 * Token-gated access to pitch decks with per-visitor tracking.
 *
 * KV layout:
 *   TOKENS namespace:
 *     key: "tax-dd:{token}"  →  value: JSON { name, email, company?, created }
 *
 *   VIEWS namespace:
 *     key: "tax-dd:{token}:{timestamp}"  →  value: JSON { name, email, ua, ip, ts }
 *     key: "tax-dd:_log:{timestamp}"     →  value: JSON (same, for chronological listing)
 *
 * Routes:
 *   GET /deck/tax-dd?t={token}     → serve the pitch deck
 *   GET /deck/tax-dd/views?key={}  → admin: list all views (protected by secret)
 *   GET /deck/tax-dd/tokens?key={} → admin: list all tokens
 *   POST /deck/tax-dd/token?key={} → admin: create a new token
 */

interface Env {
  TOKENS: KVNamespace;
  VIEWS: KVNamespace;
  ADMIN_KEY: string; // wrangler secret
}

interface TokenData {
  name: string;
  email: string;
  company?: string;
  created: string;
}

interface ViewEntry {
  name: string;
  email: string;
  token: string;
  ua: string;
  ip: string;
  ts: string;
  deck: string;
}

// The pitch deck HTML is served from the Pages site origin
const ORIGIN = "https://lapolazzati.com";
const DECK_PATH = "/pitchdeck-tax-dd-ai.html";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Admin endpoints
    if (path === "/deck/tax-dd/views") return handleListViews(url, env);
    if (path === "/deck/tax-dd/tokens") return handleListTokens(url, env);
    if (path === "/deck/tax-dd/token" && request.method === "POST") return handleCreateToken(request, url, env);

    // Main deck route
    if (path === "/deck/tax-dd") return handleDeckRequest(request, url, env, ctx);

    return new Response("Not found", { status: 404 });
  },
};

// --- Deck access ---

async function handleDeckRequest(
  request: Request,
  url: URL,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const token = url.searchParams.get("t");
  if (!token) return errorPage("Link non valido", "Questo link richiede un token di accesso. Controlla il link che hai ricevuto.");

  const kvKey = `tax-dd:${token}`;
  const data = await env.TOKENS.get<TokenData>(kvKey, "json");
  if (!data) return errorPage("Accesso negato", "Questo token non è valido o è scaduto.");

  // Log the view (fire and forget)
  const now = new Date().toISOString();
  const view: ViewEntry = {
    name: data.name,
    email: data.email,
    token,
    ua: request.headers.get("user-agent") || "unknown",
    ip: request.headers.get("cf-connecting-ip") || "unknown",
    ts: now,
    deck: "tax-dd",
  };

  ctx.waitUntil(
    Promise.all([
      env.VIEWS.put(`tax-dd:${token}:${now}`, JSON.stringify(view)),
      env.VIEWS.put(`tax-dd:_log:${now}`, JSON.stringify(view)),
    ])
  );

  // Fetch the actual deck from the Pages site
  const deckResponse = await fetch(ORIGIN + DECK_PATH);
  if (!deckResponse.ok) return new Response("Deck not found", { status: 502 });

  // Return with appropriate headers
  return new Response(deckResponse.body, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

// --- Admin: list views ---

async function handleListViews(url: URL, env: Env): Promise<Response> {
  if (!checkAdmin(url, env)) return json({ error: "unauthorized" }, 401);

  const token = url.searchParams.get("token");
  const prefix = token ? `tax-dd:${token}:` : "tax-dd:_log:";

  const keys = await env.VIEWS.list({ prefix, limit: 200 });
  const views: ViewEntry[] = [];

  for (const key of keys.keys) {
    const v = await env.VIEWS.get<ViewEntry>(key.name, "json");
    if (v) views.push(v);
  }

  return json({ count: views.length, views });
}

// --- Admin: list tokens ---

async function handleListTokens(url: URL, env: Env): Promise<Response> {
  if (!checkAdmin(url, env)) return json({ error: "unauthorized" }, 401);

  const keys = await env.TOKENS.list({ prefix: "tax-dd:", limit: 200 });
  const tokens: (TokenData & { token: string })[] = [];

  for (const key of keys.keys) {
    const data = await env.TOKENS.get<TokenData>(key.name, "json");
    if (data) tokens.push({ ...data, token: key.name.replace("tax-dd:", "") });
  }

  return json({ count: tokens.length, tokens });
}

// --- Admin: create token ---

async function handleCreateToken(request: Request, url: URL, env: Env): Promise<Response> {
  if (!checkAdmin(url, env)) return json({ error: "unauthorized" }, 401);

  let body: { name: string; email: string; company?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  if (!body.name || !body.email) return json({ error: "name and email required" }, 400);

  // Generate a short, readable token: name-slug + 6 random chars
  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);
  const rand = crypto.getRandomValues(new Uint8Array(4));
  const hex = Array.from(rand)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const token = `${slug}-${hex}`;

  const data: TokenData = {
    name: body.name,
    email: body.email,
    company: body.company,
    created: new Date().toISOString(),
  };

  await env.TOKENS.put(`tax-dd:${token}`, JSON.stringify(data));

  const link = `https://lapolazzati.com/deck/tax-dd?t=${token}`;
  return json({ token, link, ...data }, 201);
}

// --- Helpers ---

function checkAdmin(url: URL, env: Env): boolean {
  return url.searchParams.get("key") === env.ADMIN_KEY;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function errorPage(title: string, message: string): Response {
  return new Response(
    `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #1c1917; color: #faf8f4; }
    .box { text-align: center; max-width: 400px; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #a8a29e; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="box">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`,
    {
      status: 403,
      headers: { "content-type": "text/html; charset=utf-8" },
    }
  );
}
