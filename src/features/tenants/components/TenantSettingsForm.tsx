"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../../../convex/_generated/api";
import { tenantSettingsSchema, type TenantSettingsInput } from "../schemas";

export function TenantSettingsForm() {
  const tenant = useQuery(api.tenants.getCurrentTenant);
  const updateTenantSettings = useMutation(api.tenants.updateTenantSettings);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TenantSettingsInput>({
    resolver: zodResolver(tenantSettingsSchema),
    values: tenant ? { currency: tenant.settings.currency, country: tenant.settings.country } : undefined,
  });

  useEffect(() => {
    if (tenant) {
      reset({ currency: tenant.settings.currency, country: tenant.settings.country });
    }
  }, [tenant, reset]);

  const onSubmit = async (data: TenantSettingsInput) => {
    try {
      await updateTenantSettings(data);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save settings");
    }
  };

  if (tenant === undefined) {
    return (
      <div className="space-y-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-9 animate-pulse rounded-md bg-muted" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Organization</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Organization name</Label>
            <Input value={tenant?.name ?? ""} disabled />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" placeholder="USD" {...register("currency")} />
              {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="United States" {...register("country")} />
              {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
