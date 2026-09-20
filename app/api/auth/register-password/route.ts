import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/user-store';
import { supabase, syncUserProfileToSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, phone, city } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters long.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Register in server user store
    const registeredUser = registerUser({
      email: normalizedEmail,
      password: password.trim(),
      name: name || normalizedEmail.split('@')[0],
      role: role || 'freelancer',
      phone: phone || undefined,
      city: city || undefined,
      createdAt: new Date().toISOString(),
    });

    // 2. Sync with Supabase Auth & Profiles Table
    try {
      await supabase.auth.signUp({
        email: normalizedEmail,
        password: password.trim(),
        options: {
          data: {
            full_name: registeredUser.name,
            role: registeredUser.role,
            phone: registeredUser.phone,
            city: registeredUser.city,
          },
        },
      });

      await syncUserProfileToSupabase({
        email: normalizedEmail,
        name: registeredUser.name,
        role: registeredUser.role,
        password: password.trim(),
      });
    } catch (sbErr: any) {
      console.warn('[Supabase Auth Password Signup Notice]:', sbErr?.message || sbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        email: registeredUser.email,
        name: registeredUser.name,
        role: registeredUser.role,
        phone: registeredUser.phone,
        city: registeredUser.city,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to complete registration.' },
      { status: 500 }
    );
  }
}
