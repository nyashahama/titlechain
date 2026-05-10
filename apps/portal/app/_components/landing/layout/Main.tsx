"use client";

import { ReactNode } from "react";
import { MainNav } from "./MainNav";
import { MainFooter } from "./MainFooter";

export function Main({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <MainNav />
      <main>{children}</main>
      <div className="container mx-auto max-w-7xl px-4">
        <MainFooter />
      </div>
    </div>
  );
}
