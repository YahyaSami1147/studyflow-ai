# StudyFlow AI — Capstone Submission

## Project Brief

StudyFlow AI is a student-focused learning productivity application designed to bring academic planning, progress tracking, and AI-supported study support into one place. It helps students manage courses, assignments, tasks, and study priorities while using the same saved StudyFlow context to provide helpful guidance rather than generic chatbot responses.

## Live Application

https://studyflow-ai-ivory-xi.vercel.app

## Repository

https://github.com/YahyaSami1147/studyflow-ai

## AI Integration

StudyFlow includes a server-side AI assistant in `src/app/api/chat/route.ts` that uses the Vercel AI SDK and NVIDIA’s OpenAI-compatible endpoint with the model `nvidia/nemotron-3.5-lightning-30b-a3b`. The assistant uses StudyFlow context generated from the user’s saved course, assignment, and task data so recommendations are grounded in the learner’s actual workload rather than a detached generic chat experience.

The route validates incoming requests, enforces message and payload size limits, keeps the API key server-only, and supports streaming responses, retry, stop behavior, and controlled error states. This preserves the product’s focus on academic planning and learning support without exposing the provider or allowing malformed requests to reach the model.

## Testing Evidence

Current repository evidence shows:

- Vitest: 44 tests passed
- Playwright E2E: 42 passed, 2 intentionally skipped for real capability differences in CI and browser environments

The suite covers core workflow creation, progress updates, AI chat states, Learning Constellation interactions, reduced motion, loading behavior, fallback behavior, and browser capability differences across Chromium, Firefox, WebKit, and mobile WebKit.

## Accessibility & Performance

Accessibility and performance were addressed through implementation decisions already present in the repository, not through external audits. The application includes semantic controls, keyboard interaction, reduced-motion support, and an accessible non-canvas fallback for the Learning Constellation. The 3D scene is lazy-loaded, uses procedural geometry instead of heavy models, and keeps the experience lightweight across responsive and mobile layouts.

No external WAVE, axe, or Lighthouse audit is claimed in this submission because there is no repository evidence for those runs.

## Deployment & Operations

The project is deployed through Vercel and uses a production-safe server-side API key model. Request validation, empty-input rejection, message caps, and `maxDuration = 30` provide the current production protection. The app also includes explicit fail-safe states for AI provider failure, WebGL failure, invalid data, and invalid API requests.

Deployment checklist:

- [x] Production build passes
- [x] ESLint passes
- [x] TypeScript check passes
- [x] Unit/component tests pass
- [x] Production environment variables are configured
- [x] Secrets remain server-side
- [x] Public production URL is deployed
- [x] README contains setup instructions
- [x] Error and fallback states are documented
- [x] Rollback approach is documented
- [x] Cross-browser E2E verification has been run and passed in CI/browser matrix coverage

Current verified evidence from the project run:

- ESLint passed
- TypeScript check passed
- Vitest: 44/44 tests passed
- Production build passed
- Playwright E2E: 42 passed, 2 intentionally skipped in browser capability-aware validation

Rollback flow:

1. Identify the last known-good deployment.
2. Redeploy or promote that version if a production issue appears.
3. Revert the git change if the issue is code-related.
4. Push the corrected branch and wait for the build to finish.
5. Run the primary smoke flow: course creation, progress updates, AI chat, and Learning Constellation loading.

## Known Limitations

- StudyFlow data is browser-local rather than cloud-synced
- there is no authentication or multi-user account synchronization
- AI responses depend on external provider availability and a configured key
- distributed rate limiting is not implemented in a shared production store
- WebGL behavior varies by browser engine and CI environment

## Reflection

The hardest part of the project was making the product reliable in the real world, not just in the happy path. The AI flow required careful handling of streaming state, retries, provider errors, and validation, while the Learning Constellation needed to reflect actual StudyFlow data instead of demo-only content. Browser capability differences also required honest fallback handling rather than assuming all environments could initialize the 3D canvas.

The project reinforced that shipping a feature is not the same as shipping a production-ready product. Reliable behavior, accessible alternatives, deployment safeguards, documentation, and real verification were just as important as the visible interface itself.
