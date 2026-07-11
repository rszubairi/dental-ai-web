"use client";

import { useMutation } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToothMark } from "@/components/brand/ToothMark";
import { api } from "../../../../convex/_generated/api";
import { onboardingSchema, type OnboardingInput } from "../schemas";

export function OnboardingForm() {
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { currency: "USD", country: "" },
  });

  const onSubmit = async (data: OnboardingInput) => {
    try {
      await completeOnboarding(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create organization");
    }
  };

  return (
    <Card className="w-full max-w-sm border-border/60 shadow-xl shadow-primary/5 backdrop-blur-sm">
      <CardHeader className="items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ToothMark size={30} animate={false} />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Set up your organization</h1>
          <p className="text-sm text-muted-foreground">
            One workspace for your clinics, cases, and quotations.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenantName">Organization name</Label>
            <Input id="tenantName" {...register("tenantName")} />
            {errors.tenantName && (
              <p className="text-sm text-destructive">{errors.tenantName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenantSlug">URL slug</Label>
            <Input id="tenantSlug" placeholder="acme-dental" {...register("tenantSlug")} />
            {errors.tenantSlug && (
              <p className="text-sm text-destructive">{errors.tenantSlug.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" placeholder="USD" {...register("currency")} />
            {errors.currency && (
              <p className="text-sm text-destructive">{errors.currency.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" placeholder="United States" {...register("country")} />
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full transition-transform active:scale-[0.98]"
            disabled={isSubmitting}
          >
            Create organization
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
