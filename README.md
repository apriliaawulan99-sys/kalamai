# KalamAI — Arabic Speaking Practice

KalamAI is a full-stack MVP for Indonesian-speaking learners practising Modern Standard Arabic (الفصحى). It includes a Next.js application, Supabase authentication/PostgreSQL, server-side OpenAI integration, saved conversation history, structured correction feedback, and deployment instructions for Vercel.

## Implemented

- Responsive landing page and authenticated learner workspace.
- Email/password registration, login, logout, password-reset request, and Supabase auth callback.
- Protected learner routes and an admin-only scenario management route.
- Six internal learning levels, ten seeded scenarios, and starter vocabulary.
- Text AI conversations persisted in Supabase.
- Arabic correction analysis across Nahwu, Shorof, and Balaghah when relevant, validated server-side with Zod before saving.
- Correction history, saved vocabulary, profile preferences, activity counters, and account deletion endpoint.
- RLS policies, role protections, SQL migration, and rate limiting.
- Unit tests for the correction output schema.

## Not implemented yet

Voice recording/transcription, realtime voice, placement assessment, human language-exchange matching/calls, and a full lesson-authoring CMS are later phases. The UI does not pretend these features work. Pronunciation accuracy is not inferred from text. AI feedback is educational assistance and should be reviewed by qualified Arabic instructors before being treated as authoritative.

## Requirements

- Node.js 20.9+ (Node 22 recommended)
- npm
- A Supabase project
- An OpenAI API key for AI conversation and correction

## 1. Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000. The public landing page loads without credentials. Authentication, database-backed pages, and AI features require the configuration below.

## 2. Configure Supabase

1. Create a project at https://supabase.com.
2. Copy the project URL and publishable/anon key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Keep the service-role/secret key server-only. Never name it `NEXT_PUBLIC_*` or commit it.
4. In the Supabase SQL Editor, run `supabase/migrations/001_initial_schema.sql` in full. It creates tables, indexes, RLS policies, six levels, ten scenarios, starter vocabulary, a profile-creation trigger, and a shared rate-limit RPC.
5. In Authentication → URL Configuration, add `http://localhost:3000` to allowed redirect URLs. Add the deployed Vercel URL after deployment.
6. Register an account, then promote that account to admin in SQL Editor (replace the email):

```sql
update public.profiles
set role = 'admin', updated_at = now()
where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
```

Normal users cannot update the `role` column through the app. Do not allow end users to choose their role.

### Email verification

Supabase may require email verification. Configure SMTP and email templates before public launch. For local development, you may disable confirmation in a separate test project if appropriate; do not assume this is safe for production.

## 3. Configure OpenAI

Add a server-side key to `.env.local`:

```env
OPENAI_API_KEY=...
OPENAI_TEXT_MODEL=gpt-4.1-mini
```

`OPENAI_TEXT_MODEL` is configurable. If your account cannot access the default model, set it to a model available to your API project. AI requests run only on the server. Do not use a `NEXT_PUBLIC_` prefix for the key.

## 4. Validate

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Authentication, AI, and RLS integration checks require real credentials and a configured Supabase project. Unit tests do not need secrets. Review actual test output; do not assume deployment has succeeded.

## 5. Push to GitHub

Create an empty GitHub repository, then run in the project directory:

```bash
git init
git add .
git commit -m "Build KalamAI full-stack MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Check `.gitignore` before pushing. Never commit `.env.local`, service-role keys, OpenAI keys, or private learner data.

## 6. Deploy to Vercel

1. Import the GitHub repository in https://vercel.com.
2. Set the variables from `.env.example` in Project Settings → Environment Variables. Add them to Development, Preview, and Production as appropriate.
3. Set the Supabase URL and public key for client auth. Set `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and `OPENAI_TEXT_MODEL` as server-side values.
4. Deploy. Add `https://YOUR_DOMAIN` to Supabase Auth's allowed redirect URLs after Vercel assigns a domain.
5. Push a small change to GitHub to verify automatic redeployment.

Supabase is managed separately from Vercel. Apply future SQL migrations deliberately; Vercel does not run them automatically.

## Environment variables

| Variable | Exposure | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public project URL | Supabase client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public/publishable key | Supabase Auth; RLS is mandatory |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Account deletion and shared rate limit |
| `OPENAI_API_KEY` | Server only | AI conversation and correction |
| `OPENAI_TEXT_MODEL` | Server only | Select text model |
| `RATE_LIMIT_WINDOW_SECONDS` | Server only, optional | Rate-limit window |
| `RATE_LIMIT_MAX_REQUESTS` | Server only, optional | Request cap per user and route |

## Security and privacy notes

- Conversation messages and corrections are tied to the authenticated user and protected with RLS.
- Roles are checked on the server and in database policies. Hidden navigation is not the security boundary.
- Raw audio is not stored because the voice workflow is not implemented.
- Account deletion requires the service-role key and permanently deletes the authenticated Supabase user and cascading records. The UI asks for confirmation.
- Privacy and terms pages are templates, not legal advice or a claim of compliance. Review them under applicable Indonesian law and other relevant jurisdictions before launch.
- If the service-role key is not set, rate limiting falls back to process memory and is not shared across serverless instances. Configure the service key and run the migration for shared database-backed limiting; consider an external limiter at scale.
- AI feedback can be wrong or context-dependent. Have qualified Arabic instructors review a representative evaluation set before launch.

## Troubleshooting

- **Supabase not configured:** confirm `.env.local` exists and restart `npm run dev` after changing it.
- **Email redirect fails:** add the exact local/deployed URL to Supabase Auth's redirect allow-list.
- **Database relation missing:** run the migration in SQL Editor and inspect any SQL errors.
- **AI unavailable:** verify API key, model access, billing/limits, and server logs. Provider secrets are not sent to the browser.
- **Admin page redirects:** promote the registered account with the SQL above, then sign out and back in.
- **Vercel build fails:** inspect the first TypeScript/build error and verify environment variables and Node version.

## Suggested next phase

Add a reviewed placement-assessment rubric and tests, then browser audio recording/transcription with explicit consent. Add realtime voice and human language exchange only after those workflows are validated.
