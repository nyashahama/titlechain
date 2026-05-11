"use client";

import { GradientText } from "@/app/_components/landing/Fancy";
import { Button } from "@/app/_components/landing/shared/Button";
import { HeroBanner } from "./HeroBanner";
import { HeroDashboardMockup } from "./HeroDashboardMockup";
import { siteConfig } from "@/app/siteConfig";

export function Hero() {
  return (
    <div className="relative flex max-w-screen items-center overflow-hidden py-10 md:py-0 lg:min-h-[680px]">
      {/* Ambient lighting background */}
      <div
        className="absolute top-0 left-0 -z-10 h-screen w-[200vw] -translate-x-[25%] translate-y-8 rotate-25 overflow-hidden blur-3xl md:w-full animate-lighting"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 390px 50px at 10% 30%, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0) 70%), radial-gradient(ellipse 1100px 170px at 15% 40%, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0) 70%), radial-gradient(ellipse 1200px 180px at 30% 30%, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0) 70%)",
          backgroundPosition: "0% 0%",
        }}
        aria-hidden="true"
      />

      <div className="container relative mx-auto grid h-full grid-cols-1 place-items-center gap-16 md:grid-cols-2">
        {/* Text column */}
        <div className="animate-blur-in flex flex-col gap-4 [animation-delay:150ms] [animation-duration:1000ms] md:ml-12 lg:ml-0">
          <HeroBanner
            title="Clear-to-Lodge evidence pack now in pilot"
            href="#solutions"
          />

          <GradientText className="animate-fade-in my-2 md:my-3">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-pretty sm:text-5xl md:text-6xl lg:text-7xl">
              Property title intelligence, instantly<span className="text-orange-500">_</span>
            </h1>
          </GradientText>

          <p
            className="text-base font-medium text-white/60 md:text-lg"
            style={{
              minHeight: "calc(4.25 * 1.5rem)",
            }}
          >
            Verify titles, assess risk, and make Clear-to-Lodge decisions with
            confidence across every property in South Africa.
          </p>

          <div className="mt-4 flex flex-col gap-2 lg:flex-row">
            <Button href={siteConfig.baseLinks.signin} className="w-full lg:w-fit">
              Get started
            </Button>
            <Button href={siteConfig.baseLinks.contact} variant="secondary" className="w-full lg:w-fit">
              Talk to sales
            </Button>
          </div>
        </div>

        <HeroDashboardMockup />
      </div>
    </div>
  );
}
