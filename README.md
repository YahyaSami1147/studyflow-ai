# StudyFlow AI

StudyFlow AI is a local-first learning productivity workspace for managing courses, assignments, tasks, notes, progress, and AI-supported study. Its Learning Constellation turns the same persisted courses and study work into an interactive, lazy-loaded 3D knowledge map.

## Live Demo

- Production URL: [(https://studyflow-ai-ivory-xi.vercel.app)]
- Repository: [github.com/YahyaSami1147/studyflow-ai](https://github.com/YahyaSami1147/studyflow-ai)

## Screenshots

The following populated local production screenshots show the main workflows without secrets or debug UI:

![StudyFlow dashboard](public/readme/dashboard.webp)
![StudyFlow courses](public/readme/courses.webp)
![StudyFlow AI assistant](public/readme/ai-assistant.webp)
![Learning Constellation](public/readme/learning-constellation.webp)

## Features

- Course management with course-linked assignments, tasks, and notes
- Task completion, priorities, due dates, and assignment status
- Calendar, dashboard, progress, profile, and settings workspaces
- Local persistence through the shared `studyflow:data` browser record
- Streaming StudyFlow AI assistant with multi-turn context, stop, retry, partial-response preservation, markdown, and study tools
- `analyzeStudyProgress` and `createStudyQuiz` AI tools with visible lifecycle cards
- Responsive keyboard-accessible UI with reduced-motion support
- Learning Constellation built from real persisted courses, assignments, and tasks
- WebGL loading, failure, context-loss, and 2D accessible fallbacks

## Tech Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Vercel AI SDK with NVIDIA's OpenAI-compatible API
- Three.js, React Three Fiber, and Drei
- Vitest and React Testing Library
- Playwright with Chromium, Firefox, WebKit, and mobile WebKit projects

## Getting Started

```bash
git clone https://github.com/YahyaSami1147/studyflow-ai.git
cd studyflow-ai
npm install
copy .env.example .env.local
npm run dev
```

On macOS/Linux, replace the `copy` command with `cp .env.example .env.local`.

Open [http://localhost:3000](http://localhost:3000). The AI assistant is at `/ai`; the 3D experience is at `/learning-constellation`.

## Environment Variables

| Variable | Required | Scope | Purpose |
| --- | --- | --- | --- |
| `NVIDIA_API_KEY` | Yes for live AI | Server-only | Authenticates requests to NVIDIA's OpenAI-compatible model endpoint. |
| `STUDYFLOW_ENABLE_FAILURE_TESTS` | Optional, development only | Server-only | Enables documented local failure hooks for AI error-state testing. Keep `false` in production. |

Create `.env.local` from `.env.example`. Never commit `.env.local` or put `NVIDIA_API_KEY` in a `NEXT_PUBLIC_*` variable.

## Architecture

```text
StudyFlow UI
├─ Courses / Assignments / Tasks / Notes
│  └─ StudyFlowProvider → localStorage["studyflow:data"]
├─ Learning Constellation
│  └─ constellation-data-adapter → lazy R3F/Three.js scene
└─ AI Assistant
	└─ /api/chat → validation → NVIDIA model stream
```

Server components provide the application shell and routes by default. Client components own browser state, local persistence hydration, chat interaction, and WebGL. The AI API route stays server-side so the provider key is never sent to the browser.

## Key Engineering Decisions

### Local-first persistence

StudyFlow currently stores its normalized application record under `studyflow:data`. The shared storage utility validates and defensively normalizes the record. The constellation reads that same provider data through an adapter instead of keeping a second progress database.

### Streaming AI

The assistant uses `streamText` and UI-message streaming so users see useful output as it is generated. Stop, retry, interrupted-stream handling, and partial-response preservation are implemented in the chat UI rather than simulated with delayed complete responses.

### Production AI boundaries

The chat route rejects malformed, empty, oversized, and overlong conversations before model conversion. It accepts at most 32 messages, limits each user message to 8,000 characters, limits serialized request size to 120,000 characters, limits saved StudyFlow context to 24,000 characters, and declares `maxDuration = 30` for deployment. These are meaningful abuse protections; distributed global rate limiting would require an external shared store that this local-first project does not currently provision.

### Real-data constellation

Courses become major nodes and assignments/tasks become child nodes. Progress comes from stored completion/status values; overdue incomplete work becomes `needs-review`. The adapter uses deterministic ID-based positions, adaptive course spacing, bounded collision resolution, and local child rings so adding courses does not randomly reshuffle the map.

### Lazy 3D and accessibility

The Three/R3F scene is client-only and dynamically loaded. DPR is capped, geometry is procedural, background effects have mobile quality limits, and reduced motion disables ambient movement and shooting stars. WebGL failure falls back to a readable 2D representation and the keyboard-accessible list remains available regardless of canvas support.

## Performance

- The 3D scene is isolated behind a client-only dynamic import.
- Procedural geometry and points avoid large models and textures.
- DPR is capped at `1.5` desktop and `1.25` compact devices.
- Galaxy particles are reduced on mobile; shooting stars are desktop-only.
- Shooting-star trails use a fixed recycled particle buffer, not growing arrays.
- The renderer uses demand-driven frames and refs for per-frame transforms.
- A prior production review measured a separate Three/R3F feature chunk at approximately 918 KB raw and 244 KB encoded. Headless Chromium used SwiftShader, so those measurements are diagnostic rather than physical-device performance claims.

## Testing

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
npx playwright test
```

Playwright projects cover Chromium, Firefox, WebKit as a Safari approximation, and mobile WebKit using iPhone viewport/touch emulation. Physical Safari and real-device testing remain recommended before public submission.

The test suite covers local workflow persistence, AI UI behavior, real-data constellation mapping, deterministic layout spacing for 1/5/8/12 courses, ten-child clusters, WebGL fallback, reduced motion, loading, touch interaction, and responsive overflow.

## Production Protection

- `NVIDIA_API_KEY` is server-only.
- Invalid JSON and invalid message structures return `400`.
- Empty messages return `400`.
- Oversized messages, context, and conversation payloads return `413`.
- Streaming execution is capped at 30 seconds with `maxDuration`.
- The client prevents duplicate submissions while a request is active.
- No distributed rate limiter is claimed; adding one requires a shared production store such as a managed Redis/KV service.

## How AI Tools Built This

AI coding assistants were used throughout the capstone to explore requirements, audit the existing codebase, propose component boundaries, and accelerate implementation of the streaming assistant and Learning Constellation. Generated work was treated as a draft: the repository diff was audited after one assistant reached its usage limit, existing storage was traced before replacing demo constellation data, and implementation details were corrected when browser behavior disagreed with assumptions.

The verification loop was deliberate. TypeScript, ESLint, Vitest, production builds, Playwright interaction tests, mobile viewport checks, reduced-motion checks, WebGL failure checks, and performance review scripts were used to validate generated code. AI-proposed sample data was later replaced by the real `studyflow:data` adapter. Subsequent review caught and fixed sidebar icon flex shrinking, inconsistent Course/Subject product language, dense constellation collisions, camera framing, and bounded cosmic particle behavior.

## Known Limitations

- Persistence is browser-local; there is no authentication or cloud sync yet.
- The current data model has no quiz, mastery, confidence, or study-session entity, so the constellation does not invent those metrics.
- Live AI responses depend on NVIDIA provider availability and a configured API key.
- Distributed production rate limiting is not included because no shared deployment store is configured.
- Playwright WebKit is a Safari compatibility approximation, not physical Safari hardware.

## Future Improvements

- Authentication and cloud synchronization
- A first-class topic, quiz, and mastery model
- AI-generated concept relationships grounded in saved course material
- A managed distributed rate-limit store
- Larger-graph instancing and graph-level culling

## Deployment Checklist

Before deploying to Vercel:

1. Set `NVIDIA_API_KEY` as a server-only production environment variable.
2. Keep `STUDYFLOW_ENABLE_FAILURE_TESTS=false` or unset.
3. Use the build command `npm run build`.
4. Confirm `/`, `/courses`, `/ai`, `/learning-constellation`, and `/health` load publicly.
5. Verify course creation persists after reload.
6. Verify AI streaming, Stop, retry, and an oversized-message rejection.
7. Verify the constellation reflects the created course and assignments on desktop and mobile.
8. Check the browser console for critical errors in Chromium and Safari/WebKit-like testing.

## Checkpoint 2 Reviewer Note

StudyFlow AI is a local-first learning workspace combining course and task management with a server-side streaming AI study assistant and a real-data 3D Learning Constellation. The final pass adds AI request caps and a 30-second stream limit, documents the architecture and environment setup, and verifies the main workflows with unit, production-build, and cross-browser Playwright coverage. Replace the Live Demo placeholder above with the deployed Vercel URL before submission.
# StudyFlow

StudyFlow is a student productivity and academic management application that brings study planning, courses, assignments, tasks, notes, progress tracking, and account management into one focused interface. StudyFlow AI adds a real-time streaming study assistant for planning, prioritization, explanations, and academic productivity support.

## Features

- Dashboard overview for study activity and progress
- Course and assignment workspaces
- Task management
- Calendar view
- Notes workspace
- Progress tracking
- Health and application status view
- Profile and settings pages
- Login and registration pages
- StudyFlow AI streaming assistant

## Learning Constellation - Interactive 3D Experience

### What I built

`/learning-constellation` presents a procedural knowledge map with a central StudyFlow core, one subject node per persisted course, child nodes for persisted assignments and tasks, parent-child connections, and a lightweight spatial particle field. It reads the shared `studyflow:data` localStorage record through `src/lib/studyflow-storage.ts` and normalizes it in `src/components/learning-constellation/constellation-data-adapter.ts` before passing nodes to the 3D layer.

### Interaction

- Orbit and zoom the map with mouse or touch exploration.
- Select subjects or topics from the 3D scene or the keyboard-accessible topic list.
- Selecting a node focuses the camera, highlights related connections, dims unrelated nodes, and expands the selected subject cluster.
- Inspect progress, status, related concepts, and the suggested next StudyFlow action in the detail panel. Mastery is honestly shown as unavailable because the current StudyFlow schema stores no quiz, confidence, or mastery field.
- Filter topics by all, in progress, needs review, or completed; reset the selection and camera with Reset view.

### Performance note

The scene uses procedural spheres, line geometry, and generated point positions, with no external 3D assets or large textures. The Three/R3F scene is loaded through a client-only dynamic import, and the canvas caps device pixel ratio at `1.5` on desktop and `1.25` on compact devices. The particle field uses 180 points normally and 85 in compact mode. The renderer uses demand-driven frames, refs for camera transitions, shared node geometry, and no per-frame React state updates.

The production build completed successfully and reports `/learning-constellation` as a static route. A production review measured a separate Three/R3F feature chunk at approximately 918 KB raw and 244 KB encoded in this build. In headless Chromium using SwiftShader, desktop and reduced-motion idle windows rendered zero additional frames because the canvas uses demand rendering; the observed interaction windows rendered 31 desktop focus frames and 73 mobile focus frames. These are diagnostic observations, not physical-device FPS measurements. Reduced motion disables floating/pulsing animation and makes camera transitions immediate.

### Accessibility

The non-canvas subject and topic list uses native buttons with selected-state semantics and remains the primary inspection path when WebGL is unavailable. Reset and filter controls are keyboard accessible, Escape resets the view, and a polite live region announces selection changes. On compact touch devices, exploration is opt-in so the page remains scrollable. A loading view is shown while the 3D chunk initializes, and WebGL or context-loss failures replace the canvas with a readable 2D progress view. With no stored courses, the page shows an empty state linking to Courses rather than sample academic data.

### With more time

- Generate concept relationships from course and AI activity.
- Persist layouts and add explicit concept prerequisites.
- Use instancing and graph-level culling for substantially larger maps.

## StudyFlow AI

The `/ai` page provides a real-time chat experience powered by NVIDIA Nemotron 3.5 Lightning. It includes streamed responses, a thinking state before the first token, stop generation with partial response preservation, follow-up messages after stopping, multi-turn context, smart auto-scroll, scroll-up protection, `Jump to latest`, distinct user and assistant messages, and a mobile-responsive chat layout.

For implementation details, reviewer instructions, architecture, and assignment-specific testing steps, see the [Streaming AI Assignment Guide](./docs/STREAMING-AI-ASSIGNMENT.md).

### Study progress tool contract

`analyzeStudyProgress` is a server-side AI tool defined in [`src/lib/ai/study-progress-tool.ts`](./src/lib/ai/study-progress-tool.ts). It is used when a student asks to analyse progress and supplies all four details below.

| Input | Type | Purpose |
| --- | --- | --- |
| `subject` | string | The course or subject name |
| `completedTopics` | integer | Topics already completed |
| `totalTopics` | positive integer | Total topics in the course |
| `hoursStudied` | number | Hours studied so far |
| `simulateFailure` | optional boolean | Test-only flag set when explicitly testing the tool error state |

The Zod schema validates the input on the server. Its `execute` function returns `{ subject, completionPercentage, remainingTopics, progressLevel, recommendedHours }`; `simulateFailure` is used only to exercise the recoverable error path and is not returned. The chat renders the lifecycle as distinct input-streaming, input-available, output-available, and output-error cards; a successful result appears as a Study Progress card with a completion bar rather than raw JSON.

To test a successful call at `/ai`, ask: “Analyse my progress for Data Structures: I completed 7 of 12 topics and studied 14 hours.” To demonstrate the designed tool-error card, explicitly ask StudyFlow AI to test a progress-tool error with the same details.

## Tech Stack

- Next.js 16.3.4
- React 19.2.8
- TypeScript
- Tailwind CSS 4
- Lucide React
- Vercel AI SDK 7
- `@ai-sdk/react`
- `@ai-sdk/openai` for NVIDIA's OpenAI-compatible API
- NVIDIA NIM with Nemotron 3.5 Lightning

## AI Architecture

```text
User
	↓
StudyFlow AI Chat
	↓
Next.js /api/chat
	↓
AI SDK streaming
	↓
NVIDIA API
	↓
Nemotron 3.5 Lightning
	↓
Streamed response
```

AI requests go through the server-side `/api/chat` route. The NVIDIA API key is read from a server-side environment variable and is never exposed to browser or client code.

## Getting Started

1. Clone the repository.
2. Install dependencies:

	 ```bash
	 npm install
	 ```

3. Create `.env.local` in the project root and add:

	 ```env
	 NVIDIA_API_KEY=your_nvidia_api_key_here
	 ```

	 Never commit `.env.local` or a real API key.

4. Start the development server:

	 ```bash
	 npm run dev
	 ```

Open [http://localhost:3000](http://localhost:3000). StudyFlow AI is available at [http://localhost:3000/ai](http://localhost:3000/ai).

## Available Scripts

- `npm run dev` starts the Next.js development server.
- `npm run build` creates a production build.
- `npm run start` starts the production server.
- `npm run lint` runs ESLint.
- `npm test` runs the Vitest suite once.
- `npm run test:watch` runs Vitest in watch mode.

Vitest and React Testing Library tests are colocated with the source under `src/**/*.test.ts` and `src/**/*.test.tsx`.

Course Detail uses the shared accessible Tabs component for Overview, Assignments, Notes, and Progress. Quiz review explanations use independent accessible Disclosure controls. StudyFlow's existing native dialog components remain the canonical modal system.

## Streaming AI Assignment

This repository is the continuing StudyFlow capstone. The streaming AI functionality was added as a Build (Core) assignment; the entire StudyFlow application was not created for this assignment.

The [Streaming AI Assignment Guide](./docs/STREAMING-AI-ASSIGNMENT.md) contains the new functionality, architecture, important source files, reviewer test instructions, and verification information.

## Reliability and failure testing

The `/ai` chat preserves its conversation and partial streamed text when a request fails, then offers a safe retry action. It also distinguishes connection interruptions, rate limits, interrupted streams, and general server failures without exposing provider details.

For local development only, add this to `.env.local` and restart the dev server:

```env
STUDYFLOW_ENABLE_FAILURE_TESTS=true
```

The hooks are disabled outside Next.js development mode. In the browser console at `/ai`, set one of the following values, then send or retry a chat message:

```js
localStorage.setItem("studyflow-failure-test", "server")     // forced HTTP 500
localStorage.setItem("studyflow-failure-test", "rate-limit") // forced HTTP 429
localStorage.setItem("studyflow-failure-test", "slow")       // 2.5-second delay
localStorage.setItem("studyflow-failure-test", "mid-stream") // interrupts after text starts
```

Remove the hook and retry normally with:

```js
localStorage.removeItem("studyflow-failure-test")
```

To test the route-level error boundary locally, temporarily add `throw new Error("Local route test")` at the top of `src/app/ai/page.tsx`, open `/ai`, confirm the Try again UI appears, then remove the line before committing.

## Animated Send button assignment

The controlled `src/components/animated-send-button.tsx` component is shared by the real `/ai` chat and the reviewer page at [`/motion-demo`](http://localhost:3000/motion-demo). It supports idle, hover, pressed, keyboard focus, loading, success and error, plus a separate disabled prop. The chat keeps streaming and Stop, shows Sent for 900ms only after successful completion, and offers Retry for a failed request when the composer is empty. Typing a new message enables a new send; the existing Retry response action remains available.

The demo offers **Force Success**, **Force Error**, and **Random** (80% success), using a cancellable 1.1-second simulated request with no backend calls. Changing modes affects the next attempt. Clear its input to inspect Disabled.

Motion uses 160ms hover/press and 280ms feedback transitions with ease-out, transform and opacity, and a stable button width. Native buttons, visible focus, busy/disabled semantics and polite status announcements provide accessible feedback. Reduced motion removes translation, scaling and spinner rotation while retaining labels, icons, colors and focus. Request locks prevent duplicate submissions; timers are cleaned up on interruption and unmount.

## Security

- `NVIDIA_API_KEY` is server-side only.
- `.env.local` is excluded from Git.
- `.env.example` contains only a placeholder value.
- The API key must never be exposed through a `NEXT_PUBLIC_*` variable.

## Deployment

StudyFlow can be deployed to Vercel. Configure `NVIDIA_API_KEY` as a server-side environment variable in the deployment environment. Never place a real API key in this README or in client-side code.

## Assignment Reviewer

For the Streaming AI assignment, start at [`/ai`](http://localhost:3000/ai) and follow the [Streaming AI Assignment Guide](./docs/STREAMING-AI-ASSIGNMENT.md).
