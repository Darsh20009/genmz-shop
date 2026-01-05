/**
 * Empty State Component
 * Displayed when no data exists with clear CTA
 */

import { Button } from "@/components/design";
import { Link } from "wouter";
import type { EmptyStateProps } from "@/types/onboarding";

export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon */}
      {icon && (
        <div className="mb-4 rounded-full bg-muted p-3 text-muted-foreground">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>

      {/* Primary Action */}
      {action && (
        <Link href={action.href}>
          <Button variant={action.variant || "primary"} size="md">
            {action.label}
          </Button>
        </Link>
      )}

      {/* Secondary Action */}
      {secondaryAction && (
        <Link href={secondaryAction.href}>
          <Button variant="ghost" size="sm" className="mt-2">
            {secondaryAction.label}
          </Button>
        </Link>
      )}
    </div>
  );
}
