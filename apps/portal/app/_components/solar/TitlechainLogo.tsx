import type { SVGProps } from "react"

export const TitlechainLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 184 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <rect x="0" y="0" width="42" height="42" fill="transparent" />
    <rect
      x="8.5"
      y="10.5"
      width="15"
      height="19"
      rx="6.5"
      transform="rotate(-45 16 20)"
      fill="none"
      stroke="#F97316"
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
      stroke="#FDBA74"
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
    <text
      x="50"
      y="26"
      fill="#0f172a"
      fontSize="18.5"
      fontWeight="700"
      letterSpacing="-0.04em"
      style={{ fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif" }}
    >
      Title
    </text>
    <text
      x="104"
      y="26"
      fill="#f97316"
      fontSize="18.5"
      fontWeight="600"
      letterSpacing="-0.04em"
      style={{ fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif" }}
    >
      chain
    </text>
  </svg>
)
