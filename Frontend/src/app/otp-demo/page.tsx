/**
 * OTP Demo Page
 * 
 * Demo page to test OTP verification flow.
 * Shows how to integrate OTP verification after login/signup.
 */

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OTPDemoPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage(`✅ OTP sent! Check console for code: ${data.otp || 'Check your email'}`);

                // Redirect to verification page after 2 seconds
                setTimeout(() => {
                    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
                }, 2000);
            } else {
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('❌ Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
            <div className="w-full max-w-md space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>OTP Verification Demo</CardTitle>
                        <CardDescription>
                            Test the email verification flow. Enter your email to receive an OTP.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || !email}
                            >
                                {isLoading ? "Sending..." : "Send Verification Code"}
                            </Button>

                            {message && (
                                <p className={`text-sm ${message.startsWith('✅') ? 'text-green-500' : 'text-red-500'}`}>
                                    {message}
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>

                <Card className="bg-muted">
                    <CardHeader>
                        <CardTitle className="text-lg">How it works</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p>1. Enter your email and click "Send Verification Code"</p>
                        <p>2. Check the browser console for the 6-digit OTP</p>
                        <p>3. You'll be redirected to the verification page</p>
                        <p>4. Enter the OTP to verify your email</p>
                        <p className="text-muted-foreground mt-4">
                            💡 In production, the OTP would be sent via email service (SendGrid, AWS SES, etc.)
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
