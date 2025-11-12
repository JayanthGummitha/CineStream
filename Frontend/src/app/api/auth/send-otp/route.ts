/**
 * API Route: Send OTP
 * 
 * Generates and sends OTP to user's email.
 * Called during signup or when user requests email verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { storeOTP } from '@/lib/otp-store';

/**
 * Generate a random 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP email (demo implementation)
 * In production, use a service like SendGrid, AWS SES, or Resend
 */
async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  // Demo: Just log the OTP
  console.log(`📧 OTP for ${email}: ${otp}`);
  console.log(`🔗 Verification link: http://localhost:3000/verify-email?email=${encodeURIComponent(email)}`);
  
  // In production, send actual email:
  // await sendEmail({
  //   to: email,
  //   subject: 'Your CineStream Verification Code',
  //   html: `Your verification code is: <strong>${otp}</strong>`,
  // });
  
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with 10-minute expiration using shared storage
    storeOTP(email, otp, 10);

    // Send OTP email
    const sent = await sendOTPEmail(email, otp);

    if (!sent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    console.log(`✅ OTP sent to ${email}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // In demo mode, return OTP for testing (remove in production!)
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
