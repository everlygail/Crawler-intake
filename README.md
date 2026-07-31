# Crawler Intake — Complete V1

This is the complete first public version.

## Included

- 39-question bank
- Nine-question interviews
- Randomized opening questions
- Adaptive later questions based on the crawler's strongest traits
- Memory callbacks to previous answers
- Customized Dungeon AI commentary
- Achievement unlocks
- Audience-interest tracking
- Permanent random crawler numbers from 1–13,000,000
- Saved crawler profiles in Supabase
- Public dossier links at `/crawler/NUMBER`
- Search by crawler number
- Shareable dossier links
- Downloadable crawler cards
- Sound, haptics, interruptions, broadcast effects, and animated reveal

## GitHub changes

Replace these root files:

- `index.html`
- `app.js`
- `styles.css`
- `netlify.toml`
- `schema.sql`

Create this function file:

`netlify/functions/crawler-api.mjs`

The old `allocate-crawler-number.mjs` function may stay. The new app does not use it.

## Supabase

Run the complete contents of `schema.sql` in Supabase SQL Editor.

This creates `crawler_profiles`, which stores each public dossier.

## Netlify

Your existing environment variables remain the same:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

After committing all files and running the SQL, trigger a new Netlify deployment.
