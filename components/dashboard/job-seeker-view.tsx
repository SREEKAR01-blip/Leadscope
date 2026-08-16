'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Search, Briefcase, FileText, User, MessageSquare, 
  Bell, Star, MapPin, Sparkles, Plus, Trash2, ArrowRight, ShieldCheck, 
  Mail, Phone, Upload, Check, X, FileUp, Mic, Play, Pause, Grid, List,
  Loader2, Trophy, CheckCircle, AlertTriangle, Send
} from 'lucide-react';
import { useApp, type Job, type JobApplication, type SeekerProfile, type SeekerNotification, type SeekerMessage } from '@/lib/app-context';
import { cn } from '@/lib/utils';
import { INDIA_MAP_PATHS } from './india-map-paths';
import dynamic from 'next/dynamic';
import { findRegion } from '@/lib/location-data';

const InteractiveMap = dynamic(
  () => import('./interactive-map'),
  { ssr: false }
);

type SeekerTab = 'dashboard' | 'search' | 'applications' | 'profile' | 'chat';

export function JobSeekerView({ view }: { view: string }) {
  const { 
    jobs, applications, savedJobIds, seekerProfile, seekerNotifications, seekerMessages,
    applyToJob, withdrawApplication, toggleSaveJob, updateSeekerProfile, sendSeekerMessage, postJob,
    searchedLocation
  } = useApp();

  const [activeTab, setActiveTab] = useState<SeekerTab>('dashboard');

  // Sync tab with route view prop
  useEffect(() => {
    if (view === 'job-seeker-dashboard') setActiveTab('dashboard');
    else if (view === 'job-search') setActiveTab('search');
    else if (view === 'my-applications') setActiveTab('applications');
    else if (view === 'job-seeker-profile') setActiveTab('profile');
    else if (view === 'job-seeker-chat') setActiveTab('chat');
  }, [view]);

  // Selected Job Details State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyIntro, setApplyIntro] = useState('');
  const [applySalary, setApplySalary] = useState('');
  const [applyAvailability, setApplyAvailability] = useState('Immediate');
  const [applyShift, setApplyShift] = useState<'Morning Shift' | 'Evening Shift' | 'Night Shift'>('Morning Shift');
  const [applyResumeName, setApplyResumeName] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterJobType, setFilterJobType] = useState('all');
  const [filterShift, setFilterShift] = useState('all');
  const [filterExperience, setFilterExperience] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mapToggle, setMapToggle] = useState<'leaflet' | 'svg'>('leaflet');
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  // Profile Edit States
  const [newSkill, setNewSkill] = useState('');
  const [aboutEdit, setAboutEdit] = useState(seekerProfile.aboutMe);
  const [phoneEdit, setPhoneEdit] = useState(seekerProfile.phone);
  const [cityEdit, setCityEdit] = useState(seekerProfile.city);
  const [salaryEdit, setSalaryEdit] = useState(seekerProfile.preferredSalary);
  const [shiftEdit, setShiftEdit] = useState(seekerProfile.preferredShift);

  // Chat states
  const [selectedChatJobId, setSelectedChatJobId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [voiceNoteSecs, setVoiceNoteSecs] = useState(0);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Playback simulation
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Sync global search location with local filter map states
  useEffect(() => {
    if (searchedLocation && searchedLocation !== 'India') {
      setFilterLocation(searchedLocation);
      setSearchQuery(searchedLocation);
      setMapToggle('leaflet');
      const parsedRegion = findRegion(searchedLocation);
      if (parsedRegion && parsedRegion.key !== 'india') {
        setSelectedStateId(parsedRegion.key);
      }
    }
  }, [searchedLocation]);

  const [searching, setSearching] = useState(false);

  const handleJobSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setMapToggle('leaflet');
    // Check if query contains specific location names to center state details
    const parsedRegion = findRegion(query);
    if (parsedRegion) {
      setFilterLocation(parsedRegion.label);
      if (parsedRegion.key !== 'india') {
        setSelectedStateId(parsedRegion.key);
      }
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/places?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const businesses = await res.json();
        if (Array.isArray(businesses) && businesses.length > 0) {
          // Add these new real businesses dynamically into active seeker jobs
          businesses.forEach((biz) => {
            const jobTitle = biz.category === 'Restaurant' ? 'Restaurant Helper' : 
                             biz.category === 'Salon' ? 'Salon Stylist' : 
                             biz.category === 'Gym' ? 'Gym Trainer' : 
                             biz.category === 'Healthcare' ? 'Clinic Support Staff' : 'Shop Assistant';

            postJob({
              title: jobTitle,
              salary: biz.salary || `₹${Math.floor(Math.random() * 10 + 15)},000/mo`,
              shiftTiming: ['Morning Shift', 'Evening Shift', 'Night Shift'][Math.floor(Math.random() * 3)] as any,
              description: `Excellent helper vacancy at ${biz.name}. Take charge of operations support, customer welcome, and daily routines.`,
              skillsRequired: biz.category === 'Restaurant' ? ['Food Safety', 'Prep Work'] : ['Customer Care', 'Active Listening'],
              jobType: ['Full Time', 'Part Time', 'Internship'][Math.floor(Math.random() * 3)] as any,
              vacancies: Math.floor(Math.random() * 3) + 1,
              businessName: biz.name,
              location: biz.address || biz.city || 'India',
              latitude: biz.latitude,
              longitude: biz.longitude,
              businessRating: biz.rating || 4.2,
              distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`
            });
          });
        }
      }
    } catch (err) {
      console.error('[places search error]', err);
    }
    setSearching(false);
  };

  // Profile Completion Percentage
  const profileCompletion = useMemo(() => {
    let score = 0;
    if (seekerProfile.photoUrl) score += 15;
    if (seekerProfile.aboutMe) score += 15;
    if (seekerProfile.skills.length > 0) score += 20;
    if (seekerProfile.education.length > 0) score += 15;
    if (seekerProfile.experience.length > 0) score += 15;
    if (seekerProfile.resumeName) score += 20;
    return score;
  }, [seekerProfile]);

  // AI Resume Score & Suggestions
  const resumeScoreDetails = useMemo(() => {
    let score = 50;
    const suggestions: string[] = [];

    if (seekerProfile.skills.length >= 5) {
      score += 15;
    } else {
      suggestions.push('Add more skills to your profile (aim for at least 5 standard skills).');
    }

    if (seekerProfile.photoUrl) {
      score += 10;
    } else {
      suggestions.push('Upload a professional profile photo to stand out.');
    }

    if (seekerProfile.experience.length > 0) {
      score += 15;
    } else {
      suggestions.push('Add your work experience history, including part-time helpers or project roles.');
    }

    if (seekerProfile.education.length > 0) {
      score += 10;
    } else {
      suggestions.push('Add your school or university education details.');
    }

    if (seekerProfile.resumeName) {
      score += 10;
    } else {
      suggestions.push('Upload your updated resume PDF for AI scanning.');
    }

    return { score: Math.min(100, score), suggestions };
  }, [seekerProfile]);

  // Calculate job counts by state abbreviation in the pre-seeded lists
  const stateJobCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((job) => {
      // Extract state key from location e.g. "Jubilee Hills, Hyderabad" -> Telangana (tg)
      const loc = job.location.toLowerCase();
      let stateKey = '';
      if (loc.includes('hyderabad') || loc.includes('telangana')) stateKey = 'tg';
      else if (loc.includes('mumbai') || loc.includes('maharashtra') || loc.includes('pune')) stateKey = 'mh';
      else if (loc.includes('bangalore') || loc.includes('karnataka')) stateKey = 'ka';
      else if (loc.includes('delhi')) stateKey = 'dl';
      else if (loc.includes('chennai') || loc.includes('tamil nadu')) stateKey = 'tn';
      else if (loc.includes('kolkata') || loc.includes('west bengal')) stateKey = 'wb';
      else if (loc.includes('jaipur') || loc.includes('rajasthan')) stateKey = 'rj';
      
      if (stateKey) {
        counts[stateKey] = (counts[stateKey] || 0) + 1;
      }
    });
    return counts;
  }, [jobs]);

  // Handle India SVG Map Clicking
  const handleStateClick = (stateId: string, stateName: string) => {
    if (selectedStateId === stateId) {
      setSelectedStateId(null);
      setFilterLocation('');
    } else {
      setSelectedStateId(stateId);
      setFilterLocation(stateName);
      
      // Trigger a mock scan if state has 0 initial jobs
      const count = stateJobCounts[stateId] || 0;
      if (count === 0) {
        setScanning(true);
        setTimeout(async () => {
          try {
            const res = await fetch('/api/grok', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ location: stateName, category: filterCategory })
            });
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) {
                // Post these jobs to global storage via context loop
                data.forEach((job) => {
                  // We simulate posting by appending to local context jobs
                  // For mockup fallback we just use postJob
                  postJob({
                    title: job.title,
                    salary: job.salary,
                    shiftTiming: job.shiftTiming,
                    description: job.description,
                    skillsRequired: job.skillsRequired,
                    jobType: job.jobType,
                    vacancies: job.vacancies
                  });
                });
              }
            }
          } catch {}
          setScanning(false);
        }, 1500);
      }
    }
  };

  // Filter Jobs List
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !job.title.toLowerCase().includes(q) &&
          !job.businessName.toLowerCase().includes(q) &&
          !job.description.toLowerCase().includes(q) &&
          !job.location.toLowerCase().includes(q)
        ) return false;
      }

      // Location filter
      if (filterLocation) {
        const f = filterLocation.toLowerCase();
        // Check if job location matches selected state or city
        if (!job.location.toLowerCase().includes(f)) {
          // Check state aliases
          if (f === 'telangana' && !job.location.toLowerCase().includes('hyderabad')) return false;
          else if (f === 'maharashtra' && !job.location.toLowerCase().includes('mumbai') && !job.location.toLowerCase().includes('pune')) return false;
          else if (f === 'karnataka' && !job.location.toLowerCase().includes('bangalore')) return false;
          else if (f === 'tamil nadu' && !job.location.toLowerCase().includes('chennai')) return false;
          else if (f === 'west bengal' && !job.location.toLowerCase().includes('kolkata')) return false;
          else if (f === 'rajasthan' && !job.location.toLowerCase().includes('jaipur')) return false;
          else if (f !== 'telangana' && f !== 'maharashtra' && f !== 'karnataka' && f !== 'tamil nadu' && f !== 'west bengal' && f !== 'rajasthan') return false;
        }
      }

      // Category filter
      if (filterCategory !== 'all') {
        const c = filterCategory.toLowerCase();
        // Categorize title/description
        const desc = job.description.toLowerCase();
        const title = job.title.toLowerCase();
        if (c === 'restaurant' && !title.includes('helper') && !title.includes('barista') && !title.includes('cook') && !title.includes('chef') && !desc.includes('food')) return false;
        if (c === 'salon' && !title.includes('salon') && !title.includes('stylist') && !title.includes('hair')) return false;
        if (c === 'boutique' && !title.includes('boutique') && !title.includes('retail') && !title.includes('sales')) return false;
        if (c === 'gym' && !title.includes('gym') && !title.includes('fitness') && !title.includes('trainer')) return false;
        if (c === 'healthcare' && !title.includes('clinic') && !title.includes('health') && !title.includes('nurse')) return false;
      }

      // Job Type filter
      if (filterJobType !== 'all' && job.jobType !== filterJobType) return false;

      // Shift filter
      if (filterShift !== 'all' && job.shiftTiming !== filterShift) return false;

      // Experience filter
      if (filterExperience !== 'all') {
        const e = filterExperience.toLowerCase();
        const exp = (job.experienceNeeded || '').toLowerCase();
        if (e === 'freshers' && !exp.includes('no experience') && !exp.includes('0-1')) return false;
        if (e === 'experienced' && !exp.includes('1-2') && !exp.includes('2+')) return false;
      }

      return true;
    });
  }, [jobs, searchQuery, filterLocation, filterCategory, filterJobType, filterShift, filterExperience]);

  // Applications list mapped with Job details
  const myApplicationsMapped = useMemo(() => {
    return applications.map((app) => {
      const job = jobs.find((j) => j.id === app.jobId);
      return {
        ...app,
        salary: job?.salary || 'N/A',
        location: job?.location || 'N/A',
        jobType: job?.jobType || 'N/A',
        shiftTiming: job?.shiftTiming || 'N/A'
      };
    });
  }, [applications, jobs]);

  // Chat conversations matching businesses seeker applied to
  const chatConversations = useMemo(() => {
    const businessNames = Array.from(new Set(myApplicationsMapped.map((app) => app.businessName)));
    return businessNames.map((bName) => {
      // Find matching job and application
      const matchedApp = myApplicationsMapped.find((app) => app.businessName === bName);
      const lastMsg = [...seekerMessages]
        .reverse()
        .find((m) => m.businessName === bName);

      return {
        businessName: bName,
        jobId: matchedApp?.jobId || '',
        jobTitle: matchedApp?.jobTitle || '',
        lastMessageText: lastMsg ? (lastMsg.voiceNoteUrl ? '🎙️ Voice Note' : lastMsg.fileName ? `📁 ${lastMsg.fileName}` : lastMsg.text) : 'Conversation started.',
        lastMessageTime: lastMsg ? new Date(lastMsg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        appStatus: matchedApp?.status || 'Pending'
      };
    });
  }, [myApplicationsMapped, seekerMessages]);

  const activeChatMessages = useMemo(() => {
    if (!selectedChatJobId) return [];
    const job = jobs.find((j) => j.id === selectedChatJobId);
    if (!job) return [];
    return seekerMessages.filter((m) => m.businessName === job.businessName);
  }, [seekerMessages, selectedChatJobId, jobs]);

  const activeChatBizName = useMemo(() => {
    if (!selectedChatJobId) return '';
    const job = jobs.find((j) => j.id === selectedChatJobId);
    return job?.businessName || 'Business';
  }, [selectedChatJobId, jobs]);

  // Handle Submitting Apply Modal
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    
    applyToJob(
      selectedJob.id,
      applyIntro,
      applySalary || selectedJob.salary,
      applyAvailability,
      applyShift,
      applyResumeName || seekerProfile.resumeName || 'Resume.pdf'
    );
    
    setShowApplyModal(false);
    setShowSuccessBanner(true);
    
    // Clear apply states
    setApplyIntro('');
    setApplySalary('');
    setApplyAvailability('Immediate');
    
    // Reset banner after 4 seconds
    setTimeout(() => {
      setShowSuccessBanner(false);
    }, 4000);
  };

  // Profile Save Action
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSeekerProfile({
      aboutMe: aboutEdit,
      phone: phoneEdit,
      city: cityEdit,
      preferredSalary: salaryEdit,
      preferredShift: shiftEdit as any
    });
  };

  // Add Skill Action
  const handleAddSkill = () => {
    if (newSkill.trim() && !seekerProfile.skills.includes(newSkill.trim())) {
      updateSeekerProfile({
        skills: [...seekerProfile.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  // Remove Skill Action
  const handleRemoveSkill = (skillToRemove: string) => {
    updateSeekerProfile({
      skills: seekerProfile.skills.filter((s) => s !== skillToRemove)
    });
  };

  // Resume File Upload Trigger
  const handleMockResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateSeekerProfile({
        resumeName: file.name,
        resumeText: 'Simulating parsed resume text content for digital scanning score calculation. Certified in professional business assistance.'
      });
    }
  };

  // Seeder Avatar Options
  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80'
  ];

  // Send Message Action
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedChatJobId) return;
    sendSeekerMessage(selectedChatJobId, chatInput);
    setChatInput('');
  };

  // Mock File Upload Action in Chat
  const handleChatFileUpload = () => {
    if (!selectedChatJobId) return;
    sendSeekerMessage(selectedChatJobId, 'Sent an attachment', {
      fileUrl: '#',
      fileName: 'Portfolio_Certificates.pdf'
    });
  };

  // Voice Note Recording Simulator
  const toggleRecording = () => {
    if (!selectedChatJobId) return;
    if (recording) {
      // Stop and send
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      setRecording(false);
      sendSeekerMessage(selectedChatJobId, '', {
        voiceNoteUrl: '#'
      });
      setVoiceNoteSecs(0);
    } else {
      // Start recording
      setRecording(true);
      setVoiceNoteSecs(0);
      recordTimerRef.current = setInterval(() => {
        setVoiceNoteSecs((s) => s + 1);
      }, 1000);
    }
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Dynamic Success Alert Banner */}
      {showSuccessBanner && (
        <div className="absolute left-6 right-6 top-24 z-[1000] flex items-center justify-between gap-3 rounded-2xl border border-green-500/30 bg-green-50/95 p-4 shadow-xl backdrop-blur animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-500 text-white">
              <CheckCircle className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Application Submitted Successfully</p>
              <p className="text-xs text-slate-600">The business has been notified. You can now chat with them in the Chat tab.</p>
            </div>
          </div>
          <button onClick={() => setShowSuccessBanner(false)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex flex-1 min-h-0">
        {/* Render Tab Contents */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Header Greeting */}
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Welcome Back, {seekerProfile.name}</h1>
                <p className="text-xs text-slate-500">Your local employment launchpad is fully loaded.</p>
              </div>
              <div className="text-xs text-slate-400 font-semibold bg-slate-100 rounded-full px-3 py-1.5 self-start">
                Location: <span className="text-slate-700">{seekerProfile.city}</span>
              </div>
            </div>

            {/* Welcome Card & circular completion */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Profile Card */}
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between relative overflow-hidden shadow-sm">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-purple-500/5 blur-3xl -z-10" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    {seekerProfile.photoUrl ? (
                      <img src={seekerProfile.photoUrl} alt="Avatar" className="h-full w-full rounded-full object-cover ring-2 ring-purple-100" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-lg font-bold text-white shadow-inner">
                        {seekerProfile.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{seekerProfile.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{seekerProfile.phone} · {seekerProfile.email}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {seekerProfile.skills.slice(0, 3).map((s) => (
                        <span key={s} className="bg-slate-100 text-[10px] font-semibold text-slate-600 rounded-full px-2 py-0.5">{s}</span>
                      ))}
                      {seekerProfile.skills.length > 3 && (
                        <span className="bg-slate-100 text-[10px] font-semibold text-slate-400 rounded-full px-2 py-0.5">+{seekerProfile.skills.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Circular completeness progress */}
                <div className="border-t border-slate-100 mt-5 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Ring SVGs */}
                    <div className="relative h-12 w-12 flex-shrink-0 flex items-center justify-center">
                      <svg className="h-full w-full rotate-[-90deg]">
                        <circle cx="24" cy="24" r="20" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                        <circle cx="24" cy="24" r="20" fill="transparent" stroke="url(#purpleGrad)" strokeWidth="4" strokeDasharray={2 * Math.PI * 20} strokeDashoffset={2 * Math.PI * 20 * (1 - profileCompletion / 100)} strokeLinecap="round" />
                        <defs>
                          <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="absolute text-[10px] font-bold text-slate-700">{profileCompletion}%</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Profile Completeness</p>
                      <p className="text-[10px] text-slate-400">Complete profile to boost resume score</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('profile')} className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                    Edit Profile <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Stats Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Summary Counters</h3>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-purple-600">{applications.length}</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">Submitted Apps</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-purple-600">{savedJobIds.length}</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">Saved Jobs</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-purple-600">{applications.filter((a) => a.status === 'Interview').length}</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">Interview Requests</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-purple-600">{jobs.length}</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">Recommended Jobs</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Main Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Nearby Jobs Grid */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-purple-500" /> Nearby Jobs Posted
                  </h3>
                  <button onClick={() => setActiveTab('search')} className="text-xs font-semibold text-purple-600 hover:text-purple-700">View All</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.slice(0, 4).map((job) => {
                    const isSaved = savedJobIds.includes(job.id);
                    return (
                      <div key={job.id} className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{job.title}</h4>
                              <p className="text-[11px] text-slate-500 font-semibold">{job.businessName}</p>
                            </div>
                            <div className="flex items-center gap-0.5 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {job.businessRating}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 mt-3 text-[11px] text-slate-600 border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" /> {job.location} · <span className="text-slate-400">{job.distance}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">{job.jobType}</span>
                              <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{job.shiftTiming}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs font-black text-slate-900">{job.salary}</span>
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => toggleSaveJob(job.id)}
                              className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
                                isSaved ? "bg-amber-50 border-amber-300 text-amber-500" : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                              )}
                            >
                              ★
                            </button>
                            <button 
                              onClick={() => { setSelectedJob(job); setActiveTab('search'); }}
                              className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar AI recommendation / Application list */}
              <div className="space-y-6">
                
                {/* AI recommendation panel */}
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-900 to-indigo-950 p-5 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 h-24 w-24 rounded-full bg-white/5 blur-xl" />
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-purple-300 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-200">AI Recommended Jobs</h3>
                  </div>

                  {jobs.slice(0, 1).map((job) => (
                    <div key={job.id} className="mt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold truncate max-w-[120px]">{job.title}</h4>
                        <span className="bg-purple-500/30 text-purple-300 border border-purple-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {job.matchPercentage}% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-200/80 leading-relaxed italic">
                        "Matches your preferred shifts and working categories."
                      </p>
                      <button 
                        onClick={() => { setSelectedJob(job); setActiveTab('search'); }}
                        className="w-full bg-white text-purple-900 hover:bg-slate-100 text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                      >
                        Apply Now <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Recent Applications card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Applications</h3>
                  
                  {applications.length > 0 ? (
                    <div className="space-y-3 mt-3">
                      {applications.slice(0, 3).map((app) => (
                        <div key={app.id} className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                          <div>
                            <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{app.jobTitle}</p>
                            <p className="text-[10px] text-slate-400">{app.businessName}</p>
                          </div>
                          <span className={cn(
                            "text-[9px] font-bold rounded-full px-2 py-0.5",
                            app.status === 'Accepted' ? 'bg-green-50 text-green-600' :
                            app.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                            app.status === 'Interview' ? 'bg-amber-50 text-amber-600' :
                            'bg-blue-50 text-blue-600'
                          )}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-4 text-center">No applications submitted yet.</p>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Job Search & Interactive Map */}
        {activeTab === 'search' && (
          <div className="flex-1 flex min-h-0">
            
            {/* Search filter list (left sidebar) */}
            <div className="w-64 flex-shrink-0 border-r border-slate-200 bg-white p-4 overflow-y-auto space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Filter Jobs</h3>
              
              {/* Reset filter buttons */}
              {(filterLocation || filterCategory !== 'all' || filterJobType !== 'all' || filterShift !== 'all' || filterExperience !== 'all') && (
                <button 
                  onClick={() => {
                    setFilterLocation('');
                    setFilterCategory('all');
                    setFilterJobType('all');
                    setFilterShift('all');
                    setFilterExperience('all');
                    setSelectedStateId(null);
                  }}
                  className="w-full text-left text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  Clear all filters <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Category */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Category</label>
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Restaurant">Restaurants & Cafes</option>
                  <option value="Salon">Salons & Spas</option>
                  <option value="Boutique">Boutiques & Stores</option>
                  <option value="Gym">Gyms & Fitness</option>
                  <option value="Healthcare">Healthcare Clinics</option>
                </select>
              </div>

              {/* Job Type */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Job Type</label>
                <div className="space-y-1.5 mt-1.5">
                  {['all', 'Full Time', 'Part Time', 'Internship'].map((type) => (
                    <label key={type} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input 
                        type="radio" 
                        name="jobType" 
                        checked={filterJobType === type} 
                        onChange={() => setFilterJobType(type)}
                        className="text-purple-600 focus:ring-purple-500" 
                      />
                      {type === 'all' ? 'All Types' : type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Shift */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Shift Timing</label>
                <select 
                  value={filterShift} 
                  onChange={(e) => setFilterShift(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="all">All Shifts</option>
                  <option value="Morning Shift">Morning Shift</option>
                  <option value="Evening Shift">Evening Shift</option>
                  <option value="Night Shift">Night Shift</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Experience</label>
                <select 
                  value={filterExperience} 
                  onChange={(e) => setFilterExperience(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="all">All Experience</option>
                  <option value="freshers">Freshers Welcome</option>
                  <option value="experienced">Experienced (1+ yrs)</option>
                </select>
              </div>

              {/* Distance range */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Distance</label>
                <p className="text-[11px] text-slate-400 mt-1">Within 10 km from profile city ({seekerProfile.city})</p>
              </div>

            </div>

            {/* Main results panel */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
              
              {/* Search Header Bar */}
              <div className="border-b border-slate-200 bg-white p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleJobSearch} className="relative flex-grow max-w-md flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search jobs or categories (e.g. Salon in Pune, Restaurant in Delhi)..."
                      className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !searchQuery.trim()}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Search'}
                  </button>
                </form>

                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={cn("p-1.5 rounded-md", viewMode === 'grid' ? "bg-white text-purple-600 shadow-sm" : "text-slate-400")}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={cn("p-1.5 rounded-md", viewMode === 'list' ? "bg-white text-purple-600 shadow-sm" : "text-slate-400")}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                    <button 
                      onClick={() => setMapToggle('svg')}
                      className={cn("text-xs font-semibold px-3 py-1.5 rounded-md", mapToggle === 'svg' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500")}
                    >
                      India Map
                    </button>
                    <button 
                      onClick={() => setMapToggle('leaflet')}
                      className={cn("text-xs font-semibold px-3 py-1.5 rounded-md", mapToggle === 'leaflet' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500")}
                    >
                      Listings Map
                    </button>
                  </div>
                </div>
              </div>

              {/* Body split: list and map */}
              <div className="flex-1 flex min-h-0">
                {/* Listings List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {filterLocation && (
                    <div className="flex items-center justify-between bg-purple-50 border border-purple-200/50 rounded-xl p-3 text-xs text-purple-700">
                      <span>Showing jobs in <span className="font-bold">{filterLocation}</span>.</span>
                      <button onClick={() => { setFilterLocation(''); setSelectedStateId(null); }} className="font-bold underline hover:text-purple-900">Clear Region</button>
                    </div>
                  )}

                  {filteredJobs.length > 0 ? (
                    <div className={cn(
                      viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-3"
                    )}>
                      {filteredJobs.map((job) => {
                        const isSaved = savedJobIds.includes(job.id);
                        return (
                          <div 
                            key={job.id} 
                            onClick={() => setSelectedJob(job)}
                            className={cn(
                              "cursor-pointer rounded-xl border bg-white p-4 hover:shadow-md transition-all duration-200 flex flex-col justify-between",
                              selectedJob?.id === job.id ? "border-purple-500 ring-1 ring-purple-500" : "border-slate-200"
                            )}
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600">{job.jobType}</h4>
                                  <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">{job.title}</h3>
                                  <p className="text-xs text-slate-500">{job.businessName} · <span className="text-amber-500">★ {job.businessRating}</span></p>
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
                                  className={cn("text-xs transition-colors", isSaved ? "text-amber-500" : "text-slate-300 hover:text-slate-500")}
                                >
                                  ★
                                </button>
                              </div>

                              <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{job.description}</p>
                              
                              <div className="flex flex-wrap gap-1 mt-3">
                                {job.skillsRequired.slice(0, 3).map((s) => (
                                  <span key={s} className="bg-slate-100 text-[9px] font-bold text-slate-500 rounded px-1.5 py-0.5">{s}</span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                              <span className="text-xs font-extrabold text-slate-900">{job.salary}</span>
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <MapPin className="h-3 w-3" /> {job.distance}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                      <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-600">No jobs match your criteria.</p>
                      <p className="text-xs text-slate-400 mt-1">Try resetting search filters or scanning a new city on the India Map.</p>
                    </div>
                  )}
                </div>

                {/* Map Panel (Right side) */}
                <div className="w-80 flex-shrink-0 border-l border-slate-200 bg-white flex flex-col">
                  {mapToggle === 'svg' ? (
                    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                      <div className="text-center mb-4">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">India Geographic Job Overview</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Click states to filter listings or scan for active jobs.</p>
                      </div>

                      {/* Map Box */}
                      <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 p-2 overflow-hidden min-h-[300px] relative">
                        {scanning && (
                          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-2 z-50">
                            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                            <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider animate-pulse">Scanning Grok API...</p>
                          </div>
                        )}
                        <svg viewBox="0 0 612 696" className="w-full h-full max-h-[320px]">
                          {Object.entries(INDIA_MAP_PATHS).map(([id, state]) => {
                            const isSelected = selectedStateId === id;
                            const count = stateJobCounts[id] || 0;
                            return (
                              <path
                                key={id}
                                d={state.d}
                                className={cn(
                                  "transition-all duration-200 cursor-pointer stroke-white stroke-[0.8px]",
                                  isSelected ? "fill-purple-600 hover:fill-purple-700" :
                                  count > 0 ? "fill-purple-200 hover:fill-purple-300" :
                                  "fill-slate-200 hover:fill-slate-300"
                                )}
                                onClick={() => handleStateClick(id, state.label)}
                              >
                                <title>{state.label}: {count} jobs</title>
                              </path>
                            );
                          })}
                        </svg>
                      </div>

                      {/* State list */}
                      <div className="mt-4 space-y-2">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">State distribution</h5>
                        <div className="max-h-36 overflow-y-auto space-y-1">
                          {Object.entries(INDIA_MAP_PATHS).map(([id, state]) => {
                            const count = stateJobCounts[id] || 0;
                            if (count === 0) return null;
                            return (
                              <div key={id} className="flex justify-between items-center text-[10px] font-semibold text-slate-700 hover:bg-slate-50 p-1 rounded">
                                <span>{state.label}</span>
                                <span className="bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-full">{count} jobs</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 w-full h-full relative min-h-[300px]">
                      {searching && (
                        <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-2 z-50">
                          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                          <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider animate-pulse">Searching Google Places...</p>
                        </div>
                      )}
                      <InteractiveMap
                        leads={filteredJobs.map((job) => ({
                          id: job.id,
                          name: job.businessName,
                          category: job.jobType === 'Internship' ? 'Gym' : 'Restaurant',
                          address: job.location,
                          city: job.location.split(',').pop()?.trim() || 'India',
                          phone: job.contactDetails.phone,
                          email: job.contactDetails.email,
                          website: null,
                          rating: job.businessRating,
                          review_count: job.vacancies,
                          digital_score: job.matchPercentage || 85,
                          latitude: job.latitude ?? 20.5937,
                          longitude: job.longitude ?? 78.9629,
                          image_url: null,
                          place_id: job.id,
                          created_at: new Date().toISOString(),
                          outreach_status: 'new' as const
                        }))}
                        selectedId={selectedJob?.id || null}
                        onSelect={(id) => {
                          const job = jobs.find((j) => j.id === id);
                          if (job) setSelectedJob(job);
                        }}
                        searchedLocation={filterLocation || searchedLocation || 'India'}
                      />
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Tab 3: My Applications */}
        {activeTab === 'applications' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Your Recent Applications</h1>
              <p className="text-xs text-slate-500">Track and manage responses from local business owners.</p>
            </div>

            {myApplicationsMapped.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="p-4">Job Title</th>
                      <th className="p-4">Business</th>
                      <th className="p-4">Applied Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {myApplicationsMapped.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{app.jobTitle}</td>
                        <td className="p-4">{app.businessName}</td>
                        <td className="p-4 text-slate-400">{app.appliedDate}</td>
                        <td className="p-4">
                          <span className={cn(
                            "text-[10px] font-bold rounded-full px-2 py-0.5",
                            app.status === 'Accepted' ? 'bg-green-50 text-green-600' :
                            app.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                            app.status === 'Interview' ? 'bg-amber-50 text-amber-600' :
                            app.status === 'Viewed' ? 'bg-blue-50 text-blue-600' :
                            'bg-slate-100 text-slate-600'
                          )}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {app.status === 'Interview' && (
                              <button 
                                onClick={() => setSelectedChatJobId(app.jobId)}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-2.5 py-1 rounded"
                              >
                                Chat
                              </button>
                            )}
                            <button 
                              onClick={() => withdrawApplication(app.id)}
                              className="text-red-500 hover:text-red-700 font-bold hover:underline"
                            >
                              Withdraw
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <FileText className="h-12 w-12 text-slate-200 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No applications submitted yet.</p>
                <p className="text-xs text-slate-400 mt-1">Go to Search Jobs to find and apply for active vacancies.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Profile Page */}
        {activeTab === 'profile' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Page Header */}
            <div>
              <h1 className="text-xl font-bold text-slate-900">Job Seeker Profile</h1>
              <p className="text-xs text-slate-500">Maintain your employment profile for local businesses.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Editable Fields */}
              <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleProfileSave} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Edit Basic Info</h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                      <input 
                        value={seekerProfile.name}
                        disabled
                        className="w-full rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs text-slate-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email Address</label>
                      <input 
                        value={seekerProfile.email}
                        disabled
                        className="w-full rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs text-slate-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone Number</label>
                      <input 
                        value={phoneEdit}
                        onChange={(e) => setPhoneEdit(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Current City</label>
                      <input 
                        value={cityEdit}
                        onChange={(e) => setCityEdit(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">About Me</label>
                    <textarea 
                      value={aboutEdit}
                      onChange={(e) => setAboutEdit(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Preferred Shift</label>
                      <select 
                        value={shiftEdit} 
                        onChange={(e) => setShiftEdit(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="Morning Shift">Morning Shift</option>
                        <option value="Evening Shift">Evening Shift</option>
                        <option value="Night Shift">Night Shift</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Preferred Salary</label>
                      <input 
                        value={salaryEdit}
                        onChange={(e) => setSalaryEdit(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors">
                    Save basic details
                  </button>
                </form>

                {/* Skills Management */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Skills Management</h3>
                  
                  <div className="flex gap-2">
                    <input 
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g. MS Office"
                      className="flex-1 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 focus:outline-none"
                    />
                    <button onClick={handleAddSkill} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 rounded-lg">
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {seekerProfile.skills.map((s) => (
                      <span key={s} className="bg-purple-50 text-xs font-semibold text-purple-700 border border-purple-200 rounded-full px-3 py-1 flex items-center gap-1.5">
                        {s}
                        <button onClick={() => handleRemoveSkill(s)} className="text-purple-400 hover:text-purple-600 font-bold text-[10px]">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mock Photo selection */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Profile Photo</h3>
                  <p className="text-xs text-slate-500">Pick a professional avatar for your business listings.</p>
                  
                  <div className="flex gap-4 items-center">
                    <div className="h-16 w-16 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                      {seekerProfile.photoUrl ? (
                        <img src={seekerProfile.photoUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-slate-300" />
                      )}
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {avatarOptions.map((url, idx) => (
                        <button 
                          key={idx}
                          onClick={() => updateSeekerProfile({ photoUrl: url })}
                          className={cn("h-10 w-10 rounded-full overflow-hidden border-2 transition-all", seekerProfile.photoUrl === url ? "border-purple-600 scale-110 shadow" : "border-transparent")}
                        >
                          <img src={url} alt={`Avatar-${idx}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Resume Score & Suggestions */}
              <div className="space-y-6">
                
                {/* Score Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-28 w-28 bg-purple-50 rounded-full blur-2xl -z-10" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Resume Score</h3>
                  
                  <div className="text-center py-4">
                    <p className="text-5xl font-black text-purple-600">{resumeScoreDetails.score}<span className="text-xs font-semibold text-slate-400">/100</span></p>
                    <p className="text-xs font-semibold text-slate-700 mt-2">Resume Rating: {resumeScoreDetails.score >= 80 ? 'Excellent' : 'Good'}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mock Uploaded Resume</label>
                    {seekerProfile.resumeName ? (
                      <div className="flex items-center justify-between mt-2 text-xs font-semibold text-slate-700">
                        <span className="truncate max-w-[150px]">{seekerProfile.resumeName}</span>
                        <button onClick={() => updateSeekerProfile({ resumeName: null })} className="text-red-500 hover:text-red-700">Remove</button>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <label className="flex items-center justify-center gap-1.5 border border-dashed border-slate-300 rounded-lg p-3 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer">
                          <Upload className="h-4 w-4" /> Upload Resume PDF
                          <input type="file" accept=".pdf" onChange={handleMockResumeUpload} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggestions List */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Recommendations</h3>
                  {resumeScoreDetails.suggestions.length > 0 ? (
                    <div className="space-y-3 mt-2 text-xs text-slate-600">
                      {resumeScoreDetails.suggestions.map((s, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                          <p>{s}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-green-600 font-semibold flex items-center justify-center gap-1.5 bg-green-50 rounded-xl border border-green-200/50">
                      <CheckCircle className="h-4 w-4" /> Profile is 100% complete!
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Tab 5: Chat View */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex min-h-0">
            
            {/* Contacts list */}
            <div className="w-72 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversations</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Contact is open after applying.</p>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {chatConversations.length > 0 ? (
                  chatConversations.map((c) => (
                    <button 
                      key={c.jobId}
                      onClick={() => setSelectedChatJobId(c.jobId)}
                      className={cn(
                        "flex w-full items-start gap-3 p-3.5 text-left transition-colors hover:bg-slate-50",
                        selectedChatJobId === c.jobId && "bg-purple-50/50"
                      )}
                    >
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-xs font-bold text-white flex items-center justify-center flex-shrink-0 shadow-inner">
                        {c.businessName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-xs font-bold text-slate-900">{c.businessName}</p>
                          <span className="text-[9px] text-slate-400 font-semibold">{c.lastMessageTime}</span>
                        </div>
                        <p className="truncate text-[10px] text-slate-400 mt-0.5 font-bold">{c.jobTitle}</p>
                        <p className="truncate text-[10px] text-slate-500 mt-1 leading-relaxed">{c.lastMessageText}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-12 px-4 text-xs text-slate-400">
                    You can chat with businesses only after submitting an application. Go to Search Jobs to get started.
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages Panel */}
            <div className="flex-1 flex flex-col bg-slate-100">
              {selectedChatJobId ? (
                <>
                  {/* Messages header */}
                  <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-xs font-bold text-white flex items-center justify-center flex-shrink-0">
                        {activeChatBizName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{activeChatBizName}</p>
                        <span className="text-[10px] text-slate-400 font-semibold">Active Recruiter</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                    {activeChatMessages.map((msg) => {
                      const isSeeker = msg.sender === 'seeker';
                      return (
                        <div key={msg.id} className={cn("flex gap-2.5 max-w-[80%]", isSeeker ? "ml-auto flex-row-reverse" : "mr-auto")}>
                          {!isSeeker && (
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0">
                              {activeChatBizName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className={cn(
                              "rounded-2xl p-3 shadow-sm text-xs leading-relaxed",
                              isSeeker ? "bg-purple-600 text-white rounded-tr-sm" : "bg-white text-slate-700 rounded-tl-sm"
                            )}>
                              {/* Text Message */}
                              {msg.text && <p>{msg.text}</p>}

                              {/* File Message */}
                              {msg.fileName && (
                                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-2 mt-1.5 text-[11px] text-slate-800">
                                  <FileText className="h-4.5 w-4.5 text-purple-600" />
                                  <span className="truncate max-w-[120px] font-bold">{msg.fileName}</span>
                                </div>
                              )}

                              {/* Mock Voice Note */}
                              {msg.voiceNoteUrl && (
                                <div className="flex items-center gap-3 bg-purple-50 text-purple-800 rounded-xl p-2.5 mt-1.5 min-w-[160px]">
                                  <button 
                                    type="button"
                                    onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                                    className="h-7 w-7 flex items-center justify-center rounded-full bg-purple-600 text-white flex-shrink-0"
                                  >
                                    {playingAudioId === msg.id ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-white text-white ml-0.5" />}
                                  </button>
                                  <div className="flex-1">
                                    {/* Mock Waveform */}
                                    <div className="h-3 flex gap-0.5 items-end justify-center">
                                      {[4, 10, 6, 8, 3, 7, 9, 5, 8, 4, 6].map((h, i) => (
                                        <span 
                                          key={i} 
                                          className={cn("w-0.5 rounded-full bg-purple-300", playingAudioId === msg.id && "animate-pulse")}
                                          style={{ height: `${playingAudioId === msg.id ? h * 10 : 20}%` }}
                                        />
                                      ))}
                                    </div>
                                    <p className="text-[8px] text-purple-400 mt-1 font-bold">0:04 · Recorded Note</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className={cn("text-[9px] text-slate-400", isSeeker && "text-right")}>
                              {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Send Input Bar */}
                  <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-200 p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={handleChatFileUpload}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg flex-shrink-0"
                      >
                        <FileUp className="h-4.5 w-4.5" />
                      </button>
                      
                      <button 
                        type="button" 
                        onClick={toggleRecording}
                        className={cn(
                          "p-2 rounded-lg flex-shrink-0 transition-colors",
                          recording ? "bg-red-50 text-red-500 animate-pulse" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {recording ? `${voiceNoteSecs}s ⏹️` : <Mic className="h-4.5 w-4.5" />}
                      </button>

                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={recording ? "Recording audio note..." : "Type a message..."}
                        disabled={recording}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:border-purple-500 focus:outline-none disabled:opacity-50"
                      />

                      <button 
                        type="submit"
                        disabled={recording || !chatInput.trim()}
                        className="h-10 w-10 flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-xs text-slate-400">
                  <MessageSquare className="h-8 w-8 text-slate-300 mb-1.5" />
                  Select a business recruiter from the sidebar to chat.
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Details Slide-over panel when a job is clicked */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Panel Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Job Details View</h3>
              <button onClick={() => setSelectedJob(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Panel Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Job Basics */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 leading-tight">{selectedJob.title}</h2>
                  <p className="text-xs text-purple-600 font-bold mt-1">{selectedJob.businessName} · <span className="text-slate-400">★ {selectedJob.businessRating}</span></p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{selectedJob.location} · {selectedJob.distance}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-black text-slate-950">{selectedJob.salary}</p>
                  <span className="inline-block mt-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded px-1.5 py-0.5">{selectedJob.jobType}</span>
                </div>
              </div>

              {/* Match Score if Seeker */}
              <div className="rounded-xl bg-purple-50 border border-purple-100 p-4 flex gap-3">
                <Sparkles className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-purple-800">Grok Recommendation Score: {selectedJob.matchPercentage ?? 85}% Match</p>
                  <p className="text-[11px] text-purple-600/90 leading-relaxed mt-1">
                    {selectedJob.matchReason ?? "Reason: Matches your city location, preferred shifts and working categories."}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Skills Required */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Skills Required</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skillsRequired.map((s) => (
                    <span key={s} className="bg-slate-100 text-xs font-semibold text-slate-600 rounded-full px-3 py-1">{s}</span>
                  ))}
                </div>
              </div>

              {/* Details table */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Shift Timing:</span>
                  <span className="font-semibold text-slate-800">{selectedJob.shiftTiming}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of Vacancies:</span>
                  <span className="font-semibold text-slate-800">{selectedJob.vacancies} openings</span>
                </div>
                <div className="flex justify-between">
                  <span>Posted Date:</span>
                  <span className="font-semibold text-slate-800">{selectedJob.postedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience Required:</span>
                  <span className="font-semibold text-slate-800">{selectedJob.experienceNeeded || 'Freshers / Entry Level'}</span>
                </div>
              </div>

              {/* Contact card */}
              <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-2.5 text-xs text-slate-700 shadow-sm">
                <h5 className="font-bold text-slate-800">Recruiter Details</h5>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{selectedJob.contactDetails.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{selectedJob.contactDetails.email}</span>
                </div>
              </div>

            </div>

            {/* Panel Action footer */}
            <div className="p-4 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => toggleSaveJob(selectedJob.id)}
                className={cn(
                  "flex-1 py-3 text-xs font-bold rounded-xl border transition-colors flex items-center justify-center gap-1.5",
                  savedJobIds.includes(selectedJob.id) 
                    ? "bg-amber-50 border-amber-300 text-amber-500 hover:bg-amber-100/50" 
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                ★ {savedJobIds.includes(selectedJob.id) ? 'Saved' : 'Save Job'}
              </button>
              
              <button 
                onClick={() => setShowApplyModal(true)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-3 rounded-xl transition-colors shadow-lg shadow-purple-600/15"
              >
                Apply Now
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Submit Application Form Dialog */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2.5 mb-4">Submit Application for {selectedJob.title}</h3>
            
            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs text-slate-700">
              
              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Upload Resume</label>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-2.5 flex-1 font-semibold text-slate-700">
                    {applyResumeName || seekerProfile.resumeName || 'Default_Resume.pdf'}
                  </div>
                  <label className="bg-purple-50 hover:bg-purple-100 border border-purple-200/50 text-purple-700 font-bold px-3 py-2.5 rounded-lg cursor-pointer flex items-center gap-1.5">
                    <Upload className="h-4 w-4" /> Change File
                    <input type="file" accept=".pdf" onChange={(e) => setApplyResumeName(e.target.files?.[0]?.name || '')} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Expected Salary (Monthly)</label>
                <input 
                  value={applySalary}
                  onChange={(e) => setApplySalary(e.target.value)}
                  placeholder={selectedJob.salary}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-700 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Short Introduction</label>
                <textarea 
                  required
                  value={applyIntro}
                  onChange={(e) => setApplyIntro(e.target.value)}
                  rows={3}
                  placeholder="Tell the business recruiter why you are a great fit for this helper or operator vacancy..."
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-700 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Availability</label>
                  <select 
                    value={applyAvailability}
                    onChange={(e) => setApplyAvailability(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-700 focus:outline-none"
                  >
                    <option value="Immediate">Immediate Availability</option>
                    <option value="1 Week Notice">1 Week Notice</option>
                    <option value="2 Weeks Notice">2 Weeks Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Preferred Shift</label>
                  <select 
                    value={applyShift}
                    onChange={(e) => setApplyShift(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-700 focus:outline-none"
                  >
                    <option value="Morning Shift">Morning Shift</option>
                    <option value="Evening Shift">Evening Shift</option>
                    <option value="Night Shift">Night Shift</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-lg"
                >
                  Submit Application
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
