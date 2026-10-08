# G-12MATH

Grade 12 Mathematics learning platform with a React/Vite frontend and a dedicated Supabase backend.

## Applications

- `apps/web/` — React frontend
- `apps/api/` — Express API for backend/payment operations
- Supabase — G-12MATH authentication and Grade 12 question data

## Public website

https://szfq72zvbj-collab.github.io/G-12MATH/

## Authentication

The public G-12MATH site uses Supabase Auth with persistent browser sessions. Students can create an account, sign in, and reset their password.

The Grade 12 question bank uses Supabase tables with Row Level Security. Students can see published questions and save their own quiz attempts.

## Admin

After creating your account, your profile can be promoted to `admin`. Admins can open `/admin` and manage the Grade 12 question bank:

- choose a chapter
- add questions
- edit questions
- delete questions
- set A–D options and the correct answer
- add explanations
- set difficulty
- publish or save as draft
- review students and quiz attempts

Mathematical notation can be entered with LaTeX such as `$x^2$`, `$\\sqrt{x}$`, and `$\\int_0^2 x\\,dx$`.

## Database

The dedicated G-12MATH Supabase project contains:

- `profiles`
- `grade12_chapters`
- `grade12_questions`
- `grade12_attempts`

The project is separate from the existing GED Mathematics Supabase project.

## Local development

Copy `apps/web/.env.example` to `apps/web/.env` and set the G-12MATH Supabase URL and publishable key.

Then:

```bash
npm install
npm run dev
```

The web app uses Vite and the public deployment is built automatically through GitHub Actions.
