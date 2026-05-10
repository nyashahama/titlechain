import { siteConfig } from "@/app/siteConfig"
import Link from "next/link"
import { Button } from "../Button"

export function CallToAction() {
  return (
    <section aria-labelledby="cta-title" className="mx-auto max-w-6xl">
      <div className="grid items-center gap-8 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <h2
            id="cta-title"
            className="scroll-my-60 text-3xl font-semibold tracking-tighter text-balance text-foreground md:text-4xl"
          >
            Ready to accelerate your conveyancing?
          </h2>
          <p className="mt-3 mb-8 text-lg text-muted">
            Join 200+ conveyancing firms already using TitleChain for Clear-to-Lodge decisions.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild className="text-md">
              <Link href={siteConfig.baseLinks.signin}>Sign in</Link>
            </Button>
            <Button asChild className="text-md" variant="secondary">
              <Link href={siteConfig.baseLinks.contact}>Talk to sales</Link>
            </Button>
          </div>
        </div>
        <div className="relative isolate rounded-xl sm:col-span-4 sm:h-full" aria-hidden>
          <svg className="absolute inset-0 h-full w-full rounded-2xl">
            <defs>
              <pattern
                id="cta-pattern"
                patternUnits="userSpaceOnUse"
                width="64"
                height="64"
              >
                {Array.from({ length: 17 }, (_, i) => {
                  const offset = i * 8
                  return (
                    <path
                      key={i}
                      d={`M${-106 + offset} 110L${22 + offset} -18`}
                      className="stroke-white/10"
                      strokeWidth="1"
                    />
                  )
                })}
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-pattern)" />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default CallToAction
