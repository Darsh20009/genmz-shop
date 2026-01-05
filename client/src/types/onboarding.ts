/**
 * Onboarding Types & Definitions
 * Defines the setup steps and progress tracking
 */

export type OnboardingStep =
  | "profile-complete"
  | "first-product"
  | "branch-setup"
  | "staff-created"
  | "first-order"
  | "payment-configured"
  | "shipping-setup";

export interface OnboardingConfig {
  id: OnboardingStep;
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: React.ReactNode;
  required: boolean;
  category: "profile" | "inventory" | "operations" | "payments";
}

export interface OnboardingProgress {
  completed: OnboardingStep[];
  currentStep: OnboardingStep | null;
  completionPercentage: number;
  isComplete: boolean;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    variant?: "primary" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  icon?: React.ReactNode;
}
