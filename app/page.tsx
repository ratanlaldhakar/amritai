import { YOGA_CENTER_INFO } from '@/lib/constants';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-lg">
              ॐ
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-none">
                Amrit Yoga
              </span>
              <span className="text-xs text-muted leading-none font-sans block mt-1">
                AI Receptionist
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#services" className="hover:text-primary transition-colors">
              Services
            </a>
            <a href="#status" className="hover:text-primary transition-colors">
              System Status
            </a>
            <a
              href={YOGA_CENTER_INFO.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Official Website
            </a>
          </nav>
          <div>
            <a
              href={`https://wa.me/${YOGA_CENTER_INFO.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <div className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                ✨ Wellness & Technology Combined
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
                Amrit Yoga AI Receptionist
              </h1>
              <p className="text-lg leading-8 text-muted max-w-xl">
                A production-grade intelligent conversational assistant for Amrit Yoga Center.
                Welcome new practitioners, manage classes, and answer inquiries 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <a
                  href="#status"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/95 transition-colors shadow-md"
                >
                  Configure Integration
                </a>
                <a
                  href="#services"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Explore Yoga Classes
                </a>
              </div>
            </div>
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-[400px] aspect-[4/5] rounded-3xl bg-secondary border border-border p-6 flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      AY
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm leading-none text-foreground">
                        Amrit Yoga Center
                      </h4>
                      <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-ping"></span>
                        AI Receptionist Online
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted">WhatsApp</span>
                </div>

                <div className="flex-1 py-6 flex flex-col gap-4 overflow-y-auto text-sm">
                  <div className="self-start bg-background border border-border rounded-2xl rounded-tl-none p-3 max-w-[85%] shadow-sm">
                    Hari Om! 🙏 Welcome to Amrit Yoga Center. How can I help you discover peace and
                    health today?
                  </div>
                  <div className="self-end bg-primary text-primary-foreground rounded-2xl rounded-tr-none p-3 max-w-[85%] shadow-sm">
                    What are the timings and fees for Hatha Yoga classes?
                  </div>
                  <div className="self-start bg-background border border-border rounded-2xl rounded-tl-none p-3 max-w-[85%] shadow-sm">
                    Our Hatha Yoga sessions run daily from 6:00 AM to 11:00 AM. The monthly fee is{' '}
                    {YOGA_CENTER_INFO.pricing.monthly}. Would you like to book a free trial class?
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex gap-2">
                  <div className="flex-1 h-9 rounded-full bg-background border border-border px-3 py-1.5 text-xs text-muted flex items-center">
                    Type a message...
                  </div>
                  <button className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/95 transition-colors">
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-secondary">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Our Yoga Programs
            </h2>
            <p className="mt-4 text-muted">
              Explore wellness paths designed to harmonize mind, body, and spirit.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {YOGA_CENTER_INFO.services.slice(0, 3).map((service) => (
              <div
                key={service.id}
                className="bg-background border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-2xl mb-4 block">🧘✨</span>
                <h3 className="text-xl font-bold text-foreground mb-2">{service.name}</h3>
                <p className="text-sm text-muted leading-6">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status / Webhook Integration Config */}
      <section id="status" className="py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="bg-background border border-border rounded-3xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              AI WhatsApp Integration Checklist
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div>
                <p className="text-sm text-muted mb-6 leading-relaxed">
                  Verify the webhook server state below. Ensure that you have populated your
                  environment variables in{' '}
                  <code className="bg-secondary px-1.5 py-0.5 rounded text-primary text-xs">
                    .env.local
                  </code>
                  .
                </p>
                <ul className="flex flex-col gap-4 text-sm">
                  <li className="flex items-center gap-3">
                    <span className="text-green-600 text-lg">✔</span>
                    <div>
                      <strong className="block text-foreground font-semibold">
                        Next.js 15 Project Foundations
                      </strong>
                      <span className="text-xs text-muted">Configured and ready.</span>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-600 text-lg">✔</span>
                    <div>
                      <strong className="block text-foreground font-semibold">
                        Environment Validation (Zod)
                      </strong>
                      <span className="text-xs text-muted">
                        Configured to block deployment if variables are missing.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-600 text-lg">✔</span>
                    <div>
                      <strong className="block text-foreground font-semibold">
                        WhatsApp Cloud API client
                      </strong>
                      <span className="text-xs text-muted">Isomorphic handlers configured.</span>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-600 text-lg">✔</span>
                    <div>
                      <strong className="block text-foreground font-semibold">
                        Gemini 2.5 Flash SDK Client
                      </strong>
                      <span className="text-xs text-muted">Initialized and ready.</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-secondary rounded-2xl p-6 border border-border text-xs font-mono">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <span className="font-semibold text-foreground">Webhook Target Route</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                    GET / POST
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <p>
                    <span className="text-muted"># Webhook verification target</span>
                  </p>
                  <p>
                    <span className="text-primary font-semibold">URL:</span>{' '}
                    {YOGA_CENTER_INFO.website}/api/webhook
                  </p>
                  <p>
                    <span className="text-primary font-semibold">Verify Token:</span> (defined in
                    env.WHATSAPP_VERIFY_TOKEN)
                  </p>
                  <p className="border-t border-border pt-2 mt-2">
                    <span className="text-muted"># Quick verification cURL:</span>
                  </p>
                  <p className="bg-zinc-950 text-zinc-300 p-2.5 rounded overflow-x-auto text-[10px] leading-relaxed select-all">
                    curl -X GET
                    &quot;http://localhost:3000/api/webhook?hub.mode=subscribe&amp;hub.challenge=TEST_CHALLENGE&amp;hub.verify_token=YOUR_VERIFY_TOKEN&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-secondary text-sm">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted">
            &copy; {new Date().getFullYear()} {YOGA_CENTER_INFO.name}. All rights reserved.
          </p>
          <div className="flex gap-6 text-muted">
            <span>Location: Raipur, Chhattisgarh</span>
            <a
              href={YOGA_CENTER_INFO.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              Website
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
