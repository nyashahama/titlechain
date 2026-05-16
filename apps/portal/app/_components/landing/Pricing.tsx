import { Button } from "@/app/_components/landing/shared/Button";

const accessRequestHref =
  "mailto:hello@titlechain.co.za?subject=TitleChain%20access%20request";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "For sole practitioners and small conveyancing firms.",
    cta: "Request access",
    href: accessRequestHref,
  },
  {
    name: "Professional",
    price: "R2,500",
    subtitle: "/month",
    tag: "Popular",
    description: "For growing firms that need advanced intelligence.",
    cta: "Start pilot",
    href: "mailto:hello@titlechain.co.za?subject=TitleChain%20professional%20pilot",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For national firms and banks with high-volume needs.",
    cta: "Talk to sales",
    href: "mailto:hello@titlechain.co.za",
  },
];

export function Pricing() {
  return (
    <section
      className="relative min-h-[540px] max-w-screen scroll-mt-24 overflow-hidden bg-[#171719] pt-[18rem] pb-32 text-white"
      id="pricing"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[8.25rem] bg-[#ededf0] opacity-100 [background-image:linear-gradient(rgba(127,132,153,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(127,132,153,0.10)_1px,transparent_1px)] [background-size:150px_90px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-0 top-0 z-0 h-[8.25rem] w-[39rem] bg-[linear-gradient(170deg,transparent_0%,transparent_49%,rgba(101,115,255,0.07)_50%,rgba(255,70,145,0.09)_100%)] [clip-path:polygon(0_100%,100%_0,100%_100%,0_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-0 top-[8.25rem] z-0 h-px w-[40rem] origin-left -rotate-[12deg] bg-indigo-400/70"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_12%_34%,rgba(255,70,145,0.10),transparent_31%),radial-gradient(circle_at_45%_32%,rgba(101,115,255,0.05),transparent_28%)]"
        aria-hidden="true"
      />

      <div className="container relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <h2 className="font-display max-w-[43rem] text-4xl font-medium leading-[1.08] text-white text-pretty md:text-5xl">
            Start building like a title team of hundreds today
            <span className="text-indigo-500">_</span>
          </h2>

          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <Button
              href="mailto:hello@titlechain.co.za?subject=Start%20building%20with%20TitleChain"
              className="h-11 px-5 text-[0.9375rem]"
            >
              Start building
            </Button>
            <Button
              href="#pricing-plans"
              variant="secondary"
              className="h-11 border-indigo-500/30 bg-white/[0.04] px-5 text-[0.9375rem] hover:bg-white/[0.08]"
            >
              View pricing plans
            </Button>
          </div>
        </div>

        <div
          id="pricing-plans"
          className="mt-9 grid overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl lg:grid-cols-3 lg:divide-x lg:divide-white/[0.06]"
        >
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="relative flex min-h-[18.75rem] flex-col justify-between border-b border-dashed border-white/[0.06] p-8 last:border-b-0 lg:border-b-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl font-medium text-white/72">
                    {plan.name}
                  </h3>
                  {plan.tag && (
                    <span className="rounded-md bg-indigo-500 px-2 py-1 text-xs font-semibold text-white">
                      {plan.tag}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-end gap-1">
                  <span className="font-display text-5xl font-medium leading-none text-white">
                    {plan.price}
                  </span>
                  {plan.subtitle && (
                    <span className="pb-1 text-sm text-white/42">{plan.subtitle}</span>
                  )}
                </div>
                <p className="mt-8 max-w-sm text-sm leading-6 font-medium text-white/52">
                  {plan.description}
                </p>
              </div>

              <Button
                href={plan.href}
                variant={plan.tag === "Popular" ? "primary" : "secondary"}
                className="mt-12 w-full border-indigo-500/30"
              >
                {plan.cta}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
