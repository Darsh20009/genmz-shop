/**
 * Onboarding Flow Component
 * Progressive setup flow for new users
 */

import { useOnboarding } from "@/hooks/use-onboarding";
import { useLocation } from "wouter";
import { Button } from "@/components/design";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import { ONBOARDING_STEPS, ONBOARDING_CATEGORIES } from "@/constants/onboarding";
import { cn } from "@/lib/utils";

export function OnboardingFlow() {
  const { progress, showOnboarding, toggleOnboarding } = useOnboarding();
  const [, setLocation] = useLocation();

  const isComplete = progress.isComplete || progress.completionPercentage === 100;
  if (!showOnboarding || isComplete) return null;

  const nextStep = ONBOARDING_STEPS.find(
    (s) => !progress.completed.includes(s.id) && s.required
  );

  // Group steps by category
  const categorizedSteps = ONBOARDING_STEPS.reduce(
    (acc, step) => {
      if (!acc[step.category]) {
        acc[step.category] = [];
      }
      acc[step.category].push(step);
      return acc;
    },
    {} as Record<string, typeof ONBOARDING_STEPS>
  );

  const handleNavigate = (href: string) => {
    setLocation(href);
  };

  return (
    <Dialog open={showOnboarding} onOpenChange={toggleOnboarding}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>مرحباً! دعنا نبدأ</DialogTitle>
          <DialogDescription>
            أكمل هذه الخطوات لتحضير متجرك
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                التقدم: {progress.completionPercentage}%
              </span>
              <span className="text-sm text-muted-foreground">
                {progress.completed.length} من {ONBOARDING_STEPS.length}
              </span>
            </div>
            <Progress
              value={progress.completionPercentage}
              className="h-2"
            />
          </div>

          {/* Steps by Category */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(categorizedSteps).map(([category, steps]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {ONBOARDING_CATEGORIES[category as keyof typeof ONBOARDING_CATEGORIES]}
                </h4>

                <div className="space-y-2">
                  {steps.map((step) => {
                    const isCompleted = progress.completed.includes(step.id);
                    const isCurrent = step.id === progress.currentStep;

                    return (
                      <div
                        key={step.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                          isCompleted && "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
                          isCurrent && "bg-primary/5 border-primary",
                          !isCompleted && !isCurrent && "bg-muted/30 border-muted"
                        )}
                      >
                        {/* Status Icon */}
                        <div className={cn(
                          "mt-0.5 flex-shrink-0",
                          isCompleted && "text-green-600 dark:text-green-400",
                          isCurrent && "text-primary",
                          !isCompleted && "text-muted-foreground"
                        )}>
                          {isCompleted ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-current" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {step.icon}
                            <h5 className="font-semibold text-sm">{step.title}</h5>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {step.description}
                          </p>
                        </div>

                        {/* Action */}
                        {!isCompleted && (
                          <Button
                            variant={isCurrent ? "primary" : "outline"}
                            size="sm"
                            onClick={() => handleNavigate(step.href)}
                            className="flex-shrink-0"
                          >
                            {step.cta}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={toggleOnboarding}
              className="text-xs"
            >
              إغلاق
            </Button>

            <div className="text-xs text-muted-foreground">
              {progress.isComplete && (
                <span className="text-green-600">✓ جميع الخطوات مكتملة!</span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
