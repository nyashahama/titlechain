"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Footer from "./ui/Footer"
import { NavBar } from "./ui/Navbar"

export function LandingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === "/"

  useEffect(() => {
    if (isLanding) {
      document.body.classList.add("landing")
    }
    return () => {
      document.body.classList.remove("landing")
    }
  }, [isLanding])

  if (!isLanding) return <>{children}</>

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      {children}
      <Footer />
    </div>
  )
}
