# Crawler Intake V2

A mobile-first, unofficial fan-made LitRPG crawler personality generator.

## What changed in V2

- Red, black, cream, and warning-yellow visual system
- Condensed, industrial display typography
- Distressed dossier and hazard-sign styling
- Missing Netlify number-allocation function added
- Numbers are no longer generated locally
- Failed database connections now display a clear retry message
- Permanent crawler numbers are reserved from 1 through 13,000,000

## Replace the files in GitHub

Upload everything in this folder to the root of the existing repository.

The function must appear at:

`netlify/functions/allocate-crawler-number.mjs`

GitHub should show a `netlify` folder. Open it and confirm it contains a
`functions` folder, which contains the `.mjs` file.

## Supabase

Run `supabase/schema.sql` in the Supabase SQL Editor. If you already created
the `crawler_numbers` table, running it again is safe.

## Netlify environment variables

Add:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Use the same value for all deploy contexts when available. If Netlify requires
separate values, placing them in Production is enough for the live site.

After adding or changing environment variables, trigger a fresh production
deployment.

## Security

Never place the service-role key in `app.js`, GitHub, screenshots, or chat.
It belongs only in Netlify's private environment variables.

## Fan-project notice

The interface is an original fan-made design inspired by broad LitRPG,
dungeon-crawl, industrial warning-sign, and distressed paperback aesthetics.
It does not contain official logos or proprietary artwork.
