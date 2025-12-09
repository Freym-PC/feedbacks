# AI Coding Agent Instructions for FeedBacks

## Project Overview
**FeedBacks** is a Next.js 15 professional feedback & recommendations platform with Firebase backend and Genkit AI integration. Key features:
- User authentication (email/password, anonymous)
- Professional feedback summarization with Gemini AI
- Chat moderation via Genkit flows
- Firestore-backed data persistence
- Radix UI component system with Tailwind CSS

## Architecture & Data Flow

### Core Services (src/lib/services/)
- **feedbackDataService**: Manages `summarizedFeedbackLogs` collection—wraps Firestore CRUD with error handling
- **userDataService**: Persists User profiles to `users` collection (name, email, sector)
- **chatDataService**, **recommendationDataService**: Follow same pattern
- **All services check `if (!db)` before operations** to handle uninitialized Firebase gracefully

### Firebase Integration (src/lib/firebase/firebaseConfig.ts)
- Singleton pattern: `getApps().length` check prevents re-initialization
- App Check ReCaptcha enabled (client-only via `typeof window` check)
- Environment: `NEXT_PUBLIC_FIREBASE_*` (public) + `RECAPTCHA_SECRET_KEY`, `GEMINI_API_KEY` (server)
- **Error handling model**: Log errors, return null/empty arrays on failure—never throw

### State Management
- **AuthContext** (`src/contexts/AuthContext.tsx`): "use client" provider manages Firebase Auth + Firestore user sync
  - Handles auth state changes via `onAuthStateChanged`
  - Supports email/password, anonymous, and password reset flows
  - User data cached in context, synced to Firestore via `saveUserToFirestore`
- **React Query** (`@tanstack/react-query`): Optional but available for server state
- **Component state**: useState for local form/UI state

### AI Integration (src/ai/)
- **genkit.ts**: Exports single `ai` instance using Google AI plugin with Gemini 2.0 Flash
- **Flows** (`flows/`): "use server" functions define Genkit prompts + flows
  - `moderate-chat-flow.ts`: Returns `{isAppropriate, moderatedText}`
  - `summarize-feedback.ts`: Similar pattern with Zod schema validation
  - **Pattern**: Define input/output Zod schemas → define prompt → wrap in flow
- Client components ("use client") call server functions via async import

## Key Patterns & Conventions

### Type Safety
- **Firestore timestamps**: Import `Timestamp` from `firebase/firestore`, call `.toDate().toISOString()` for client transport (see feedbackDataService)
- **User type** includes optional fields (nullable) to match Firestore schema variability
- Path aliasing: `@/*` → `src/*` (tsconfig.json)

### Component Organization
- **Layout components** (`src/components/layout/`): Navbar, footer
- **Feature components** by domain: `auth/`, `chat/`, `feedback/`, `recommendations/`, `profile/`
- **Shared UI** (`src/components/ui/`): Radix-based primitives pre-wired to Tailwind
- **"use client" boundary**: Applied where needed (forms, Auth context consumers); server components default

### Error Handling Pattern
1. **Services**: Catch, log, return null/[] (not throw)
2. **Client components**: Display `useToast()` notifications (see FeedbackSummarizerClient)
3. **User feedback**: Spanish-first UI; use `date-fns/locale/es` for locale-aware formatting

### Internationalization (i18n)
- **Locale-aware dates**: Use `date-fns` Spanish locale (`import { es } from 'date-fns/locale'`)
  - Example: `formatDistanceToNow(new Date(...), { locale: es, addSuffix: true })`
  - See `src/components/recommendations/RecommendationCard.tsx`, `FeedbackLogList.tsx`, `ChatMessage.tsx`
- **AI responses**: Genkit flows hardcoded for Spanish output—prompts explicitly request Spanish summaries/moderation
- **UI text**: All user-facing strings in Spanish; no translation system in place—app is Spanish-only
- **Dates in legal/metadata**: Format with `toLocaleDateString('es-ES', {...})` for Spanish locale

### Form & Validation
- **react-hook-form** + **@hookform/resolvers**: See auth form components
- **Zod schemas**: Used for Genkit flows; apply to React forms for consistency

## Build & Deployment Commands
```bash
npm run dev                    # Next.js 15 with Turbopack
npm run genkit:dev           # Start Genkit UI for AI flow testing/debugging
npm run genkit:watch         # Watch mode for Genkit flows
npm run build                # TypeScript + ESLint checks (not ignored)
npm run start                # Production server
npm run lint                 # Next.js eslint
npm run typecheck            # tsc --noEmit
```

## Testing & Debugging

### Current State
- **No test framework installed** (no Jest, Vitest, or Playwright)
- **Recommended additions** (if needed): 
  - Unit tests: Jest or Vitest for services, utils, type validation
  - Component tests: React Testing Library for UI components
  - E2E tests: Playwright (already in npm registry) for critical flows (auth, feedback submission)

### Genkit Flow Debugging
- **`npm run genkit:dev`**: Starts Genkit UI at `http://localhost:5173`—use to test flows in isolation
  - Define test inputs, see AI output, debug prompt behavior
  - Useful for tweaking `summarize-feedback` and `moderate-chat-flow` prompts
- **Manual testing**: Call flows from client components, watch browser console + server logs for errors

### Console & Logging Patterns
- Services log errors to console before returning null/[]
- AuthContext logs Firebase auth state changes for debugging session issues
- Firestore operations log with context (e.g., "Failed to add feedback log to Firestore")

## API Routes & Genkit Integration

### Genkit Flows vs. API Routes
- **No traditional `/app/api/route.ts` files currently used**—Genkit flows are the primary server-side entry points
- **Flow pattern**: Client ("use client" component) → async import of "use server" flow → Genkit handles execution

### Genkit Flows Architecture
- Flows are defined in `src/ai/flows/` with "use server" directive
- Each flow exports:
  - **Input/Output Zod schemas** for validation (e.g., `ModerateChatInputSchema`, `ModerateChatOutputSchema`)
  - **Type definitions** (`type ModerateChatInput = z.infer<typeof ...>`)
  - **Flow function** (e.g., `moderateChat(input)`) that calls internal `_Flow` via Genkit

### Adding New API-Like Endpoints
If you need HTTP endpoints instead of Genkit flows:
1. Create `src/app/api/[route]/route.ts` with `POST` or `GET` handlers
2. These will coexist alongside Genkit flows—no conflict
3. For AI operations, prefer server functions (flows) over API routes to reduce round trips
4. Use API routes only for external webhooks, batch operations, or non-AI logic

### Calling Flows from Client
```tsx
// Example: FeedbackSummarizerClient.tsx pattern
"use client";
import { summarizeFeedback } from '@/ai/flows/summarize-feedback';

const result = await summarizeFeedback({ feedbackText });
```

## Critical Conventions

1. **Firestore document IDs**: Firestore auto-generates—store as `id` field, never use native `.id` in data
2. **Server functions in AI flows**: Must have `'use server'` directive + call via "use client" components
3. **Firebase auth listeners**: Always check `if (!auth)` before setup (firebaseConfig.ts pattern)
4. **Timestamp handling**: Convert Firestore Timestamps to ISO strings before sending to client
5. **Environment variables**: Prefix public vars with `NEXT_PUBLIC_`; server vars stay unprefixed
6. **Sector enum**: `ProfessionalSector` is fixed union type (12 sectors + 'Otro'); use for validation

## Common Gotchas
- **ReCaptcha initialization fails if not in browser**: Check `typeof window` (see firebaseConfig)
- **Firebase re-initialization**: Crashes if called twice—`getApps()` check is mandatory
- **Uninitialized db**: All services gracefully handle `db === undefined`
- **Timestamp mismatches**: Firestore `Timestamp` ≠ JavaScript `Date`—always convert

## Directory Reference
- **src/ai/genkit.ts**: AI provider config
- **src/lib/firebase/firebaseConfig.ts**: Firebase singleton init
- **src/lib/services/**: Data layer (all patterns replicate here)
- **src/contexts/AuthContext.tsx**: Auth state + Firestore sync
- **src/types/index.ts**: Centralized TypeScript definitions
- **src/components/ui/**: Pre-styled Radix components (shadcn/ui style)
