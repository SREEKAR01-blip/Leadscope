import { NextResponse } from 'next/server';
import { verifyStoredOtp } from '@/lib/otp-store';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token } = body;

    if (!email || !token) {
      return NextResponse.json({ error: 'Email and 6-digit verification code are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. First attempt strict in-app OTP verification
    const storedResult = verifyStoredOtp(normalizedEmail, token.trim());

    if (storedResult.valid && storedResult.record) {
      // Also register or sync with Supabase session if needed
      try {
        await supabase.auth.verifyOtp({
          email: normalizedEmail,
          token: token.trim(),
          type: 'email',
        });
      } catch {
        // Fallback for Supabase session sync
      }

      return NextResponse.json({
        success: true,
        user: {
          email: normalizedEmail,
          name: storedResult.record.name || normalizedEmail.split('@')[0],
          role: storedResult.record.role || 'freelancer',
          phone: storedResult.record.phone,
          city: storedResult.record.city,
        },
      });
    }

    // 2. Fallback attempt directly via Supabase Auth verifyOtp
    try {
      const { data, error: sbErr } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: token.trim(),
        type: 'email',
      });

      if (!sbErr && (data?.session || data?.user)) {
        const meta = data.user?.user_metadata || {};
        return NextResponse.json({
          success: true,
          user: {
            email: normalizedEmail,
            name: meta.full_name || normalizedEmail.split('@')[0],
            role: meta.role || 'freelancer',
            phone: meta.phone,
            city: meta.city,
          },
        });
      }
    } catch {
      // Ignore
    }

    // If neither matched, return strict validation error!
    return NextResponse.json(
      { error: storedResult.error || 'Invalid or expired verification code. Please check your email and enter the exact 6-digit code.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
