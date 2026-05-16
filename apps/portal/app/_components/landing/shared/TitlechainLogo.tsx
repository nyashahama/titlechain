import { useId } from "react"
import type { SVGProps } from "react"

import { cx } from "@/app/_lib/utils"

export const TitlechainLogo = ({
  className,
  ...props
}: SVGProps<SVGSVGElement>) => {
  const brandGradientId = useId()
  const wordGradientId = useId()

  return (
    <svg
      viewBox="0 0 174 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={cx("text-[#eef2ff]", className)}
      {...props}
    >
      <defs>
        <linearGradient
          id={brandGradientId}
          x1="5"
          y1="10"
          x2="37"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#F8A1BA" />
          <stop offset="0.46" stopColor="#AEB7FF" />
          <stop offset="1" stopColor="#6573FF" />
        </linearGradient>
        <linearGradient
          id={wordGradientId}
          x1="87"
          y1="14"
          x2="142"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#C7D2FE" />
          <stop offset="1" stopColor="#6573FF" />
        </linearGradient>
      </defs>

      <path
        d="M17.6 12.25h-3.2C9.75 12.25 6 16 6 20.65v.7c0 4.65 3.75 8.4 8.4 8.4h7"
        stroke={`url(#${brandGradientId})`}
        strokeWidth="4.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.4 29.75h3.2c4.65 0 8.4-3.75 8.4-8.4v-.7c0-4.65-3.75-8.4-8.4-8.4h-7"
        stroke={`url(#${brandGradientId})`}
        strokeWidth="4.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 14.85v12.3"
        stroke="currentColor"
        strokeWidth="3.3"
        strokeLinecap="round"
      />
      <path
        d="M14.85 21h12.3"
        stroke="currentColor"
        strokeWidth="3.3"
        strokeLinecap="round"
      />

      <text
        x="49"
        y="28"
        fill="currentColor"
        fontSize="22"
        fontWeight="700"
        letterSpacing="0"
        style={{
          fontFamily:
            "var(--font-aeonik-pro), Aeonik Pro, Inter, ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <tspan>title</tspan>
        <tspan fill={`url(#${wordGradientId})`}>chain</tspan>
      </text>
    </svg>
  )
}
