import {
  RiDropFill,
  RiNavigationFill,
  RiPieChartFill,
  RiRobot3Fill,
} from "@remixicon/react"
import { Divider } from "../Divider"
import AnalyticsIllustration from "./AnalyticsIllustration"
import { StickerCard } from "./StickerCard"

export function SolarAnalytics() {
  return (
    <section
      aria-labelledby="solar-analytics"
      className="relative mx-auto w-full max-w-6xl overflow-hidden"
    >
      <div>
        <h2
          id="solar-analytics"
          className="relative scroll-my-24 text-lg font-semibold tracking-tight text-orange-500"
        >
          TitleChain Analytics
          <div className="absolute top-1 -left-[8px] h-5 w-[3px] rounded-r-sm bg-orange-500" />
        </h2>
        <p className="mt-2 max-w-lg text-3xl font-semibold tracking-tighter text-balance text-gray-900 md:text-4xl">
          Turn property data into actionable intelligence with real-time insights
        </p>
      </div>
      <div className="*:pointer-events-none">
        <AnalyticsIllustration />
      </div>
      <Divider className="mt-0"></Divider>
      <div className="grid grid-cols-1 grid-rows-2 gap-6 md:grid-cols-4 md:grid-rows-1">
        <StickerCard
          Icon={RiNavigationFill}
          title="Deeds Verification"
          description="Real-time title deed checks against the national Deeds Office registry."
        />
        <StickerCard
          Icon={RiRobot3Fill}
          title="FIC Fraud Detection"
          description="Automated financial intelligence checks for flagged properties and parties."
        />
        <StickerCard
          Icon={RiDropFill}
          title="Bond Clearance"
          description="Active bond and interdict scans across all major financial institutions."
        />
        <StickerCard
          Icon={RiPieChartFill}
          title="Risk Analytics"
          description="Portfolio-level risk scoring with historical trends and confidence metrics."
        />
      </div>
    </section>
  )
}
