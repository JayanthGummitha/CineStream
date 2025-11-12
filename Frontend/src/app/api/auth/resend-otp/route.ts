/**
 * API Route: Resend OTP
 * 
 * Resends OTP to user's email.
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
 */
async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  console.log(`📧 Resent OTP for ${email}: ${otp}`);
  console.log(`🔗 Verification link: http://localhost:3000/verify-email?email=${encodeURIComponent(email)}`);
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

    // Generate new OTP
    const otp = generateOTP();
    
    // Store OTP with 10-minute expiration using shared storage
    storeOTP(email, otp, 10);

    // Send OTP email
    const sent = await sendOTPEmail(email, otp);

    if (!sent) {
      return NextResponse.json(
        { success: false, error: 'Failed to resend OTP email' },
        { status: 500 }
      );
    }

    console.log(`✅ OTP resent to ${email}`);

    return NextResponse.json({
      success: true,
      message: 'OTP resent successfully',
      // In demo mode, return OTP for testing (remove in production!)
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error) {
    console.error('Error resending OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend OTP' },
      { status: 500 }
    );
  }
}
