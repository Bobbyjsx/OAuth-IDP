# OAuth 2.0 Hosted Identity Provider UI

A modern, standalone OAuth 2.0 Identity UI frontend built with **Next.js (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **TanStack Query v5**.

This application serves as the hosted authentication and authorization interface that third-party client applications redirect users to during OAuth 2.0 authorization flows.

---

## Features

- **Session Context Driven**: Reads session state via `GET /api/v1/auth-sessions/{session_id}` to dynamically apply client branding (names, logos, color scales) and enforce client security policies (e.g. signup disabled, mandatory email verification).
- **Dynamic Brand Theming**: Dynamically generates full color scales from application branding colors (`primary_color`, `secondary_color`) with full dark mode support.
- **Authentication Flows**:
  - **Login** (`/auth/[session_id]/login`): Credentials authentication with seamless redirect or step-up verification.
  - **Signup** (`/auth/[session_id]/signup`): Account registration with password strength requirements and dynamic verification triggers.
  - **Email Verification OTP** (`/auth/[session_id]/verify-email`): 6-digit split input boxes, paste auto-distribution, 30s resend cooldown, attempt limiting (5 attempts), and session lockout protections.
  - **Password Recovery** (`/auth/[session_id]/forgot-password` & `/auth/[session_id]/reset-password`): Token-validated password reset flow.
- **Error & Cancellation Handling**:
  - Cancel actions (`POST /api/v1/auth-sessions/{session_id}/cancel`) that safely abort authentication and redirect back to the client application with RFC-compliant error callback parameters (`error=access_denied&state=...`).
  - Automatic expired and cancelled session detection with a dedicated `SessionEndedScreen` featuring status messaging and a 5-second automated redirect countdown.
- **Modular API & State Layer**:
  - Encapsulated API resource definitions (`src/api/auth-session.ts`, `src/api/auth.ts`, `src/api/verification.ts`, `src/api/password.ts`, `src/api/health.ts`).
  - Automated TanStack Query cache invalidation on mutation settlement.
  - Reusable utilities and custom hooks (`useAuthSession`, `useCountdown`, `useLogin`, `useSignup`, `useVerifyEmail`, `useCancelSession`, etc.).
- **System Health Dashboard**: Root page (`/`) monitoring live Identity Service health availability.

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **UI / Styling**: Tailwind CSS v4, Framer Motion, Lucide React
- **State & Data Fetching**: TanStack Query (React Query v5), Axios
- **Form Handling & Validation**: React Hook Form, Zod
- **Notifications**: Sonner
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [pnpm](https://pnpm.io/) (v9.15+)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd oauth-idp
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

### Running Locally

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the system status dashboard.

To test an OAuth authentication session, navigate to:

```
http://localhost:3000/auth/{session_id}/login
```

---

## Available Scripts

| Script         | Command                              | Description                               |
| -------------- | ------------------------------------ | ----------------------------------------- |
| `dev`          | `next dev`                           | Start development server with Turbopack   |
| `build`        | `next build`                         | Build optimized production bundle         |
| `start`        | `next start`                         | Start production server                   |
| `lint`         | `eslint`                             | Run ESLint checks                         |
| `lint:fix`     | `eslint --fix && prettier --write .` | Automatically fix linting and format code |
| `format`       | `prettier --write .`                 | Format all files with Prettier            |
| `format:check` | `prettier --check .`                 | Check formatting compliance               |

---

## Project Structure

```
src/
├── api/                    # Modular API resources and custom mutation hooks
│   ├── auth-session.ts     # Session retrieval, cancellation & query keys
│   ├── auth.ts             # Login & signup endpoints
│   ├── health.ts           # Health check endpoint
│   ├── password.ts         # Forgot & reset password endpoints
│   ├── verification.ts     # Email OTP verification & resend endpoints
│   └── index.ts            # Central barrel exports
├── app/                    # Next.js App Router pages and layouts
│   ├── auth/[session_id]/  # Dynamic session route group
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── reset-password/
│   │   ├── signup/
│   │   ├── verify-email/
│   │   └── layout.tsx      # Auth session layout & metadata generation
│   ├── layout.tsx          # Root application layout & providers
│   └── page.tsx            # Service status page
├── components/
│   ├── modules/            # Feature-level components (Forms, SessionEndedScreen, Wrapper)
│   │   ├── auth/           # Auth form modules & CancelButton
│   │   └── auth-layout-wrapper.tsx
│   └── ui/                 # Reusable UI primitives (Button, Input, OtpInput, PasswordInput, etc.)
├── hooks/                  # Custom React hooks (useAuthSession, useCountdown)
├── lib/                    # Core utilities, API error definitions, axios client, theme helpers
└── types/                  # TypeScript interface definitions (OAuth session & responses)
```
