"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToothMark } from "@/components/brand/ToothMark";
import { signInSchema, type SignInInput } from "../schemas";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (data: SignInInput) => {
    setSubmitting(true);
    try {
      await signIn("password", { ...data, flow });
    } catch {
      toast.error(
        flow === "signIn"
          ? "Sign in failed. Check your email and password."
          : "Sign up failed. That email may already be in use.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-sm border-border/60 shadow-xl shadow-primary/5 backdrop-blur-sm">
      <CardHeader className="items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ToothMark size={30} />
        </div>
        <div>
          <h1 className="text-lg font-semibold">
            {flow === "signIn" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {flow === "signIn"
              ? "Sign in to your Dental AI workspace"
              : "Start diagnosing and quoting with AI"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="relative flex rounded-lg bg-muted p-1 text-sm font-medium">
          {(["signIn", "signUp"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFlow(option)}
              className={`relative z-10 flex-1 rounded-md py-1.5 transition-colors ${
                flow === option ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {flow === option && (
                <motion.span
                  layoutId="auth-flow-pill"
                  className="absolute inset-0 -z-10 rounded-md bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {option === "signIn" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={flow === "signIn" ? "current-password" : "new-password"}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full transition-transform active:scale-[0.98]"
            disabled={submitting}
          >
            {flow === "signIn" ? "Sign in" : "Sign up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
