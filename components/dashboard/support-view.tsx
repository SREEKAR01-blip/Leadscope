'use client';

import { useState } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  Mail,
  Send,
  CheckCircle,
  HelpCircle,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const faqItems = [
  {
    question: 'How do I connect my Google Places API key?',
    answer:
      'Go to Settings > API Configuration and enter your Google Maps API key. Make sure the Places API is enabled in your Google Cloud Console.',
  },
  {
    question: 'Why are some businesses missing website data?',
    answer:
      'The Google Places Text Search API returns basic business info. For complete website data, we need to call the Place Details endpoint for each business.',
  },
  {
    question: 'How is the Digital Score calculated?',
    answer:
      'The score is based on: Website presence (35 pts), Phone number (15 pts), Rating (up to 20 pts), and Review count (up to 20 pts). Lower scores indicate higher opportunity.',
  },
  {
    question: 'Can I export my leads?',
    answer:
      'Yes! Go to the Leads CRM view and click the Export button. You can download your leads as a CSV file.',
  },
];

export function SupportView() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission - in production this would send to an API
    setTimeout(() => {
      setSubmitted(true);
      setSubject('');
      setMessage('');
      setEmail('');
      setTimeout(() => setSubmitted(false), 4000);
    }, 1000);
  };

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <h1 className="text-xl font-semibold text-slate-900">Help & Support</h1>
        <p className="text-sm text-slate-500">Get help with LeadScope and contact our team</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl">
          {/* Quick Links */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a
              href="#"
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
            >
              <div className="rounded-lg bg-blue-100 p-2.5">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 group-hover:text-blue-600">Documentation</p>
                <p className="text-sm text-slate-500">Read the guides</p>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
            </a>

            <a
              href="#"
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
            >
              <div className="rounded-lg bg-amber-100 p-2.5">
                <HelpCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 group-hover:text-blue-600">FAQ</p>
                <p className="text-sm text-slate-500">Common questions</p>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
            </a>

            <a
              href="#"
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
            >
              <div className="rounded-lg bg-green-100 p-2.5">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 group-hover:text-blue-600">Live Chat</p>
                <p className="text-sm text-slate-500">Talk to support</p>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
            </a>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2.5">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Contact Us</h2>
                  <p className="text-sm text-slate-500">We'll get back to you within 24 hours</p>
                </div>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 rounded-full bg-green-100 p-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Message Sent!</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Thank you for reaching out. We'll be in touch soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Your Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      <option value="">Select a topic...</option>
                      <option value="api">API Issues</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      placeholder="Describe your issue or question..."
                      className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                    >
                      <Send className="h-4 w-4" />
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* FAQ Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2.5">
                  <LifeBuoy className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Frequently Asked Questions</h2>
                  <p className="text-sm text-slate-500">Quick answers to common questions</p>
                </div>
              </div>

              <div className="space-y-3">
                {faqItems.map((item, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-lg border border-slate-200 transition-colors hover:border-slate-300"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="text-sm font-medium text-slate-900">{item.question}</span>
                      <span
                        className={cn(
                          'text-slate-400 transition-transform',
                          expandedFaq === i && 'rotate-180'
                        )}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M4 6L8 10L12 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                    {expandedFaq === i && (
                      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-sm text-slate-600">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </div>
              <span className="text-sm font-medium text-green-800">
                All systems operational. API response times: ~200ms
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
