import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "rose" | "dark";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gold-primary text-white hover:bg-gold-dark border border-transparent",
  outline:
    "bg-transparent text-gold-primary border-2 border-gold-primary hover:bg-gold-primary hover:text-white",
  ghost:
    "bg-transparent text-text-primary border border-border-custom hover:bg-bg-secondary",
  rose:
    "bg-rose-gold text-white border border-transparent hover:bg-gold-dark",
  dark:
    "bg-footer-bg text-footer-text border border-transparent hover:bg-gold-dark",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-8 py-3.5 text-base rounded-lg",
  icon: "p-2 rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary focus-visible:ring-offset-2",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
