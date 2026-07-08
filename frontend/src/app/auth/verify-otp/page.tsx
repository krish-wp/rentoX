"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyOtp } from "@/services/auth.service";

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type OtpFormData = z.infer<typeof otpSchema>;

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const emailError = !email ? "Email parameter is missing. Please go back and register again." : "";

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) {
        value = value.slice(-1);
      }

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      setValue("otp", newOtp.join(""), { shouldValidate: true });

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    },
    [otp, setValue],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      }
    },
    [otp],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      if (pastedData.length > 0) {
        const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
        setOtp(newOtp);
        setValue("otp", pastedData, { shouldValidate: true });
      }
    },
    [setValue],
  );

  const onSubmit = useCallback(async (data: OtpFormData) => {
    if (!email) {
      setError("Email is required. Please go back and register again.");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      const response = await verifyOtp({ email, otp: data.otp });
      setSuccess(response.message);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to {email || "your email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600" role="alert">
              {emailError}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-600" role="status">
              {success}
            </div>
          )}
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
              {errors.otp && (
                <p className="text-sm text-red-500 text-center">
                  {errors.otp.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !email}
            >
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p>Loading...</p>
        </div>
      }
    >
      <VerifyOtpForm />
    </Suspense>
  );
}
