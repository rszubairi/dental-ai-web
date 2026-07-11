"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyLicense, useOutstandingBalance } from "../hooks/useBilling";

export function OutstandingBalanceCard() {
  const balance = useOutstandingBalance();
  const license = useMyLicense();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Outstanding balance</CardTitle>
        </CardHeader>
        <CardContent>
          {balance === undefined ? (
            <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="text-3xl font-semibold">
              {balance.amount.toLocaleString(undefined, { style: "currency", currency: balance.currency })}
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Per-scan license rate</CardTitle>
        </CardHeader>
        <CardContent>
          {license === undefined ? (
            <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
          ) : license ? (
            <p className="text-3xl font-semibold">
              {license.scanPrice.toLocaleString(undefined, { style: "currency", currency: license.currency })}
              <span className="ml-2 text-sm font-normal text-muted-foreground">/ scan</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No license configured yet — contact your system admin.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
