/**
 * Debug OTP Store
 * 
 * Endpoint to check what's in the OTP store.
 * Remove this in production!
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOTP } from '@/lib/otp-store';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({
      error: 'Email parameter required',
      usage: '/api/auth/debug-otp?email=test@example.com'
    });
  }

  const otpData = getOTP(email);

  return NextResponse.json({
    email,
    found: !!otpData,
    otp: otpData?.otp,
    expiresAt: otpData?.expiresAt,
    expiresIn: otpData ? Math.round((otpData.expiresAt - Date.now()) / 1000) + 's' : null,
    currentTime: Date.now(),
  });
}
