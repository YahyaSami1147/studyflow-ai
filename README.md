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

## Security

- `NVIDIA_API_KEY` is server-side only.
- `.env.local` is excluded from Git.
- `.env.example` contains only a placeholder value.
- The API key must never be exposed through a `NEXT_PUBLIC_*` variable.

## Deployment

StudyFlow can be deployed to Vercel. Configure `NVIDIA_API_KEY` as a server-side environment variable in the deployment environment. Never place a real API key in this README or in client-side code.

## Assignment Reviewer

For the Streaming AI assignment, start at [`/ai`](http://localhost:3000/ai) and follow the [Streaming AI Assignment Guide](./docs/STREAMING-AI-ASSIGNMENT.md).
