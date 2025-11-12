/**
 * API Route: Verify OTP
 * 
 * Verifies the OTP code sent to user's email.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isOTPValid, deleteOTP } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    console.log(`🔍 Verify OTP request - Email: ${email}, OTP: ${otp}`);

    // Validate inputs
    if (!email || !otp) {
      console.log('❌ Missing email or OTP');
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      console.log('❌ Invalid OTP format');
      return NextResponse.json(
        { success: false, error: 'Invalid OTP format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    // Verify OTP using shared storage
    console.log(`🔍 Validating OTP for ${email}...`);
    const validation = isOTPValid(email, otp);

    if (!validation.valid) {
      console.log(`❌ OTP validation failed: ${validation.error}`);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // OTP is valid - remove from store
    deleteOTP(email);

    // TODO: Update user verification status in database
    // await updateUserVerificationStatus(email, true);

    console.log(`✅ Email verified successfully: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
