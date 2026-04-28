import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background aria-invalid:ring-destructive/20 aria-invalid:border-destructive hover:cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-primary/5 hover:text-primary",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",

        // ⭐ Custom premium variants
        brand: "bg-primary text-primary-foreground shadow-glow hover:bg-primary-hover transition-all duration-300",
        glass: "bg-background/30 backdrop-blur-md border border-border text-foreground shadow-sm hover:bg-background/40",
        light: "bg-white text-primary border border-primary/20 shadow-sm hover:bg-slate-50",
        rtpintar: "bg-secondary text-secondary-foreground border border-secondary hover:bg-secondary/80 shadow-md font-bold",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-12",

        // ⭐ Custom heavy size
        xl: "h-14 px-10 text-lg rounded-lg gap-3 font-semibold",
      },
      hoverEffect: {
        none: "",
        grow: "hover:scale-[1.02]",
        shrink: "hover:scale-[0.98]",
        ring: "hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:text-primary",
        lighten: "hover:brightness-110",
        darken: "hover:brightness-90",
        hover_up: "ease-out hover:-translate-y-1 hover:shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hoverEffect: "none",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  hoverEffect = "none",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, hoverEffect, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };