"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/types/api";
import { registerSchema, type RegisterFormData } from "@/lib/form-utils";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setIsSubmitting(true);
    try {
      await registerUser(data.username, data.email, data.password);
      toast.success("Account created", { description: "Verify your email to continue." });
      router.push(`/auth/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Registration failed. Please try again.");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create Account"
      description="Sign up to get started with rentoX"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary transition-colors hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {error && <div className="mb-5"><Alert variant="error">{error}</Alert></div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="johndoe"
            autoComplete="username"
            className="h-11"
            aria-invalid={!!errors.username}
            {...register("username")}
          />
          {errors.username && <p className="text-sm text-destructive" role="alert">{errors.username.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            className="h-11"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-destructive" role="alert">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            placeholder="Create a password"
            autoComplete="new-password"
            className="h-11"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && <p className="text-sm text-destructive" role="alert">{errors.password.message}</p>}
          <p className="text-xs text-muted-foreground">Must be at least 6 characters.</p>
        </div>
        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating Account…" : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
}
