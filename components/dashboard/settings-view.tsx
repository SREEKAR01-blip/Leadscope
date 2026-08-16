'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Key,
  Database,
  Bell,
  Moon,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { cn } from '@/lib/utils';

export function SettingsView() {
  const { settings, updateSettings, setLeads } = useApp();

  // Local form state
  const [userName, setUserName] = useState(settings.user_name);
  const [userEmail, setUserEmail] = useState(settings.user_email);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Sync local state with global
  useEffect(() => {
    setUserName(settings.user_name);
    setUserEmail(settings.user_email);
  }, [settings]);

  const handleSaveProfile = () => {
    updateSettings({ user_name: userName, user_email: userEmail });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveApiKey = () => {
    updateSettings({ api_key: apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetDatabase = () => {
    setLeads([]);
    setResetConfirm(false);
  };

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your account and application preferences</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">



          {/* Profile Section */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2.5">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Profile Information</h2>
                <p className="text-sm text-slate-500">Update your personal details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </section>



          {/* Database Section */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2.5">
                <Database className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Local Database</h2>
                <p className="text-sm text-slate-500">Reset mock data and clear local storage</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800">Reset Warning</p>
                    <p className="mt-1 text-sm text-amber-700">
                      This will reset all leads to the default Jubilee Hills mock data. Any custom leads or progress will be lost.
                    </p>
                  </div>
                </div>
              </div>

              {resetConfirm ? (
                <div className="flex items-center gap-3 rounded-lg bg-slate-100 px-4 py-3">
                  <span className="text-sm text-slate-600">Are you sure?</span>
                  <button
                    onClick={handleResetDatabase}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setResetConfirm(true)}
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Mock Data
                </button>
              )}
            </div>
          </section>

          {/* Preferences Section */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2.5">
                <Bell className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Preferences</h2>
                <p className="text-sm text-slate-500">Customize your experience</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Dark Mode</p>
                  <p className="text-sm text-slate-500">Enable dark theme (coming soon)</p>
                </div>
                <button
                  disabled
                  className="relative h-6 w-11 rounded-full bg-slate-200 opacity-50 cursor-not-allowed"
                >
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive updates about new leads</p>
                </div>
                <button
                  disabled
                  className="relative h-6 w-11 rounded-full bg-slate-200 opacity-50 cursor-not-allowed"
                >
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
                </button>
              </div>
            </div>
          </section>

          {/* Saved indicator */}
          {saved && (
            <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
              <CheckCircle className="h-4 w-4" />
              Settings saved
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
