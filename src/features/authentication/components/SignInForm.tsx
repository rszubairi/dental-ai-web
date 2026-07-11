"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToothMark } from "@/components/brand/ToothMark";
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from "../schemas";

const CONTACT_TIMES = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "anytime", label: "Anytime" },
] as const;

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  const signInForm = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });
  const signUpForm = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { preferredContactTime: "anytime" },
  });

  const onSignIn = async (data: SignInInput) => {
    setSubmitting(true);
    try {
      await signIn("password", { ...data, flow: "signIn" });
    } catch {
      toast.error("Sign in failed. Check your email and password.");
    } finally {
      setSubmitting(false);
    }
  };

  const onSignUp = async (data: SignUpInput) => {
    setSubmitting(true);
    try {
      await signIn("password", { ...data, flow: "signUp" });
    } catch (err) {
      toast.error(
        err instanceof Error && err.message.includes("company email")
          ? err.message
          : "Sign up failed. That email may already be in use.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ToothMark size={24} />
        </div>
        <span className="text-lg font-bold tracking-tight">Dental AI</span>
      </div>

      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold">
          {flow === "signIn" ? "Welcome back" : "Register your organization"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {flow === "signIn"
            ? "Sign in to your Dental AI workspace"
            : "Tell us about your clinic and we'll set up your workspace"}
        </p>
      </div>

      <div className="relative mb-6 flex rounded-lg bg-muted p-1 text-sm font-medium">
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

      {flow === "signIn" ? (
        <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" className="h-11" autoComplete="email" {...signInForm.register("email")} />
            {signInForm.formState.errors.email && (
              <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              className="h-11"
              autoComplete="current-password"
              {...signInForm.register("password")}
            />
            {signInForm.formState.errors.password && (
              <p className="text-sm text-destructive">{signInForm.formState.errors.password.message}</p>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-11 w-full text-base transition-transform active:scale-[0.98]"
            disabled={submitting}
          >
            Sign in
          </Button>
        </form>
      ) : (
        <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" className="h-11" autoComplete="name" {...signUpForm.register("fullName")} />
              {signUpForm.formState.errors.fullName && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" className="h-11" autoComplete="organization" {...signUpForm.register("company")} />
              {signUpForm.formState.errors.company && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.company.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Business email</Label>
            <Input
              id="signup-email"
              type="email"
              className="h-11"
              autoComplete="email"
              placeholder="you@company.com"
              {...signUpForm.register("email")}
            />
            {signUpForm.formState.errors.email && (
              <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" type="tel" className="h-11" autoComplete="tel" {...signUpForm.register("phone")} />
              {signUpForm.formState.errors.phone && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredContactTime">Best time to contact</Label>
              <select
                id="preferredContactTime"
                className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                {...signUpForm.register("preferredContactTime")}
              >
                {CONTACT_TIMES.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              className="h-11"
              autoComplete="new-password"
              {...signUpForm.register("password")}
            />
            {signUpForm.formState.errors.password && (
              <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Anything we should know before we reach out?"
              {...signUpForm.register("notes")}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full text-base transition-transform active:scale-[0.98]"
            disabled={submitting}
          >
            Sign up
          </Button>
        </form>
      )}

      <p className="mt-10 text-center text-[10px] font-bold tracking-widest text-muted-foreground/70 uppercase">
        Dental AI &middot; AI-Assisted Diagnostics Platform
      </p>
    </div>
  );
}
