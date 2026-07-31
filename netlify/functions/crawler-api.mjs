const MAX = 13_000_000;
const ATTEMPTS = 40;

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  },
  body: JSON.stringify(body)
});

export async function handler(event) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return json(500, { error: "Crawler registry is not configured." });
  }

  const base = url.replace(/\/$/, "");
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "GET") {
    const number = Number(event.queryStringParameters?.crawler);

    if (!Number.isInteger(number)) {
      return json(400, { error: "Invalid crawler number." });
    }

    const response = await fetch(
      `${base}/rest/v1/crawler_profiles?crawler_number=eq.${number}&select=profile&limit=1`,
      { headers }
    );

    if (!response.ok) {
      return json(502, { error: "Registry lookup failed." });
    }

    const rows = await response.json();

    if (!rows.length) {
      return json(404, { error: "No crawler exists with that number." });
    }

    return json(200, { profile: rows[0].profile });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  let body;

  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid request body." });
  }

  if (!body.profile || typeof body.profile.name !== "string") {
    return json(400, { error: "Crawler profile is missing." });
  }

  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    const crawlerNumber = Math.floor(Math.random() * MAX) + 1;
    const profile = {
      ...body.profile,
      crawlerNumber
    };

    const response = await fetch(`${base}/rest/v1/crawler_profiles`, {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        crawler_number: crawlerNumber,
        crawler_name: profile.name.slice(0, 80),
        profile
      })
    });

    if (response.ok) {
      return json(200, { crawlerNumber });
    }

    const errorText = await response.text();

    if (response.status === 409 || errorText.includes("23505")) {
      continue;
    }

    console.error("Supabase profile insert failed:", response.status, errorText);
    return json(502, { error: "The Dungeon rejected this crawler profile." });
  }

  return json(503, { error: "No unused crawler number could be assigned." });
}
