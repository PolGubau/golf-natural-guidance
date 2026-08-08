import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "~/lib/cn";

const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-[background,color,box-shadow,transform] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:pointer-events-none disabled:opacity-45 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-forest text-white shadow-[0_8px_22px_rgba(24,62,50,.18)] hover:bg-forest-light",
        accent:
          "bg-coral text-white shadow-[0_8px_22px_rgba(230,105,73,.2)] hover:bg-coral-dark",
        secondary:
          "border border-line bg-white text-ink shadow-xs hover:bg-sand",
        ghost: "text-muted hover:bg-ink/5 hover:text-ink",
        danger: "bg-red-50 text-red-700 hover:bg-red-100",
      },
      size: {
        sm: "min-h-8 rounded-lg px-3 text-xs",
        md: "min-h-10",
        lg: "min-h-12 rounded-2xl px-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
