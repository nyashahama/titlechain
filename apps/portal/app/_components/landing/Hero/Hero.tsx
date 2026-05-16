"use client";

import { GradientText } from "@/app/_components/landing/Fancy";
import { Button } from "@/app/_components/landing/shared/Button";
import { HeroBanner } from "./HeroBanner";
import { HeroDashboardMockup } from "./HeroDashboardMockup";
import { siteConfig } from "@/app/siteConfig";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[820px] max-w-screen flex-col items-center overflow-hidden pt-24 md:pt-28 lg:min-h-[900px]">
      <div
        className="absolute inset-0 -z-10 animate-lighting overflow-hidden blur-3xl"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 760px 260px at 50% 18%, rgba(249, 115, 22, 0.18) 0%, rgba(249, 115, 22, 0) 68%), radial-gradient(ellipse 540px 220px at 18% 22%, rgba(251, 146, 60, 0.1) 0%, rgba(251, 146, 60, 0) 72%), radial-gradient(ellipse 620px 240px at 82% 34%, rgba(253, 186, 116, 0.08) 0%, rgba(253, 186, 116, 0) 72%)",
          backgroundPosition: "0% 0%",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#101012_0%,#080809_48%,#000_100%)]"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto flex w-full flex-col items-center">
        <div className="flex w-full max-w-5xl flex-col items-center gap-4 text-center">
          <HeroBanner
            title="Clear-to-Lodge evidence pack now in pilot"
            href="#solutions"
          />

          <GradientText className="my-2 md:my-3">
            <h1 className="mx-auto max-w-5xl text-balance text-center text-5xl leading-[0.98] font-semibold tracking-normal text-pretty sm:text-6xl md:text-7xl lg:text-[5.25rem]">
              Property title intelligence, instantly<span className="text-orange-500">_</span>
            </h1>
          </GradientText>

          <p
            className="mx-auto max-w-2xl text-center text-base leading-7 font-medium text-white/60 md:text-lg"
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
