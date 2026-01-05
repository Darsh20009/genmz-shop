import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { ONBOARDING_STEPS } from "@/constants/onboarding";
import type { OnboardingProgress, OnboardingStep } from "@/types/onboarding";
import { useEffect, useState } from "react";

export function useOnboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Fetch data to determine completion
  const { data: settings } = useQuery<any>({ queryKey: ["/api/settings"] });
  const { data: products } = useQuery<any[]>({ queryKey: ["/api/products"] });
  const { data: shippingCompanies } = useQuery<any[]>({ queryKey: ["/api/shipping-companies"] });

  // Fetch onboarding completion status from user profile
  const { data: completedSteps = [] } = useQuery({
    queryKey: ["onboarding", user?.id, settings, products, shippingCompanies],
    queryFn: async () => {
      if (!user?.id) return [];
      const steps: string[] = [];

      // Store Info: name exists in settings
      if (settings?.name) {
        steps.push("store-info");
      }

      // Tax and Currency: Settings have currency and taxNumber
      if (settings?.currency && settings?.taxNumber) {
        steps.push("tax-currency");
      }

      // Shipping: Shipping companies exist
      if (shippingCompanies && shippingCompanies.length > 0) {
        steps.push("shipping-setup");
      }

      // Products: At least one product exists
      if (products && products.length > 0) {
        steps.push("first-product");
      }
      
      return steps;
    },
    enabled: !!user?.id,
  });

  // Calculate progress
  const progress: OnboardingProgress = {
    completed: completedSteps as OnboardingStep[],
    currentStep: (ONBOARDING_STEPS.find(
      (step) => !completedSteps.includes(step.id as any) && step.required
    )?.id as OnboardingStep) || null,
    completionPercentage: Math.round(
      (completedSteps.length / ONBOARDING_STEPS.length) * 100
    ),
    isComplete:
      ONBOARDING_STEPS.filter((s) => s.required).every((s) =>
        completedSteps.includes(s.id as any)
      ),
  };

  // Auto-hide onboarding after 70% completion
  useEffect(() => {
    if (progress.completionPercentage >= 70) {
      setShowOnboarding(false);
    }
  }, [progress.completionPercentage]);

  // Show onboarding for new users (no completed steps)
  useEffect(() => {
    if (
      user &&
      ["admin", "employee"].includes(user.role) &&
      completedSteps.length === 0
    ) {
      setShowOnboarding(true);
    }
  }, [user, completedSteps.length]);

  const toggleOnboarding = () => setShowOnboarding(!showOnboarding);

  const markStepComplete = (step: OnboardingStep) => {
    // In real app, POST to backend
    console.log("Mark step complete:", step);
  };

  return {
    progress,
    showOnboarding,
    toggleOnboarding,
    markStepComplete,
    completedSteps,
    isStaffOnly: ["admin", "employee"].includes(user?.role || ""),
  };
}
