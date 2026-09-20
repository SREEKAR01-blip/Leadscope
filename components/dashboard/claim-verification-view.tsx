'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  BadgeCheck,
  Phone,
  KeyRound,
  Globe,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

type WizardStep = 'select' | 'otp' | 'documents' | 'domain' | 'complete';

const STEPS: { key: WizardStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'select', label: 'Select Business', icon: Building2 },
  { key: 'otp', label: 'Mobile Verification', icon: Phone },
  { key: 'documents', label: 'GST / Documents', icon: FileText },
  { key: 'domain', label: 'Domain Setup', icon: Globe },
  { key: 'complete', label: 'Verified', icon: BadgeCheck },
];

export function ClaimVerificationView() {
  const { leads, verifications, claimBusiness } = useApp();
  const unverified = leads.filter((l) => !l.website).slice(0, 6);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>('select');
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [gstUploaded, setGstUploaded] = useState(false);
  const [domainName, setDomainName] = useState('');
  const [domainVerified, setDomainVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [claimedBusiness, setClaimedBusiness] = useState<string | null>(null);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const handleStartClaim = (businessName: string) => {
    setSelectedBusiness(businessName);
    setStep('select');
    setWizardOpen(true);
    setOtpSent(false);
    setOtp(['', '', '', '']);
    setOtpVerified(false);
    setGstUploaded(false);
    setDomainName('');
    setDomainVerified(false);
  };

  const handleSendOtp = () => {
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    setOtpVerifying(true);
    setTimeout(() => {
      setOtpVerifying(false);
      setOtpVerified(true);
      setStep('documents');
    }, 400);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleFileUpload = () => {
    setGstUploaded(true);
  };

  const handleDomainVerify = () => {
    setDomainVerified(true);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const targetLead = leads.find((l) => l.name === selectedBusiness);
    claimBusiness(targetLead?.id || null, {
      name: selectedBusiness || 'My Business',
      domain: domainName,
    });
    setSubmitting(false);
    setStep('complete');
    setClaimedBusiness(selectedBusiness);
  };

  const handleCloseWizard = () => {
    setWizardOpen(false);
    setTimeout(() => {
      setStep('select');
      setSelectedBusiness(null);
    }, 300);
  };

  const canProceedFromOtp = otp.every((d) => d !== '');
  const canProceedFromDocs = gstUploaded;
  const canSubmit = otpVerified && gstUploaded && domainName.length > 0;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Claim / Verification</h1>
            <p className="text-sm text-slate-500">Claim your business listings and get verified</p>
          </div>
        </div>

        {/* Verified business banner */}
        {claimedBusiness && (
          <div className="flex items-center gap-4 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500 shadow-lg shadow-green-500/20">
              <BadgeCheck className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{claimedBusiness}</h3>
                <span className="flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  <CheckCircle className="h-3 w-3" />
                  Verified Business
                </span>
              </div>
              <p className="text-sm text-green-700">Your business is now verified. The verified seal appears next to your name across LeadScope.</p>
            </div>
          </div>
        )}

        {/* Verification status summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pending', value: verifications.filter((v) => v.status === 'pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Approved', value: verifications.filter((v) => v.status === 'approved').length + (claimedBusiness ? 1 : 0), icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Rejected', value: verifications.filter((v) => v.status === 'rejected').length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className={cn('mb-2 flex h-8 w-8 items-center justify-center rounded-lg', s.bg)}>
                  <Icon className={cn('h-4 w-4', s.color)} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Unverified businesses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Unverified Business Listings</h3>
          <div className="space-y-2">
            {unverified.map((lead) => (
              <div key={lead.id} className="flex items-center gap-4 rounded-lg border border-slate-100 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
                  {lead.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                    {claimedBusiness === lead.name && (
                      <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-600">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{lead.address}</p>
                </div>
                {claimedBusiness === lead.name ? (
                  <span className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600">
                    <CheckCircle className="h-3.5 w-3.5" /> Claimed
                  </span>
                ) : (
                  <button
                    onClick={() => handleStartClaim(lead.name)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Claim
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Verification requests */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Your Verification Requests</h3>
          <div className="space-y-2">
            {verifications.map((v) => {
              const statusConfig = {
                pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pending Review' },
                approved: { icon: BadgeCheck, color: 'text-green-500', bg: 'bg-green-50', label: 'Approved' },
                rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Rejected' },
              };
              const cfg = statusConfig[v.status];
              const StatusIcon = cfg.icon;
              return (
                <div key={v.id} className="flex items-center gap-4 rounded-lg border border-slate-100 p-3">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', cfg.bg)}>
                    <StatusIcon className={cn('h-4 w-4', cfg.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{v.business_name}</p>
                    <p className="text-xs text-slate-500">{v.category} · {v.documents_count} documents submitted</p>
                  </div>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', cfg.bg, cfg.color)}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Claim Wizard Modal */}
      {wizardOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={handleCloseWizard} />
          <div className="fixed left-1/2 top-1/2 z-50 flex h-[85vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Claim My Business</h2>
                  <p className="text-xs text-slate-500">{selectedBusiness}</p>
                </div>
              </div>
              <button onClick={handleCloseWizard} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isComplete = i < stepIndex || step === 'complete';
                const isCurrent = i === stepIndex && step !== 'complete';
                return (
                  <div key={s.key} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all',
                        isComplete ? 'border-green-500 bg-green-500 text-white' :
                        isCurrent ? 'border-blue-500 bg-blue-50 text-blue-500' :
                        'border-slate-200 bg-white text-slate-300'
                      )}>
                        {isComplete ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className={cn('text-[10px] font-medium', isComplete || isCurrent ? 'text-slate-700' : 'text-slate-300')}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn('mx-2 h-0.5 flex-1 rounded-full', i < stepIndex ? 'bg-green-500' : 'bg-slate-200')} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 1: Select */}
              {step === 'select' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-sm font-semibold text-slate-600">
                        {selectedBusiness?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{selectedBusiness}</p>
                        <p className="text-xs text-slate-500">Confirm this is your business to begin verification</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Why get verified?</p>
                        <p className="text-xs text-blue-700">Verified businesses get a green seal, higher search ranking, and can post projects on the marketplace.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: OTP */}
              {step === 'otp' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Mobile Number Verification</h3>
                    <p className="text-xs text-slate-500">We'll send a 4-digit OTP to your registered mobile number</p>
                  </div>
                  {!otpSent ? (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Mobile Number</label>
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">+91</span>
                          <input
                            type="tel"
                            defaultValue="98765 43210"
                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleSendOtp}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                      >
                        <Phone className="h-4 w-4" />
                        Send OTP
                      </button>
                    </div>
                  ) : otpVerified ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <p className="text-sm font-semibold text-green-600">Mobile number verified!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-600">Enter 4-digit OTP</label>
                        <div className="flex gap-3">
                          {otp.map((digit, i) => (
                            <input
                              key={i}
                              id={`otp-${i}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              className="h-14 w-14 rounded-xl border-2 border-slate-200 text-center text-xl font-bold text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-slate-400">OTP sent to +91 98765 43210 · <button className="text-blue-500 hover:underline">Resend</button></p>
                      </div>
                      <button
                        onClick={handleVerifyOtp}
                        disabled={!canProceedFromOtp || otpVerifying}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-40"
                      >
                        {otpVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                        {otpVerifying ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Documents */}
              {step === 'documents' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">GST / Registration Documents</h3>
                    <p className="text-xs text-slate-500">Upload your business registration documents for verification</p>
                  </div>
                  <div className="space-y-3">
                    {/* GST Certificate */}
                    <div className={cn(
                      'rounded-xl border-2 border-dashed p-5 transition-colors',
                      gstUploaded ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-blue-300'
                    )}>
                      {gstUploaded ? (
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">GST Certificate uploaded</p>
                            <p className="text-xs text-slate-500">gst_certificate.pdf · 2.4 MB</p>
                          </div>
                          <button onClick={() => setGstUploaded(false)} className="text-xs font-medium text-slate-500 hover:text-red-500">
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button onClick={handleFileUpload} className="flex w-full flex-col items-center gap-2 py-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                            <Upload className="h-5 w-5 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-600">Upload GST Certificate</p>
                          <p className="text-xs text-slate-400">PDF, JPG, or PNG · Max 5MB</p>
                        </button>
                      )}
                    </div>
                    {/* Business License */}
                    <div className="rounded-xl border-2 border-dashed border-slate-200 p-5 transition-colors hover:border-blue-300">
                      <button className="flex w-full flex-col items-center gap-2 py-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                          <Upload className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Upload Business License (Optional)</p>
                        <p className="text-xs text-slate-400">PDF, JPG, or PNG · Max 5MB</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Domain */}
              {step === 'domain' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Domain Setup</h3>
                    <p className="text-xs text-slate-500">Verify your website domain or claim a new one</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">Your Domain Name</label>
                      <div className="flex items-center gap-2">
                        <Globe className="ml-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={domainName}
                          onChange={(e) => setDomainName(e.target.value)}
                          placeholder="mybusiness.com"
                          className="flex-1 rounded-lg border border-slate-200 py-2.5 pl-2 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        {domainName && (
                          <button
                            onClick={handleDomainVerify}
                            className={cn(
                              'rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors',
                              domainVerified ? 'bg-green-100 text-green-600' : 'bg-blue-500 text-white hover:bg-blue-600'
                            )}
                          >
                            {domainVerified ? 'Verified' : 'Verify'}
                          </button>
                        )}
                      </div>
                    </div>
                    {domainVerified && (
                      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-xs text-green-700">Domain verified! DNS records confirmed.</p>
                      </div>
                    )}
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        Don't have a domain? We can help you register one during the verification process.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Complete */}
              {step === 'complete' && (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
                      <BadgeCheck className="h-12 w-12 text-green-500" />
                    </div>
                    <div className="absolute inset-0 animate-ping rounded-full bg-green-200 opacity-20" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900">Verification Complete!</h3>
                    <p className="text-sm text-slate-500">{selectedBusiness} is now a verified business on LeadScope.</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-green-500/20">
                    <CheckCircle className="h-4 w-4" />
                    Verified Business
                  </div>
                </div>
              )}
            </div>

            {/* Footer navigation */}
            {step !== 'complete' && (
              <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                <button
                  onClick={() => {
                    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].key);
                    else handleCloseWizard();
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {stepIndex === 0 ? 'Cancel' : 'Back'}
                </button>
                {step === 'select' && (
                  <button
                    onClick={() => setStep('otp')}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                  >
                    Start Verification
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {step === 'otp' && otpVerified && (
                  <button
                    onClick={() => setStep('documents')}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {step === 'documents' && (
                  <button
                    onClick={() => setStep('domain')}
                    disabled={!canProceedFromDocs}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-40"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {step === 'domain' && (
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitting}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-40"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {submitting ? 'Submitting...' : 'Submit for Verification'}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
