# Crawler Intake MVP

A mobile-first, unofficial fan-made crawler personality generator requiring no framework or build command.

## Included
- Name onboarding
- Five free-text Dungeon AI assessment questions
- Immediate sarcastic reactions and detected traits
- Deterministic crawler analysis
- Stats, traits, race affinity, class candidate, alignment, weakness, and threat level
- Permanent crawler number from 1 to 13,000,000
- Downloadable PNG crawler dossier
- Netlify + Supabase global uniqueness

## Test locally
Open `index.html`, or run any simple static server.

Without Netlify Functions, the app uses a local random-number fallback. Global uniqueness is active after deployment and Supabase setup.

## Supabase setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL Editor.
3. In Netlify, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy this folder or connect its GitHub repository.

The database unique constraint guarantees that a claimed number cannot be claimed again. Collisions are rerolled automatically.

## Netlify deployment
There is no build command. Netlify publishes the repository root and automatically deploys `netlify/functions`.

## Current MVP boundary
Answer analysis is deterministic and browser-based. A later phase can route responses through an AI function for deeper personalized reactions while keeping the API key server-side.
