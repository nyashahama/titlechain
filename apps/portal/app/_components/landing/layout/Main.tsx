"use client";

import { ReactNode } from "react";
import { MainNav } from "./MainNav";
import { MainFooter } from "./MainFooter";

export function Main({ children }: { children: ReactNode }) {
  return (
    <div className="titlechain-public min-h-screen bg-black text-white">
      <MainNav />
      <main>{children}</main>
      <MainFooter />
    </div>
  );
}
