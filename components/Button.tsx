import * as React from "react";
import { cn } from "@/lib/cn";

type Kind = "primary" | "secondary" | "sienna" | "ghost" | "quiet" | "danger";
type Size = "sm" | "md" | "lg";

const KIND: Record<Kind, string> = {
  primary: "bg-ink text-paper border border-ink hover:bg-black",
  secondary: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper",
  sienna: "bg-sienna text-white border border-sienna hover:bg-ochre hover:border-ochre",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-border-soft",
  quiet: "bg-border-soft text-ink border border-border hover:bg-border",
  danger: "bg-transparent text-red-700 border border-red-300 hover:bg-red-50",
};
// min-h floors keep every button a comfortable touch target on mobile
// (36 / 40 / 44 — the latter meets the 44px Apple HIG guideline) while the
// padding still governs the resting look on desktop.
const SIZE: Record<Size, string> = {
  sm: "px-3 py-1.5 min-h-[36px] text-[12.5px] rounded-md",
  md: "px-4 py-2 min-h-[40px] text-[13.5px] rounded-[7px]",
  lg: "px-5 py-3 min-h-[44px] text-[14.5px] rounded-lg",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: Kind;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { kind = "primary", size = "md", className, children, ...rest }, ref,
) {
  return (
    <button
      ref={ref}
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed",
        KIND[kind], SIZE[size], className,
      )}
    >
      {children}
    </button>
  );
});
