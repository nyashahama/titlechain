import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const appRoot = join(process.cwd(), "app")

const themedFiles = [
  "globals.css",
  "_components/solar/Button.tsx",
  "_components/solar/Divider.tsx",
  "_components/solar/Orbit.tsx",
  "_components/solar/Table.tsx",
  "_components/solar/TitlechainLogo.tsx",
  "_components/solar/TitlechainMark.tsx",
  "_components/solar/landing-chrome.tsx",
  "_components/solar/ui/AnalyticsIllustration.tsx",
  "_components/solar/ui/CallToAction.tsx",
  "_components/solar/ui/FeatureDivider.tsx",
  "_components/solar/ui/Features.tsx",
  "_components/solar/ui/Footer.tsx",
  "_components/solar/ui/Hero.tsx",
  "_components/solar/ui/HeroBackground.tsx",
  "_components/solar/ui/Navbar.tsx",
  "_components/solar/ui/SolarAnalytics.tsx",
  "_components/solar/ui/StickerCard.tsx",
  "_components/solar/ui/Testimonial.tsx",
  "auth/signin/page.tsx",
]

const forbiddenLightThemePatterns: Array<[RegExp, string]> = [
  [/body\.landing/, "landing body override"],
  [/\bbg-gray-50\b/, "light page background"],
  [/\bbg-white(?!\/\[)/, "solid or fixed-opacity white surface"],
  [/\btext-gray-(?:900|800|700|600|500|400)\b/, "light-theme gray text"],
  [/\bborder-gray-(?:300|200)\b/, "light-theme gray border"],
  [/\bring-gray-200\b/, "light-theme gray ring"],
  [/\bring-black\//, "black ring intended for light surfaces"],
  [/\bshadow-black\/5\b/, "light-surface shadow"],
  [/\bfrom-white\b/, "light gradient start"],
  [/\bto-gray-100\b/, "light gradient end"],
  [/\bstroke-gray-(?:300|200)(?:\/70)?\b/, "light-theme gray stroke"],
]

describe("public dark theme", () => {
  it("does not use the previous light landing override or light-theme surface classes", () => {
    const violations = themedFiles.flatMap((relativePath) => {
      const source = readFileSync(join(appRoot, relativePath), "utf8")

      return forbiddenLightThemePatterns.flatMap(([pattern, label]) => {
        const matches = source.match(new RegExp(pattern.source, "g")) ?? []
        return matches.map((match) => `${relativePath}: ${label} (${match})`)
      })
    })

    expect(violations).toEqual([])
  })
})
