"use client";

import { useState, useEffect } from "react";
import { Main } from "./layout";
import { Hero } from "./Hero";
import { Platforms } from "./Platforms";
import { LogoList } from "./LogoList";
import { Bento } from "./Bento";
import { Pullquote } from "./Pullquote";
import { AiSection } from "./AiSection";
import { CaseStudies } from "./CaseStudies";
import { Features } from "./Features";
import { Map } from "./Map";
import { Scale } from "./Scale";
import { Pricing } from "./Pricing";

export function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Main>
      <Hero />
      <Platforms />
      <LogoList className="border-b border-white/[0.06]" />

      {mounted ? (
        <>
          <Bento />
          <Pullquote
            name="Early access conveyancing lead"
            title="South African transfer workflow pilot"
          >
            The Clear-to-Lodge pack gives our team a single place to review
            source evidence, exceptions, and lodgement readiness before the
            matter moves forward.
          </Pullquote>
          <AiSection />
          <CaseStudies />
          <Features />
          <Map />
          <Scale />
          <Pricing />
        </>
      ) : (
        <div className="h-screen" aria-hidden="true" />
      )}
    </Main>
  );
}
