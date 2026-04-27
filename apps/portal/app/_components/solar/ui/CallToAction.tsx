import { siteConfig } from "@/app/siteConfig"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../Button"

export function CallToAction() {
  return (
    <section aria-labelledby="cta-title" className="mx-auto max-w-6xl">
      <div className="grid items-center gap-8 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <h2
            id="cta-title"
            className="scroll-my-60 text-3xl font-semibold tracking-tighter text-balance text-gray-900 md:text-4xl"
          >
            Ready to accelerate your conveyancing?
          </h2>
          <p className="mt-3 mb-8 text-lg text-gray-600">
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
        <div className="relative isolate rounded-xl sm:col-span-4 sm:h-full">
          <Image
            aria-hidden
            alt="Farm with vehicles"
            src="/images/farm-footer.webp"
            height={1000}
            width={1000}
            className="absolute inset-0 -z-10 rounded-2xl blur-xl"
          />
          <Image
            alt="Farm with vehicles"
            src="/images/farm-footer.webp"
            height={1000}
            width={1000}
            className="relative z-10 rounded-2xl"
          />
        </div>
      </div>
    </section>
  )
}

export default CallToAction
