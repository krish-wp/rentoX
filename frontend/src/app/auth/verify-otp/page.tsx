"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { verifyOtp } from "@/services/auth.service";
import { getApiErrorMessage } from "@/types/api";
import { otpSchema, type OtpFormData } from "@/lib/form-utils";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRef = useRef(["", "", "", "", "", ""]);

  useEffect(() => { otpRef.current = otp; });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit, setValue, formState: { errors } } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = value;
      setValue("otp", next.join(""), { shouldValidate: true });
      return next;
    });
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }, [setValue]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpRef.current[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
      setOtp(newOtp);
      setValue("otp", pasted, { shouldValidate: true });
    }
  }, [setValue]);

  const onSubmit = useCallback(async (data: OtpFormData) => {
    if (!email) { setError("Email is required. Please go back and register again."); return; }
    setError(""); setSuccess(""); setIsSubmitting(true);
    try {
      const response = await verifyOtp({ email, otp: data.otp });
      setSuccess(response.message);
    } catch (err) {
      setError(getApiErrorMessage(err, "OTP verification failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }, [email]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => router.push("/auth/login"), 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-0">
          <CardTitle className="text-xl font-bold tracking-[-0.02em]">Verify OTP</CardTitle>
          <CardDescription>Enter the 6-digit code sent to {email || "your email"}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {!email && <Alert variant="error">Email parameter is missing. Please go back and register again.</Alert>}
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-center block">Enter Verification Code</Label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-lg"
                    aria-label={`OTP digit ${index + 1}`}
                    disabled={isSubmitting || !email}
                  />
                ))}
              </div>
              {errors.otp && <p className="text-sm text-destructive text-center">{errors.otp.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !email}>
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-live="polite"><div className="text-center"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /><p className="mt-4 text-sm text-muted-foreground">Loading...</p></div></div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}
