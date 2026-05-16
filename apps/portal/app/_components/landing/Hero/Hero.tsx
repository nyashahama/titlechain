"use client";

import { Button } from "@/app/_components/landing/shared/Button";
import { HeroBanner } from "./HeroBanner";
import { HeroDashboardMockup } from "./HeroDashboardMockup";
import { siteConfig } from "@/app/siteConfig";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[760px] w-full max-w-screen flex-col items-center overflow-hidden pt-24 md:pt-40 lg:min-h-[880px]">
      <div
        className="absolute left-1/2 top-0 bottom-0 -z-30 w-screen -translate-x-1/2 bg-[radial-gradient(circle_at_28%_24%,rgba(101,115,255,0.18),transparent_24%),radial-gradient(circle_at_31%_43%,rgba(255,70,145,0.08),transparent_34%),linear-gradient(180deg,#171721_0%,#101119_44%,#03040a_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-0 -z-20 h-[620px] w-[min(1400px,120vw)] -translate-x-1/2 bg-[conic-gradient(from_226deg_at_50%_0%,transparent_0deg,rgba(101,115,255,0.1)_30deg,rgba(205,221,255,0.05)_42deg,transparent_70deg)] opacity-60"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-0 bottom-0 -z-20 w-screen -translate-x-1/2 opacity-25 [background-image:linear-gradient(rgba(205,221,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(205,221,255,0.045)_1px,transparent_1px)] [background-size:96px_76px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_18%,black_66%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-10 -z-10 h-[520px] w-screen -translate-x-1/2 bg-[radial-gradient(ellipse_at_48%_34%,rgba(101,115,255,0.1),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_72%)] opacity-70 [mask-image:linear-gradient(to_bottom,black_0%,black_64%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 bottom-0 -z-10 h-80 w-screen -translate-x-1/2 bg-[linear-gradient(180deg,transparent_0%,rgba(3,4,10,0.76)_36%,#03040a_100%)]"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto flex w-full flex-col items-center">
        <div className="flex w-full max-w-5xl flex-col items-center gap-4 text-center">
          <HeroBanner
            title="Clear-to-Lodge evidence pack now in pilot"
            href="#solutions"
          />

          <h1 className="font-display my-2 mx-auto max-w-[68rem] bg-linear-145 from-indigo-100 via-white to-white bg-clip-text text-balance text-center text-[3.35rem] leading-[0.98] font-medium tracking-normal text-transparent text-pretty drop-shadow-[0_18px_54px_rgba(160,170,255,0.16)] sm:text-[4.25rem] md:my-3 md:text-[4.75rem] lg:text-[5.25rem]">
            <span className="block">Property title intelligence,</span>
            <span className="block">instantly<span className="text-indigo-500">_</span></span>
          </h1>

          <p
            className="mx-auto max-w-3xl text-center text-lg leading-8 font-medium text-white/[0.72] md:text-xl md:leading-8"
            style={{
              minHeight: "calc(2.5 * 1.75rem)",
            }}
          >
            Verify titles, assess risk, and make Clear-to-Lodge decisions with
            confidence across every property in South Africa.
          </p>

          <div className="mt-4 flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
            <Button href={siteConfig.baseLinks.signin} className="w-full sm:w-fit">
              Get started
            </Button>
            <Button href={siteConfig.baseLinks.contact} variant="secondary" className="w-full sm:w-fit">
              Talk to sales
            </Button>
          </div>
        </div>

        <HeroDashboardMockup placement="below" />
      </div>
    </section>
  );
}
