'use client';

import { useState } from 'react';
import { Mail, Lock, User, Store, Wrench, ShieldCheck, ArrowRight, Loader2, Briefcase, MapPin } from 'lucide-react';
import { useApp, type Role } from '@/lib/app-context';
import { cn } from '@/lib/utils';
import { LogoFull } from '@/components/ui/logo';

export function AuthPage() {
  const { login, signup } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Flow control: 'auth' | 'forgot' | 'verify'
  const [flow, setFlow] = useState<'auth' | 'forgot' | 'verify'>('auth');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('freelancer');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  // Forgot password & Verification states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isSignUp && role === 'job_seeker' && (!phone || !city)) {
      setError('Phone number and current city are required for Job Seekers.');
      return;
    }

    setLoading(true);

    // Simulate network delay for a premium loading effect
    setTimeout(() => {
      try {
        if (isSignUp) {
          // Bypass email verification screen and register instantly
          signup(email, name, role, phone, city);
        } else {
          // Mock name derivation for login if not registered
          const mockName = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
          const formattedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);
          // Set role based on typical email hint or fallback to freelancer
          let detectedRole: Role = 'freelancer';
          if (email.includes('admin')) detectedRole = 'admin';
          else if (email.includes('owner') || email.includes('business')) detectedRole = 'business_owner';
          else if (email.includes('seeker') || email.includes('job')) detectedRole = 'job_seeker';
          
          login(email, formattedName, detectedRole);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during authentication.');
        setLoading(false);
      }
    }, 1200);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setError('Please enter the verification code.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      try {
        signup(email, name, role, phone, city);
      } catch (err: any) {
        setError(err.message || 'Verification failed.');
        setLoading(false);
      }
    }, 1000);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForgotStatus('A password reset link has been sent to your email.');
    }, 1000);
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
                  onClick={() => { setIsSignUp(false); setError(''); }}
                  className={cn(
                    'flex-1 py-4 text-center text-sm font-semibold transition-colors duration-200',
                    !isSignUp ? 'bg-slate-900/40 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setError(''); }}
                  className={cn(
                    'flex-1 py-4 text-center text-sm font-semibold transition-colors duration-200',
                    isSignUp ? 'bg-slate-900/40 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  Create Account
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-medium text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Name field (Sign Up only) */}
                    {isSignUp && (
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
                    )}

                    {/* Email field */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Email Address
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
                          placeholder="you@example.com"
                          className="block w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      {!isSignUp && (
                        <div className="flex justify-between items-center mt-1.5">
                          <p className="text-[11px] text-slate-500">
                            Tip: Use "seeker@corp.com" for Seeker, "owner@corp.com" for Business.
                          </p>
                          <button
                            type="button"
                            onClick={() => { setFlow('forgot'); setError(''); setForgotStatus(''); }}
                            className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Password field */}
                    <div>
                      <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Lock className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          id="password"
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="block w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Job Seeker specific fields */}
                    {isSignUp && role === 'job_seeker' && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                    {/* Role selection tiles (Sign Up only) */}
                    {isSignUp && (
                      <div className="pt-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                          Assign Account Role (Single Assignment Only)
                        </label>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {/* Freelancer Tile */}
                          <button
                            type="button"
                            onClick={() => setRole('freelancer')}
                            className={cn(
                              'flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all duration-200',
                              role === 'freelancer'
                                ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-md'
                                : 'border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            )}
                          >
                            <Wrench className="mb-2 h-5 w-5" />
                            <span className="text-xs font-bold">Freelancer</span>
                            <span className="mt-1 text-[9px] text-slate-500 leading-tight">Find local leads</span>
                          </button>

                          {/* Business Owner Tile */}
                          <button
                            type="button"
                            onClick={() => setRole('business_owner')}
                            className={cn(
                              'flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all duration-200',
                              role === 'business_owner'
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md'
                                : 'border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            )}
                          >
                            <Store className="mb-2 h-5 w-5" />
                            <span className="text-xs font-bold">Business Owner</span>
                            <span className="mt-1 text-[9px] text-slate-500 leading-tight">Claim & hire talent</span>
                          </button>

                          {/* Job Seeker Tile */}
                          <button
                            type="button"
                            onClick={() => setRole('job_seeker')}
                            className={cn(
                              'flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all duration-200',
                              role === 'job_seeker'
                                ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-md'
                                : 'border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            )}
                          >
                            <Briefcase className="mb-2 h-5 w-5" />
                            <span className="text-xs font-bold">Job Seeker</span>
                            <span className="mt-1 text-[9px] text-slate-500 leading-tight">Find local jobs</span>
                          </button>
                        </div>
                        <p className="mt-2.5 text-[10px] text-center text-slate-500 italic">
                          Note: Your role cannot be changed without signing out.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-sm font-semibold text-white transition-all hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-60 shadow-lg shadow-blue-600/20"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <>
                        <span className="mr-1">{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}

          {flow === 'forgot' && (
            <div className="p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-2">Forgot Password</h3>
              <p className="text-xs text-slate-400 mb-6">Enter your email address and we'll send you a link to reset your password.</p>
              
              <form onSubmit={handleForgot} className="space-y-4">
                {error && <div className="rounded-lg bg-red-500/10 p-3 text-xs font-medium text-red-400">{error}</div>}
                {forgotStatus && <div className="rounded-lg bg-green-500/10 p-3 text-xs font-medium text-green-400">{forgotStatus}</div>}

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
                    placeholder="you@example.com"
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
                  onClick={() => { setFlow('auth'); setError(''); }}
                  className="w-full text-center text-xs text-slate-400 hover:text-white mt-4 font-semibold"
                >
                  Back to Sign In
                </button>
              </form>
            </div>
          )}

          {flow === 'verify' && (
            <div className="p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-2">Email Verification</h3>
              <p className="text-xs text-slate-400 mb-6">
                A verification code has been sent to <span className="font-semibold text-blue-400">{email}</span>. Please enter the 4-digit code below (Tip: enter <span className="font-semibold">1234</span>).
              </p>

              <form onSubmit={handleVerify} className="space-y-4">
                {error && <div className="rounded-lg bg-red-500/10 p-3 text-xs font-medium text-red-400">{error}</div>}

                <div>
                  <label htmlFor="verifyCode" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Verification Code
                  </label>
                  <input
                    id="verifyCode"
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="1234"
                    className="block w-full text-center tracking-widest text-lg rounded-xl border border-slate-800 bg-slate-950/60 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-white" /> : 'Verify & Sign Up'}
                </button>

                <button
                  type="button"
                  onClick={() => { setFlow('auth'); setError(''); }}
                  className="w-full text-center text-xs text-slate-400 hover:text-white mt-4 font-semibold"
                >
                  Back
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
