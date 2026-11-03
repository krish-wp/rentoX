import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-[1.375rem] w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[5px] border border-transparent px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/85",
        brand: "bg-brand/10 text-brand [a]:hover:bg-brand/20",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-accent [a]:hover:text-muted-foreground",
        ghost:
          "text-muted-foreground hover:bg-accent hover:text-foreground",
        link: "text-brand underline-offset-4 hover:underline",
        success:
          "bg-success/12 text-success [a]:hover:bg-success/22",
        warning:
          "bg-warning/15 text-warning-foreground [a]:hover:bg-warning/25",
        info: "bg-info/12 text-info [a]:hover:bg-info/22",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
