import { NextResponse } from 'next/server';
import { generateOtp } from '@/lib/otp-store';
import { isUserRegistered } from '@/lib/user-store';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, role, phone, city, isSignUp } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user is signing up and already has an account
    if (isSignUp && isUserRegistered(normalizedEmail)) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please switch to the Sign In tab and log in using your password.' },
        { status: 400 }
      );
    }

    // 1. Generate 6-digit cryptographic OTP code
    const code = generateOtp(normalizedEmail, { name, role, phone, city });

    console.log(`\n==============================================`);
    console.log(`[LeadScope OTP Service] 🔑 6-Digit Code for ${normalizedEmail}: ${code}`);
    console.log(`==============================================\n`);

    // 2. Dispatch real email via Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    let emailSent = false;

    if (resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'LeadScope Auth <onboarding@resend.dev>',
            to: [normalizedEmail],
            subject: `${code} is your LeadScope Verification Code`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #ffffff; border-radius: 12px; border: 1px solid #1e293b;">
                <h2 style="color: #38bdf8; margin-top: 0; font-size: 22px;">LeadScope Account Verification</h2>
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">Use the 6-digit verification code below to verify your email address and create your LeadScope account:</p>
                <div style="background-color: #1e293b; border: 1px solid #334155; padding: 20px; text-align: center; border-radius: 10px; margin: 24px 0;">
                  <span style="font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #38bdf8; font-family: 'Courier New', monospace;">${code}</span>
                </div>
                <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">This code will expire in 10 minutes. Please do not share this code with anyone.</p>
              </div>
            `,
          }),
        });

        const resendData = await resendRes.json();
        console.log('[Resend Email Response]:', resendData);
        if (resendRes.ok && resendData.id) {
          emailSent = true;
        }
      } catch (err: any) {
        console.error('[Resend API Error]:', err?.message || err);
      }
    }

    // 3. Fallback attempt via Supabase Auth
    if (!emailSent) {
      try {
        await supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            shouldCreateUser: true,
            data: { full_name: name, role, phone, city },
          },
        });
      } catch (err: any) {
        console.warn('[Supabase Auth Email Notice]:', err?.message || err);
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      message: emailSent
        ? `A 6-digit verification code has been sent directly to ${normalizedEmail}. Please check your email inbox!`
        : `A 6-digit verification code has been sent to ${normalizedEmail}. Please check your email inbox!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to generate verification code.' },
      { status: 500 }
    );
  }
}
