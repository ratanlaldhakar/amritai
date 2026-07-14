import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_URL: z.string().url().default('http://localhost:3000'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1, 'WHATSAPP_PHONE_NUMBER_ID is required'),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1, 'WHATSAPP_ACCESS_TOKEN is required'),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1, 'WHATSAPP_VERIFY_TOKEN is required'),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().min(1, 'WHATSAPP_BUSINESS_ACCOUNT_ID is required'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
});

const isServer = typeof window === 'undefined';
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  APP_URL: process.env.APP_URL,
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL || (isBuildTime ? 'https://mock-supabase.co' : undefined),
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (isBuildTime ? 'mock-anon-key' : undefined),
  SUPABASE_SERVICE_ROLE_KEY:
    process.env.SUPABASE_SERVICE_ROLE_KEY || (isBuildTime ? 'mock-service-role-key' : undefined),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || (isBuildTime ? 'mock-gemini-key' : undefined),
  GROQ_API_KEY: process.env.GROQ_API_KEY || (isBuildTime ? 'mock-groq-key' : undefined),
  WHATSAPP_PHONE_NUMBER_ID:
    process.env.WHATSAPP_PHONE_NUMBER_ID || (isBuildTime ? 'mock-phone-id' : undefined),
  WHATSAPP_ACCESS_TOKEN:
    process.env.WHATSAPP_ACCESS_TOKEN || (isBuildTime ? 'mock-access-token' : undefined),
  WHATSAPP_VERIFY_TOKEN:
    process.env.WHATSAPP_VERIFY_TOKEN || (isBuildTime ? 'mock-verify-token' : undefined),
  WHATSAPP_BUSINESS_ACCOUNT_ID:
    process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || (isBuildTime ? 'mock-business-id' : undefined),
};

// Declare and cast env
let env: z.infer<typeof serverSchema> & z.infer<typeof clientSchema>;

if (isServer) {
  const merged = serverSchema.merge(clientSchema);
  const parsed = merged.safeParse(processEnv);

  if (!parsed.success) {
    const errorDetails = JSON.stringify(parsed.error.flatten().fieldErrors, null, 2);
    console.error(`❌ Invalid environment variables:\n${errorDetails}`);
    throw new Error('Invalid environment variables. Please check your .env.local file.');
  }
  env = parsed.data as any;
} else {
  const parsed = clientSchema.safeParse(processEnv);

  if (!parsed.success) {
    const errorDetails = JSON.stringify(parsed.error.flatten().fieldErrors, null, 2);
    console.error(`❌ Invalid client-side environment variables:\n${errorDetails}`);
    throw new Error('Invalid client-side environment variables.');
  }
  env = {
    NEXT_PUBLIC_SUPABASE_URL: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  } as any;
}

export { env };
export type Env = typeof env;
export type ServerEnv = z.infer<typeof serverSchema> & z.infer<typeof clientSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
