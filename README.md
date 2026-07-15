# Amrit Yoga AI - WhatsApp Receptionist Foundation

Amrit Yoga AI is a production-grade backend foundation for a WhatsApp AI Receptionist designed for **Amrit Yoga Center** (Raipur, Chhattisgarh). This foundation handles core client SDK setups, environment validation, API routing, standard response formats, structured logging, and robust error handling using Next.js 15, TypeScript, TailwindCSS v4, Supabase, Google Gemini, Groq, and the WhatsApp Cloud API.

---

## 🏗️ Architecture & Folder Structure

The project features a highly structured, scalable folder layout:

```text
├── app/                  # Next.js 15 App Router pages & API routes
│   ├── api/
│   │   └── webhook/      # WhatsApp Webhook GET (verification) and POST (receiver) routes
│   ├── layout.tsx        # Global HTML structure and font loaders
│   └── page.tsx          # Wellness-themed center landing page
├── components/           # Reusable UI components & providers
├── lib/                  # SDK Clients and core helper modules
│   ├── env.ts            # Run-time environment variable validation via Zod
│   ├── supabase.ts       # Supabase Client configurations (Anon and Server Service Role)
│   ├── gemini.ts         # Google Gemini 2.5 SDK client initialization
│   ├── groq.ts           # Groq SDK client initialization
│   ├── whatsapp.ts       # Meta WhatsApp Cloud API fetch-based wrapper
│   ├── logger.ts         # JSON structured logging (production) and colored console log (dev)
│   ├── error.ts          # Custom domain error classes & route wrapper middleware
│   └── constants.ts      # Yoga center operational data and AI receptionist prompts
├── services/             # Dedicated business logic adapters
├── hooks/                # Custom React hooks
├── types/                # Core TypeScript types & definitions
├── utils/                # Helper files
│   ├── api.ts            # API request parsing/validation and response utilities
│   └── loading.ts        # Promise wrappers for delays and timeouts
├── styles/               # Global styling (globals.css configuration for Tailwind v4)
├── public/               # Static assets (images, icons, favicon)
├── supabase/             # Database migrations, seed scripts, schemas
├── vercel.json           # Vercel security headers and config
├── .env.example          # Template environment variable configuration
└── README.md             # Project documentation
```

---

## 🛠️ Getting Started

### 1. Prerequisite Installations

- **Node.js**: `v20.x` or later is recommended.
- **npm**: `v10.x` or later.

### 2. Configuration Setup

Create a `.env.local` file by copying the example template:

```bash
cp .env.example .env.local
```

Fill out the variables inside `.env.local` using details from your Meta App, Supabase, Google AI Studio, and Groq Developer portals.

### 3. Install Dependencies

```bash
npm install
```

### 4. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the wellness landing page.

---

## 🔌 API Integrations

### WhatsApp Webhook Integration

Meta requires webhooks to run over HTTPS. For local testing:

1. Install and run **Ngrok**:
   ```bash
   ngrok http 3000
   ```
2. Copy the secure forwarding URL (e.g. `https://xxxx-xx.ngrok-free.app`).
3. In your Facebook Developer Portal, configure the WhatsApp Webhook:
   - **Callback URL**: `https://xxxx-xx.ngrok-free.app/api/webhook`
   - **Verify Token**: Must match the value defined in `WHATSAPP_VERIFY_TOKEN` (in `.env.local`).
4. Subscribe to the `messages` feed under Webhook fields.

---

### Supabase Database Webhook Integration (New Booking Notification)

When a client books a trial class on the website, a row is inserted into the `trial_bookings` table. This triggers a Database Webhook request to Project B (AI Receptionist) to send an automated confirmation message:

1. Deploy the AI project to Vercel (e.g., `https://ai.amrityogacenter.in`).
2. Log into your [Supabase Dashboard](https://supabase.com).
3. Navigate to **Database** -> **Webhooks** from the left-hand menu.
4. Click **Create a new Webhook**:
   - **Name**: `send_booking_confirmation`
   - **Table**: `trial_bookings`
   - **Events**: Toggle only `INSERT` (on insert of new booking)
   - **Type**: `HTTP Post`
   - **URL**: `https://YOUR_AI_DOMAIN.vercel.app/api/webhooks/trial-booking`
   - **HTTP Headers**: Add `Authorization: Bearer <your_webhook_secret>` to match the `DATABASE_WEBHOOK_SECRET` environment variable to secure the route.
5. Save the Webhook. Supabase will now invoke this endpoint asynchronously on every new website booking.

---

## 🔒 Security & Best Practices

- **Strict Type Checking**: Verify types by running `npm run build` or `npx tsc --noEmit`.
- **Environment Safety**: The Zod configuration in `lib/env.ts` fails the build/runtime instantly if required credentials are omitted or wrongly formatted.
- **Service Role Safety**: The Supabase service role client contains a browser guard that throws an error if imported in client-side components to avoid leaking credentials.
- **Vercel Security**: Security headers like CSP rules, frame options, and referrer policies are configured out-of-the-box in `vercel.json`.
