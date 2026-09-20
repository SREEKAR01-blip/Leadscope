'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Moon,
  Sun,
  Save,
  CheckCircle,
  Building2,
  Globe,
  Phone,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';
import { syncUserProfileToSupabase } from '@/lib/supabase';

export function SettingsView() {
  const { settings, updateSettings, role, user, claimBusiness } = useApp();

  // Local form state
  const [userName, setUserName] = useState(settings.user_name);
  const [userEmail, setUserEmail] = useState(settings.user_email);
  const [saved, setSaved] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);

  // Business profile state
  const [bizName, setBizName] = useState(user?.name || 'My Local Business');
  const [bizCategory, setBizCategory] = useState('Restaurant');
  const [bizPhone, setBizPhone] = useState('+91 99887 76655');
  const [bizAddress, setBizAddress] = useState('Road No. 36, Jubilee Hills');
  const [bizCity, setBizCity] = useState('Hyderabad');
  const [bizWebsite, setBizWebsite] = useState('https://mybusiness.com');

  // Sync local state with global
  useEffect(() => {
    setUserName(settings.user_name);
    setUserEmail(settings.user_email);
  }, [settings]);

  const handleSaveProfile = async () => {
    updateSettings({ user_name: userName, user_email: userEmail });

    if (userEmail) {
      await syncUserProfileToSupabase({
        email: userEmail,
        name: userName,
        role: role || 'freelancer',
      });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveBusinessProfile = async () => {
    claimBusiness(null, {
      name: bizName,
      phone: bizPhone,
      address: bizAddress,
      city: bizCity,
      domain: bizWebsite,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-full flex-col overflow-auto bg-slate-50/50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <h1 className="text-xl font-bold text-slate-900">Account & Business Settings</h1>
        <p className="text-xs text-slate-500">Manage your profile details, business settings, and app preferences</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">

          {/* User Profile Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Personal Profile Information</h2>
                <p className="text-xs text-slate-500">Update your account name and email</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="mb-1.5 block font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-500 shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  Save Profile
                </button>
              </div>
            </div>
          </section>

          {/* Business Profile Section (Visible for Business Owners) */}
          {(role === 'business_owner' || role === 'admin') && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Business Listing Details</h2>
                  <p className="text-xs text-slate-500">Manage your business address, website, and contact information</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-semibold text-slate-700">Business Name</label>
                    <input
                      type="text"
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-semibold text-slate-700">Category</label>
                    <select
                      value={bizCategory}
                      onChange={(e) => setBizCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Restaurant">Restaurant / Food</option>
                      <option value="Retail Boutique">Retail / Boutique</option>
                      <option value="Healthcare Clinic">Healthcare / Clinic</option>
                      <option value="Software Agency">IT / Software Agency</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Fitness Gym">Fitness & Gym</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-semibold text-slate-700">Contact Phone</label>
                    <input
                      type="text"
                      value={bizPhone}
                      onChange={(e) => setBizPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-semibold text-slate-700">Website URL</label>
                    <input
                      type="text"
                      value={bizWebsite}
                      onChange={(e) => setBizWebsite(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-semibold text-slate-700">Street Address</label>
                    <input
                      type="text"
                      value={bizAddress}
                      onChange={(e) => setBizAddress(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-semibold text-slate-700">City</label>
                    <input
                      type="text"
                      value={bizCity}
                      onChange={(e) => setBizCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveBusinessProfile}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-500 shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    Save Business Profile
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Preferences Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Preferences & Theme</h2>
                <p className="text-xs text-slate-500">Customize display and notifications</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Dark Mode</p>
                  <p className="text-slate-500 text-[11px]">Enable dark theme across the application dashboard</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !settings.dark_mode;
                    updateSettings({ dark_mode: nextVal });
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                  }}
                  className={cn(
                    "relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    settings.dark_mode ? "bg-blue-600" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      settings.dark_mode ? "translate-x-5" : "translate-x-0"
                    )}
                  >
                    {settings.dark_mode ? (
                      <Moon className="h-3.5 w-3.5 text-blue-600" />
                    ) : (
                      <Sun className="h-3.5 w-3.5 text-amber-500" />
                    )}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                  <p className="font-bold text-slate-900">Email Notifications</p>
                  <p className="text-slate-500 text-[11px]">Receive updates about new proposals, applicants, and escrow releases</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailNotifs(!emailNotifs)}
                  className={cn(
                    "relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    emailNotifs ? "bg-blue-600" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      emailNotifs ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Saved indicator */}
          {saved && (
            <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl">
              <CheckCircle className="h-4 w-4" />
              Settings & Profile Saved
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
