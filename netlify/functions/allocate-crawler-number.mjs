const MAX_CRAWLER_NUMBER = 13_000_000;
const MAX_ATTEMPTS = 30;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  };
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase environment variables.");
    return json(500, {
      error: "Crawler number service is not configured."
    });
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/crawler_numbers`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const crawlerNumber = Math.floor(Math.random() * MAX_CRAWLER_NUMBER) + 1;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          crawler_number: crawlerNumber
        })
      });

      if (response.ok) {
        const records = await response.json();
        return json(200, {
          crawlerNumber: records[0]?.crawler_number ?? crawlerNumber
        });
      }

      const errorText = await response.text();

      // PostgreSQL unique_violation. Another crawler already owns this number.
      if (response.status === 409 || errorText.includes("23505")) {
        continue;
      }

      console.error("Supabase allocation error:", response.status, errorText);
      return json(502, {
        error: "The Dungeon registry rejected the request."
      });
    } catch (error) {
      console.error("Number allocation failure:", error);
      return json(502, {
        error: "The Dungeon registry could not be reached."
      });
    }
  }

  return json(503, {
    error: "The Dungeon failed to locate an unused number. Try again."
  });
}

