// Tremor Button [v0.2.0]

import { Slot } from "@radix-ui/react-slot"
import { RiLoader2Fill } from "@remixicon/react"
import React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cx, focusRing } from "../../_lib/utils"

const buttonVariants = tv({
  base: [
    // base
    "relative inline-flex items-center justify-center rounded-sm border px-3 py-2 text-center text-sm font-medium whitespace-nowrap shadow-xs transition-all duration-100 ease-in-out",
    // disabled
    "disabled:pointer-events-none disabled:shadow-none",
    // focus
    focusRing,
  ],
  variants: {
    variant: {
      primary: [
        "border-transparent",
        "text-white",
        "bg-orange-500",
        "hover:bg-orange-600",
        "disabled:bg-orange-500/40 disabled:text-white/60",
      ],
      secondary: [
        "border-border",
        "text-foreground",
        "bg-white/[0.04]",
        "hover:bg-white/[0.07]",
        "disabled:text-muted",
      ],
      light: [
        "shadow-none",
        "border-border",
        "text-foreground",
        "bg-white/[0.05]",
        "hover:bg-white/[0.08]",
        "disabled:bg-white/[0.03] disabled:text-muted",
      ],
      ghost: [
        "shadow-none",
        "border-transparent",
        "text-foreground",
        "bg-transparent hover:bg-white/[0.05]",
        "disabled:text-muted",
      ],
      destructive: [
        "text-white",
        "border-transparent",
        "bg-red-600",
        "hover:bg-red-700",
        "disabled:bg-red-600/40 disabled:text-white/60",
      ],
    },
  },
  defaultVariants: {
    variant: "primary",
  },
})

interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild,
      isLoading = false,
      loadingText,
      className,
      disabled,
      variant,
      children,
      ...props
    }: ButtonProps,
    forwardedRef,
  ) => {
    const Component = asChild ? Slot : "button"
    return (
      <Component
        ref={forwardedRef}
        className={cx(buttonVariants({ variant }), className)}
        disabled={disabled || isLoading}
        tremor-id="tremor-raw"
        {...props}
      >
        {isLoading ? (
          <span className="pointer-events-none flex shrink-0 items-center justify-center gap-1.5">
            <RiLoader2Fill
              className="size-4 shrink-0 animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">
              {loadingText ? loadingText : "Loading"}
            </span>
            {loadingText ? loadingText : children}
          </span>
        ) : (
          children
        )}
      </Component>
    )
  },
)

Button.displayName = "Button"

export { Button, buttonVariants, type ButtonProps }
