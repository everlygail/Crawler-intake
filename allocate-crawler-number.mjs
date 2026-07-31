const MIN = 1;
const MAX = 13_000_000;
const ATTEMPTS = 20;

export default async () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return response(500, { error: 'Supabase environment variables are missing.' });

  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    const crawlerNumber = Math.floor(Math.random() * MAX) + MIN;
    const result = await fetch(`${url}/rest/v1/crawler_numbers`, {
      method: 'POST',
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
        prefer: 'return=minimal'
      },
      body: JSON.stringify({ crawler_number: crawlerNumber })
    });

    if (result.ok) return response(200, { crawlerNumber });
    const error = await result.text();
    if (result.status !== 409 && !error.includes('23505')) return response(500, { error });
  }
  return response(503, { error: 'Could not allocate a unique number. Try again.' });
};

function response(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });
}
