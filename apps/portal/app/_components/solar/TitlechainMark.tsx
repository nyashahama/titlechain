import { useId } from "react"
import type { SVGProps } from "react"

export const TitlechainMark = (props: SVGProps<SVGSVGElement>) => {
  const gradientId = useId()

  return (
    <svg
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="9"
          y1="10"
          x2="33"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FDBA74" />
          <stop offset="0.55" stopColor="#F97316" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <rect
        x="8.5"
        y="10.5"
        width="15"
        height="19"
        rx="6.5"
        transform="rotate(-45 16 20)"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="3.2"
      />
      <rect
        x="18.5"
        y="10.5"
        width="15"
        height="19"
        rx="6.5"
        transform="rotate(-45 26 20)"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="3.2"
      />
      <path
        d="M21 12.5V29.5"
        stroke="#0f172a"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M16.1 20H25.9"
        stroke="#0f172a"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
