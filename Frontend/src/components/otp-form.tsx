/**
 * OTP Form Component
 * 
 * Email verification form with 6-digit OTP input.
 * Used for user authentication and email verification.
 */

'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export interface OTPFormProps {
  /** Email address where OTP was sent */
  email?: string;
  /** Callback when OTP is submitted */
  onSubmit?: (otp: string) => void | Promise<void>;
  /** Callback when resend is clicked */
  onResend?: () => void | Promise<void>;
  /** Whether the form is in loading state */
  isLoading?: boolean;
  /** Error message to display */
  error?: string;
  /** Additional CSS classes */
  className?: string;
}

export function OTPForm({ 
  email,
  onSubmit,
  onResend,
  isLoading = false,
  error,
  ...props 
}: OTPFormProps) {
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      return;
    }

    if (onSubmit) {
      await onSubmit(otp);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    if (onResend) {
      await onResend();
    }
    setIsResending(false);
    setOtp(""); // Clear OTP input after resend
  };

  return (
    <Card className={props.className}>
      <CardHeader>
        <CardTitle>Enter verification code</CardTitle>
        <CardDescription>
          {email 
            ? `We sent a 6-digit code to ${email}.`
            : "We sent a 6-digit code to your email."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp">Verification code</FieldLabel>
              <InputOTP 
                maxLength={6} 
                id="otp" 
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
                required
              >
                <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription>
                Enter the 6-digit code sent to your email.
              </FieldDescription>
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </Field>
            <FieldGroup>
              <Button 
                type="submit" 
                disabled={otp.length !== 6 || isLoading}
                className="w-full"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
              <FieldDescription className="text-center">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || isLoading}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Resend"}
                </button>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
