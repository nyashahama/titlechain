import { Button } from "@/app/_components/landing/shared/Button";
import { cn } from "@/app/_lib/cn";
import { Check } from "lucide-react";

const accessRequestHref =
  "mailto:hello@titlechain.co.za?subject=TitleChain%20access%20request";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "For sole practitioners and small conveyancing firms.",
    cta: "Request access",
    href: accessRequestHref,
    features: [
      "Up to 50 title verifications/month",
      "Basic risk scoring",
      "Deeds search access",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "R2,500",
    subtitle: "/month",
    tag: "Popular",
    description: "For growing firms that need advanced intelligence.",
    cta: "Start pilot",
    href: "mailto:hello@titlechain.co.za?subject=TitleChain%20professional%20pilot",
    features: [
      "Up to 500 verifications/month",
      "Advanced risk engine",
      "Bond and interdict checks",
      "FIC cross-referencing",
      "Priority support",
      "Team access (up to 10 users)",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For national firms and banks with high-volume needs.",
    cta: "Talk to sales",
    href: "mailto:hello@titlechain.co.za",
    features: [
      "Unlimited verifications",
      "Custom risk models",
      "Dedicated account manager",
      "SLA guarantees",
      "API access",
      "SSO & advanced security",
      "Custom integrations",
      "24/7 premium support",
    ],
  },
];

export function Pricing() {
  return (
    <section
      className="relative flex min-h-[650px] max-w-screen scroll-mt-24 items-center justify-center overflow-hidden border-y border-dashed border-white/[0.06] bg-[#03040a] py-24 md:py-32"
      id="pricing"
    >
      {/* Ambient lighting (matches Hero background) */}
      <div
        className="absolute top-0 left-0 -z-10 h-screen w-[200vw] -translate-x-[25%] translate-y-8 rotate-25 overflow-hidden blur-3xl md:w-full animate-lighting"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 390px 50px at 10% 30%, rgba(101, 115, 255, 0.18) 0%, rgba(101, 115, 255, 0) 70%), radial-gradient(ellipse 900px 150px at 20% 42%, rgba(16, 185, 129, 0.07) 0%, rgba(16, 185, 129, 0) 70%), radial-gradient(ellipse 1000px 180px at 48% 32%, rgba(205, 221, 255, 0.06) 0%, rgba(205, 221, 255, 0) 70%)",
          backgroundPosition: "0% 0%",
        }}
        aria-hidden="true"
      />

      <div className="container flex w-full flex-col items-center justify-center gap-10">
        <div className="max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300/70">
            Pricing
          </p>
          <h2 className="font-display mt-4 text-4xl font-medium leading-tight text-white text-pretty md:text-5xl">
            Start with the title workflow you need today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-white/45">
            Select an access path for a focused pilot, a growing operations
            team, or an enterprise title-risk program.
          </p>
        </div>

        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.035] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-colors hover:border-white/[0.14] hover:bg-white/[0.055]",
                plan.tag === "Popular" && "border-indigo-400/35 bg-indigo-500/[0.07]"
              )}
            >
              {plan.tag && (
                <span className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-indigo-500 px-3 py-1 text-xs font-medium text-white">
                  {plan.tag}
                </span>
              )}
              <div>
                <h3 className="font-display text-xl font-medium text-white">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-medium text-white">
                    {plan.price}
                  </span>
                  {plan.subtitle && (
                    <span className="text-sm text-white/40">{plan.subtitle}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-white/45">{plan.description}</p>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-indigo-400" />
                    <span className="text-sm text-white/60">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                href={plan.href}
                variant={plan.tag === "Popular" ? "primary" : "secondary"}
                className="mt-8 w-full"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
