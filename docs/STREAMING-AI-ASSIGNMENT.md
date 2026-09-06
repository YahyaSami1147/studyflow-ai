# StudyFlow AI — Streaming Chat Assignment

## Assignment Overview

StudyFlow is an existing university capstone repository. This assignment extends it with a real-time streaming AI study assistant powered by NVIDIA Nemotron 3.5 Lightning.

## New Features Added

- StudyFlow AI page at `/ai`
- Real streamed AI responses
- Thinking indicator before the first response token
- `Stop` / `Stop generating` control
- Partial response preservation after stopping
- Ability to send another message after stopping
- Multi-turn conversation context
- Auto-scroll while the user is at the bottom
- Auto-scroll release when the user scrolls upward
- `Jump to latest` control
- Distinct user and assistant messages
- Mobile-responsive chat interface
- Recoverable error state
- Accessibility support, keyboard controls, visible focus states, and reduced-motion behavior

## AI Architecture

```text
Chat UI
  -> /api/chat
  -> server-side AI configuration
  -> NVIDIA API
  -> Nemotron 3.5 Lightning
  -> streamed response
  -> Chat UI
```

The NVIDIA API key remains server-side in `NVIDIA_API_KEY`. It is never exposed to client code or sent to the browser.

## Important Files for Reviewer

- AI page: [src/app/ai/page.tsx](../src/app/ai/page.tsx)
- Main chat component: [src/components/ai/chat.tsx](../src/components/ai/chat.tsx)
- Streaming route handler: [src/app/api/chat/route.ts](../src/app/api/chat/route.ts)
- Centralized model and system prompt: [src/lib/ai/config.ts](../src/lib/ai/config.ts)
- Navigation integration: [src/components/nav-links.tsx](../src/components/nav-links.tsx)

## How to Review

1. Open `/ai`.
2. Send a message and observe the response streaming progressively.
3. Send a long request and click `Stop generating` after text starts appearing.
4. Verify that the partial assistant response remains visible.
5. Send another message and confirm generation works again.
6. Test multiple conversation turns and confirm earlier context is used.
7. During a long stream, scroll upward and verify the viewport is not forced back down.
8. Verify `Jump to latest` appears, then click it to return to the newest content.
9. Test the chat at mobile width, including approximately 375px.

## Verification

The following checks were completed:

- Lint passes.
- Production build passes.
- Real streaming was browser-tested.
- Stop -> partial response -> Send again was browser-tested.
- Multi-turn context was browser-tested.
- Auto-scroll behavior was browser-tested.
- Scroll-up protection during streaming was browser-tested.
- `Jump to latest` was browser-tested, including repeated hide/show behavior.
- Mobile layout was browser-tested at 375px, 390px, and 412px.

## Environment

```env
NVIDIA_API_KEY=your_nvidia_api_key_here
```

The real API key is intentionally excluded from Git. It must be provided through a local server-side environment file such as `.env.local`.

## Existing Project Notice

This repository contains the existing StudyFlow capstone. The files and functionality described in this document represent the additions made specifically for the streaming AI assignment.
