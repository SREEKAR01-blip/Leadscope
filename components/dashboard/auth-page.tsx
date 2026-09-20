'use client';

import { useState } from 'react';
import { Mail, Lock, User, Store, Wrench, ArrowRight, Loader2, Briefcase, MapPin, CheckCircle2, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { useApp, type Role } from '@/lib/app-context';
import { cn } from '@/lib/utils';
import { LogoFull } from '@/components/ui/logo';
import { supabase, syncUserProfileToSupabase } from '@/lib/supabase';

export function AuthPage() {
  const { login, signup } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Flow control: 'auth' (Sign In or Sign Up) | 'forgot' (Password reset)
  const [flow, setFlow] = useState<'auth' | 'forgot'>('auth');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('freelancer');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  // Forgot password & status states
  const [forgotEmail, setForgotEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  /**
   * User Login with Email, Password & Role
   */
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');

    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with backend API
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error || !data.user) {
        // Fallback check against client-side persistent account store
        const normalized = email.trim().toLowerCase();
        try {
          const localAccounts = JSON.parse(localStorage.getItem('leadscope_registered_accounts') || '{}');
          const localUser = localAccounts[normalized];
          if (localUser) {
            if (localUser.password === password.trim()) {
              syncUserProfileToSupabase({
                email: localUser.email,
                name: localUser.name,
                role: role,
                password: password.trim(),
              });
              login(localUser.email, localUser.name, role);
              return;
            } else {
              setError('Incorrect password. Please enter the correct password for your account.');
              setLoading(false);
              return;
            }
          }
        } catch (e) {}

        setError(data.error || 'Invalid email or password. Please try again.');
        setLoading(false);
        return;
      }

      // Save to client-side persistent accounts store
      try {
        const localAccounts = JSON.parse(localStorage.getItem('leadscope_registered_accounts') || '{}');
        localAccounts[email.trim().toLowerCase()] = {
          email: email.trim().toLowerCase(),
          name: data.user.name || email.split('@')[0],
          password: password.trim(),
          role,
        };
        localStorage.setItem('leadscope_registered_accounts', JSON.stringify(localAccounts));
      } catch (e) {}

      // 2. Sync with Supabase Auth & Profiles table
      try {
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        await syncUserProfileToSupabase({
          email: email.trim(),
          name: data.user.name || email.split('@')[0],
          role: role,
          password: password.trim(),
        });
      } catch (sbErr) {
        console.warn('Supabase Login Sync Notice:', sbErr);
      }

      // 3. Login user into app context
      const userObj = data.user;
      login(userObj.email, userObj.name || email.split('@')[0], role);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Direct User Sign Up with Name, Email, Password & Role (No OTP code required!)
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please create a password for your account.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (role === 'job_seeker' && (!phone || !city)) {
      setError('Phone number and current city are required for Job Seekers.');
      return;
    }

    setLoading(true);

    try {
      // Save directly to persistent browser account store
      try {
        const localAccounts = JSON.parse(localStorage.getItem('leadscope_registered_accounts') || '{}');
        localAccounts[email.trim().toLowerCase()] = {
          email: email.trim().toLowerCase(),
          name: name.trim(),
          password: password.trim(),
          role,
          phone: phone || '',
          city: city || '',
        };
        localStorage.setItem('leadscope_registered_accounts', JSON.stringify(localAccounts));
      } catch (e) {}

      // 1. Register with backend API
      const res = await fetch('/api/auth/register-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          name: name.trim(),
          role,
          phone: phone || undefined,
          city: city || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error || !data.user) {
        // If API fails but local store saved it, proceed to log in
        signup(email.trim(), name.trim(), role, phone, city);
        return;
      }

      // 2. Sync with Supabase Auth & Profiles table
      try {
        await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              full_name: name.trim(),
              role: role,
              phone: phone || undefined,
              city: city || undefined,
            },
          },
        });
        await syncUserProfileToSupabase({
          email: email.trim(),
          name: name.trim(),
          role,
          password: password.trim(),
        });
      } catch (sbErr) {
        console.warn('Supabase Signup Sync Notice:', sbErr);
      }

      // 3. Complete registration and log user in directly
      signup(email.trim(), name.trim(), role, phone, city);
    } catch (err: any) {
      // Local fallback sign up
      signup(email.trim(), name.trim(), role, phone, city);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Password Reset Request
   */
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(forgotEmail);
      if (resetErr) {
        setError(resetErr.message);
      } else {
        setStatusMessage('A password reset link has been sent to your email address.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Decorative background glows */}
      <div className="absolute -left-1/4 -top-1/4 h-[70vw] w-[70vw] rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-500/0 opacity-60 blur-3xl" />
      <div className="absolute -right-1/4 -bottom-1/4 h-[70vw] w-[70vw] rounded-full bg-gradient-to-tr from-emerald-600/20 to-teal-500/0 opacity-60 blur-3xl" />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 w-full max-w-lg space-y-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <LogoFull size={64} dark={true} showSubtext={true} />
          <p className="mt-4 text-sm text-slate-400">
            Identify local business gaps and unlock new growth opportunities.
          </p>
        </div>

        {/* Auth Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur-xl">
          
          {flow === 'auth' && (
            <>
              {/* Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-950/40">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setError(''); setStatusMessage(''); }}
                  className={cn(
                    'flex-1 py-4 text-center text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2',
                    !isSignUp ? 'bg-slate-900/40 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setError(''); setStatusMessage(''); }}
                  className={cn(
                    'flex-1 py-4 text-center text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2',
                    isSignUp ? 'bg-slate-900/40 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {/* Error & Status Alerts */}
                {error && (
                  <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-medium text-red-400">
                    {error}
                  </div>
                )}
                {statusMessage && (
                  <div className="mb-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-400 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                {/* Role Selection Component (Rendered for both Sign In and Sign Up) */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Select Account Role
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setRole('freelancer')}
                      className={cn(
                        'flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition-all duration-200',
                        role === 'freelancer'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-md ring-1 ring-blue-500'
                          : 'border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      )}
                    >
                      <Wrench className="mb-1.5 h-5 w-5" />
                      <span className="text-xs font-bold">Freelancer</span>
                      <span className="mt-0.5 text-[9px] text-slate-500 leading-tight">Find local leads</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('business_owner')}
                      className={cn(
                        'flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition-all duration-200',
                        role === 'business_owner'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md ring-1 ring-emerald-500'
                          : 'border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      )}
                    >
                      <Store className="mb-1.5 h-5 w-5" />
                      <span className="text-xs font-bold">Business Owner</span>
                      <span className="mt-0.5 text-[9px] text-slate-500 leading-tight">Claim & hire talent</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('job_seeker')}
                      className={cn(
                        'flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition-all duration-200',
                        role === 'job_seeker'
                          ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-md ring-1 ring-purple-500'
                          : 'border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      )}
                    >
                      <Briefcase className="mb-1.5 h-5 w-5" />
                      <span className="text-xs font-bold">Job Seeker</span>
                      <span className="mt-0.5 text-[9px] text-slate-500 leading-tight">Find local jobs</span>
                    </button>
                  </div>
                </div>

                {/* --- TAB 1: SIGN IN FORM --- */}
                {!isSignUp ? (
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    {/* Email field */}
                    <div>
                      <label htmlFor="loginEmail" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Email Address (Gmail)
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Mail className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          id="loginEmail"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@gmail.com"
                          className="block w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Password field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="loginPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setFlow('forgot')}
                          className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Lock className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          id="loginPassword"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="block w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Sign In Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 text-sm font-semibold text-white transition-all hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-60 shadow-lg shadow-blue-600/20 mt-6"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* --- TAB 2: SIGN UP FORM --- */
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {/* Full Name field */}
                    <div>
                      <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <User className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="block w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Email field */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Email Address (Gmail)
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Mail className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@gmail.com"
                          className="block w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Password field */}
                    <div>
                      <label htmlFor="signupPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Lock className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          id="signupPassword"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={4}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 4 characters"
                          className="block w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Job Seeker specific fields */}
                    {role === 'job_seeker' && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
                        <div>
                          <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            Phone Number
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 99887 76655"
                            className="block w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            Current City
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <MapPin className="h-4 w-4 text-slate-500" />
                            </div>
                            <input
                              id="city"
                              type="text"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="Hyderabad"
                              className="block w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sign Up Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 text-sm font-semibold text-white transition-all hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-60 shadow-lg shadow-blue-600/20 mt-6"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}

          {/* --- FORGOT PASSWORD FLOW --- */}
          {flow === 'forgot' && (
            <div className="p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-2">Forgot Password</h3>
              <p className="text-xs text-slate-400 mb-6">Enter your email address and we will send you a link to reset your password.</p>
              
              <form onSubmit={handleForgot} className="space-y-4">
                {error && <div className="rounded-lg bg-red-500/10 p-3 text-xs font-medium text-red-400">{error}</div>}
                {statusMessage && <div className="rounded-lg bg-emerald-500/10 p-3 text-xs font-medium text-emerald-400">{statusMessage}</div>}

                <div>
                  <label htmlFor="forgotEmail" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="forgotEmail"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-white" /> : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => { setFlow('auth'); setError(''); setStatusMessage(''); }}
                  className="w-full text-center text-xs text-slate-400 hover:text-white mt-4 font-semibold"
                >
                  Back to Sign In
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
