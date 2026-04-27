"use client"

import { usePathname } from "next/navigation"
import Footer from "./ui/Footer"
import { NavBar } from "./ui/Navbar"

export function LandingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === "/"

  if (!isLanding) return <>{children}</>

  return (
    <div className="bg-gray-50">
      <NavBar />
      {children}
      <Footer />
    </div>
  )
}
