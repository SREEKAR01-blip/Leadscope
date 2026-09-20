import { NextResponse } from 'next/server';
import { verifyPasswordCredentials, getUserByEmail } from '@/lib/user-store';
import { supabase, syncUserProfileToSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. First attempt verification against server user store
    const localResult = verifyPasswordCredentials(normalizedEmail, password.trim());
    if (localResult.valid && localResult.user) {
      if (role) {
        localResult.user.role = role;
      }
      // Also sync session with Supabase if possible
      try {
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password.trim(),
        });
        await syncUserProfileToSupabase({
          email: normalizedEmail,
          name: localResult.user.name,
          role: localResult.user.role,
        });
      } catch {
        // Fallback for local session
      }

      return NextResponse.json({
        success: true,
        user: {
          email: localResult.user.email,
          name: localResult.user.name,
          role: localResult.user.role,
          phone: localResult.user.phone,
          city: localResult.user.city,
        },
      });
    }

    // 2. Try Supabase Auth password sign-in as fallback
    try {
      const { data, error: sbErr } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password.trim(),
      });

      if (!sbErr && (data?.session || data?.user)) {
        const meta = data.user?.user_metadata || {};
        const effectiveRole = role || meta.role || 'freelancer';
        const userName = meta.full_name || normalizedEmail.split('@')[0];

        await syncUserProfileToSupabase({
          email: normalizedEmail,
          name: userName,
          role: effectiveRole,
        });

        return NextResponse.json({
          success: true,
          user: {
            email: normalizedEmail,
            name: userName,
            role: effectiveRole,
            phone: meta.phone,
            city: meta.city,
          },
        });
      }
    } catch {
      // Fall through
    }

    // Return exact error message
    const existingUser = getUserByEmail(normalizedEmail);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'No account found with this email address. Please click Create Account to sign up.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Incorrect password. Please enter the correct password for your account.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
