"use client";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/app/_lib/cn";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

const variants = {
  variant: {
    default: "bg-foreground text-background hover:opacity-80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-border bg-transparent hover:bg-white/[0.05]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-white/[0.05] hover:text-foreground text-muted",
    link: "text-primary underline-offset-4 hover:underline",
  },
  size: {
    sm: "h-8 px-3 text-[12px] rounded-full",
    md: "h-9 px-4 text-[13px] rounded-full",
    lg: "h-10 px-6 text-[14px] rounded-full",
    icon: "h-9 w-9",
  },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants.variant;
  size?: keyof typeof variants.size;
  loading?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading, disabled, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          "disabled:opacity-50 disabled:pointer-events-none select-none",
          variants.variant[variant],
          variants.size[size],
          className
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";
