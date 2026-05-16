"use client";

import { Button } from "@/app/_components/landing/shared/Button";
import { HeroBanner } from "./HeroBanner";
import { HeroDashboardMockup } from "./HeroDashboardMockup";
import { siteConfig } from "@/app/siteConfig";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[820px] w-full max-w-screen flex-col items-center overflow-hidden pt-24 md:pt-28 lg:min-h-[900px]">
      <div
        className="absolute left-1/2 top-0 bottom-0 -z-30 w-screen -translate-x-1/2 bg-[linear-gradient(180deg,#171721_0%,#0b0d18_48%,#03040a_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-0 -z-20 h-[680px] w-[min(1400px,120vw)] -translate-x-1/2 bg-[conic-gradient(from_226deg_at_50%_0%,transparent_0deg,rgba(101,115,255,0.18)_30deg,rgba(205,221,255,0.08)_42deg,transparent_70deg)] opacity-90"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-0 bottom-0 -z-20 w-screen -translate-x-1/2 opacity-80 [background-image:linear-gradient(rgba(205,221,255,0.075)_1px,transparent_1px),linear-gradient(90deg,rgba(205,221,255,0.055)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_14%,black_74%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-12 -z-10 h-[560px] w-screen -translate-x-1/2 opacity-95 [mask-image:linear-gradient(to_bottom,black_0%,black_66%,transparent_100%)]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='1440' height='560' viewBox='0 0 1440 560' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23cdd8ff' stroke-opacity='.28' stroke-width='1'%3E%3Cpath d='M-40 176C112 104 252 112 380 184S632 288 792 206 1074 90 1488 160'/%3E%3Cpath d='M-60 238C112 184 252 198 420 264S690 338 830 262 1072 164 1500 228'/%3E%3Cpath d='M-40 314C170 274 302 294 472 348S744 406 902 342 1162 258 1498 304'/%3E%3Cpath d='M76 92 206 486M312 86 404 512M588 94 650 520M878 84 926 506M1126 90 1214 524'/%3E%3C/g%3E%3Cg fill='%236573ff' fill-opacity='.48'%3E%3Ccircle cx='380' cy='184' r='3'/%3E%3Ccircle cx='792' cy='206' r='3'/%3E%3Ccircle cx='902' cy='342' r='3'/%3E%3C/g%3E%3C/svg%3E\"), linear-gradient(180deg,rgba(101,115,255,0.22),rgba(101,115,255,0.05)_42%,transparent_76%)",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
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

          <h1 className="font-display my-2 mx-auto max-w-6xl bg-linear-145 from-indigo-100 via-white to-white bg-clip-text text-balance text-center text-[3.5rem] leading-[0.92] font-semibold tracking-normal text-transparent text-pretty drop-shadow-[0_18px_54px_rgba(160,170,255,0.18)] sm:text-[4.5rem] md:my-3 md:text-[5.75rem] lg:text-[6rem] xl:text-[6.75rem]">
            Property title intelligence, instantly<span className="text-indigo-500">_</span>
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
