/**
 * Email Verification Page
 * 
 * Page for users to verify their email address using OTP.
 * Shown after signup or when email verification is required.
 */

'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OTPForm } from "@/components/otp-form";
import { motion } from "framer-motion";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isVerified, setIsVerified] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const handleSubmit = async (otp: string) => {
    setIsLoading(true);
    setError("");

    try {
      // Call your verification API
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Verification successful
        setIsVerified(true);
        
        // Show redirecting state after 1 second
        setTimeout(() => {
          setIsRedirecting(true);
          
          // Redirect to home after another second
          setTimeout(() => {
            router.push('/');
          }, 1000);
        }, 1000);
      } else {
        // Show error
        setError(data.error || 'Invalid verification code. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      // Call your resend OTP API
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setError(""); // Clear any previous errors
        
        // Log OTP in development
        if (process.env.NODE_ENV === 'development' && data.otp) {
        }
      } else {
        setError(data.error || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('Failed to resend code. Please try again.');
    }
  };

  if (!email) {
    return null; // Will redirect
  }

  // Show success overlay when verified
  if (isVerified || isRedirecting) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          {isRedirecting ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
              </motion.div>
              <h2 className="text-2xl font-bold text-white">Redirecting...</h2>
              <p className="text-gray-400">Taking you to your dashboard</p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex justify-center"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-white">Verified!</h2>
              <p className="text-gray-400">Email verified successfully</p>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-xs">
        <OTPForm 
          email={email}
          onSubmit={handleSubmit}
          onResend={handleResend}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
