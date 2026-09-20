'use client';

import { useState, useMemo, useRef, type ChangeEvent } from 'react';
import {
  Briefcase,
  Plus,
  Star,
  Award,
  Clock,
  CheckCircle,
  Sparkles,
  Upload,
  FileVideo,
  Image as ImageIcon,
  X,
  Check,
  Film,
  Trash2,
  Pencil,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import type { ReelItem, FreelancerProfile } from '@/lib/marketplace-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  client: string;
  year: string;
  description: string;
  tags: string[];
};

const SAMPLE_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'pf-1',
    title: 'Restaurant Ordering Platform',
    category: 'Web Development',
    client: "Ohri's Jiva Imperia",
    year: '2026',
    description: 'Full-stack Next.js website with online ordering, table booking, and CMS-driven menu management.',
    tags: ['Next.js', 'Stripe', 'Supabase'],
  },
  {
    id: 'pf-2',
    title: 'Dental Clinic Booking App',
    category: 'Mobile Development',
    client: 'SmileCare Clinic',
    year: '2025',
    description: 'React Native app with appointment scheduling, reminders, and telehealth video integration.',
    tags: ['React Native', 'Firebase', 'WebRTC'],
  },
  {
    id: 'pf-3',
    title: 'Boutique E-commerce Store',
    category: 'E-commerce',
    client: 'Kalaniketan Silks',
    year: '2026',
    description: 'Shopify store with custom theme, 200+ product catalog, and Klaviyo email automation.',
    tags: ['Shopify', 'Liquid', 'Klaviyo'],
  },
];

function VideoReel({ reel, onDelete }: { reel: ReelItem; onDelete?: (id: string) => void }) {
  const isVideo = reel.mediaType === 'video' || (reel.mediaUrl && !reel.mediaUrl.match(/\.(png|jpe?g|webp|gif|svg)$/i));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Video / Media frame */}
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        {isVideo ? (
          <video
            src={reel.mediaUrl}
            controls
            controlsList="nodownload"
            className="h-full w-full object-contain bg-black"
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reel.mediaUrl}
            alt={reel.title}
            className="h-full w-full object-cover"
          />
        )}

        {/* Uploaded Tag */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
          <Film className="h-3 w-3" />
          Uploaded Reel
        </div>

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={() => onDelete(reel.id)}
            title="Delete Reel"
            className="absolute right-3 top-3 rounded-lg bg-slate-900/80 p-2 text-slate-300 backdrop-blur transition-colors hover:bg-red-600 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-900">{reel.title}</h3>
        {reel.subtitle && <p className="mt-0.5 text-xs text-slate-500">{reel.subtitle}</p>}
        {reel.description && <p className="mt-2 text-xs leading-relaxed text-slate-600">{reel.description}</p>}
        {reel.tags && reel.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {reel.tags.map((t) => (
              <span key={t} className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type AddReelModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddReel: (reel: ReelItem) => void;
  freelancerId: string;
};

function AddReelModal({ isOpen, onClose, onAddReel, freelancerId }: AddReelModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileMediaType, setFileMediaType] = useState<'video' | 'image'>('video');

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setFilePreviewUrl(previewUrl);

    const isVid = file.type.startsWith('video/') || Boolean(file.name.match(/\.(mp4|webm|mov|m4v|mkv)$/i));
    setFileMediaType(isVid ? 'video' : 'image');

    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const formattedTitle = nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1);
      setTitle(formattedTitle);
    }

    if (!subtitle) {
      setSubtitle(isVid ? 'Promotional Reel · Video Showcase' : 'Design Portfolio · Local Upload');
    }
  };

  const handleRemoveFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setSelectedFile(null);
    setFilePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !filePreviewUrl) {
      toast.error('Please attach a video or image file from your computer!');
      return;
    }

    const tagList = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const finalTags = tagList.length > 0 ? tagList : ['Portfolio', fileMediaType === 'video' ? 'Video' : 'Design'];

    const newReel: ReelItem = {
      id: `reel-${Date.now()}`,
      freelancer_id: freelancerId,
      type: 'video',
      title: title.trim() || selectedFile.name,
      subtitle: subtitle.trim() || 'Uploaded Media Showcase',
      description: description.trim() || 'Uploaded reel showcasing project work.',
      tags: finalTags,
      mediaUrl: filePreviewUrl,
      mediaType: fileMediaType,
    };

    onAddReel(newReel);
    toast.success('Your video reel has been uploaded!');
    onClose();

    setSelectedFile(null);
    setFilePreviewUrl(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setTagsInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Upload Video Reel</h2>
              <p className="text-xs text-slate-500">Attach video or image files from your computer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-700">
              Attach Video File <span className="text-red-500">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center transition-all hover:border-blue-500 hover:bg-blue-50/30"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  Click to select video file from local storage
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Supports MP4, WEBM, MOV, PNG, JPG (Up to 100MB)
                </p>
              </div>
            ) : (
              <div className="relative rounded-2xl border border-slate-200 bg-slate-950 p-2 overflow-hidden">
                {fileMediaType === 'video' ? (
                  <video
                    src={filePreviewUrl!}
                    controls
                    className="w-full max-h-48 rounded-xl object-contain bg-black"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={filePreviewUrl!}
                    alt="Local preview"
                    className="w-full max-h-48 rounded-xl object-contain bg-black"
                  />
                )}
                <div className="mt-2 flex items-center justify-between px-2 py-1 bg-slate-900 rounded-lg text-white">
                  <div className="flex items-center gap-2 min-w-0">
                    {fileMediaType === 'video' ? (
                      <FileVideo className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-green-400 flex-shrink-0" />
                    )}
                    <span className="text-xs font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-medium px-2 py-0.5 rounded bg-red-950/40 hover:bg-red-900/60 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reel Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Restaurant Promo Reel"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle / Category</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Next.js Web Application"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this video reel demonstrates..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Next.js, Video, UI/UX"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
              Upload Reel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type AddProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: PortfolioItem) => void;
};

function AddProjectModal({ isOpen, onClose, onAddProject }: AddProjectModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [client, setClient] = useState('');
  const [year, setYear] = useState('2026');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a project title!');
      return;
    }

    const tagList = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newProject: PortfolioItem = {
      id: `pf-${Date.now()}`,
      title: title.trim(),
      category: category.trim() || 'Web Development',
      client: client.trim() || 'Independent Client',
      year: year.trim() || '2026',
      description: description.trim() || 'Custom software development and design project.',
      tags: tagList.length > 0 ? tagList : ['React', 'Next.js', 'Tailwind'],
    };

    onAddProject(newProject);
    toast.success('New project added to portfolio!');
    onClose();

    setTitle('');
    setCategory('Web Development');
    setClient('');
    setYear('2026');
    setDescription('');
    setTagsInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Project</h2>
              <p className="text-xs text-slate-500">Showcase your completed project details</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. E-Commerce Store & Admin Panel"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="E-commerce">E-commerce</option>
                <option value="AI Integration">AI Integration</option>
                <option value="Branding & Marketing">Branding & Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name</label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. Ohri's Jiva Imperia"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe key features, architecture, and business outcomes..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Technologies / Tags (Comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Next.js, Supabase, Tailwind, Stripe"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <Check className="h-4 w-4" />
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profile: FreelancerProfile;
  onSave: (updated: Partial<FreelancerProfile>) => void;
};

function EditProfileModal({ isOpen, onClose, profile, onSave }: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [projectsCompleted, setProjectsCompleted] = useState(profile.projects_completed.toString());
  const [rating, setRating] = useState(profile.rating.toString());
  const [reviewCount, setReviewCount] = useState(profile.review_count.toString());
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [newSkill, setNewSkill] = useState('');

  if (!isOpen) return null;

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required!');
      return;
    }

    onSave({
      name: name.trim(),
      title: title.trim() || 'Freelance Specialist',
      projects_completed: parseInt(projectsCompleted) || 0,
      rating: parseFloat(rating) || 5.0,
      review_count: parseInt(reviewCount) || 0,
      skills,
    });

    toast.success('Portfolio profile updated successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Portfolio Profile</h2>
              <p className="text-xs text-slate-500">Update your public freelancer name, title, skills, and stats</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Srikar"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Full-Stack Web Developer & UI Designer"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Projects Done</label>
              <input
                type="number"
                min="0"
                value={projectsCompleted}
                onChange={(e) => setProjectsCompleted(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rating (1-5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reviews Count</label>
              <input
                type="number"
                min="0"
                value={reviewCount}
                onChange={(e) => setReviewCount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Manage Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a skill (e.g. Next.js, Python)..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                + Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2 rounded-xl border border-slate-200 bg-slate-50">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No skills added yet. Type a skill above.</span>
              ) : (
                skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 shadow-xs"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <Check className="h-4 w-4" />
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PortfolioBuilderView() {
  const { freelancers, updateFreelancerProfile, reels, addReel, deleteReel } = useApp();
  const [items, setItems] = useState<PortfolioItem[]>(SAMPLE_PORTFOLIO);
  const [activeTab, setActiveTab] = useState<'reels' | 'projects'>('reels');
  const [isAddReelModalOpen, setIsAddReelModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const profile = freelancers[0];

  const userUploadedReels = useMemo(
    () => reels.filter((r) => Boolean(r.mediaUrl)),
    [reels]
  );

  const handleDeleteReel = (id: string) => {
    deleteReel(id);
    toast.success('Reel removed from portfolio');
  };

  const handleAddProject = (project: PortfolioItem) => {
    setItems((prev) => [project, ...prev]);
  };

  const handleDeleteProject = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    toast.success('Project removed from portfolio');
  };

  const handleSaveProfile = (updated: Partial<FreelancerProfile>) => {
    updateFreelancerProfile(profile.id, updated);
  };

  return (
    <div className="h-full overflow-y-auto select-none">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <Briefcase className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Portfolio Builder</h1>
              <p className="text-sm text-slate-500">Showcase your work to win more projects</p>
            </div>
          </div>

          {/* Action button adapts based on active tab */}
          {activeTab === 'reels' ? (
            <button
              onClick={() => setIsAddReelModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              Add Reel
            </button>
          ) : (
            <button
              onClick={() => setIsAddProjectModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              Add Project
            </button>
          )}
        </div>

        {/* Profile summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-xl font-bold text-white shadow-sm">
                {profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              {profile.online && (
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
                {profile.verified && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                    <Award className="h-3 w-3" /> Verified
                  </span>
                )}
                <button
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="ml-2 flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  <Pencil className="h-3.5 w-3.5 text-blue-500" />
                  Edit Profile
                </button>
              </div>
              <p className="text-sm font-medium text-slate-500">{profile.title}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                  >
                    <Sparkles className="h-3 w-3 text-blue-400" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">{profile.projects_completed}</p>
                <p className="text-xs text-slate-500">Projects</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-2xl font-bold text-slate-900">
                  {profile.rating.toFixed(1)}
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </p>
                <p className="text-xs text-slate-500">{profile.review_count} reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {[
            { key: 'reels' as const, label: 'Portfolio Reels', icon: Film, count: userUploadedReels.length },
            { key: 'projects' as const, label: 'Projects', icon: Briefcase, count: items.length },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                <span
                  className={cn(
                    'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold',
                    isActive ? 'bg-white/20' : 'bg-slate-100'
                  )}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Reels Feed */}
        {activeTab === 'reels' && (
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Upload Action Card */}
            <div
              onClick={() => setIsAddReelModalOpen(true)}
              className="group cursor-pointer flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center transition-all hover:border-blue-500 hover:bg-blue-50/40"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
                <Upload className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upload Video Reel</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-xs">
                  Attach video files from your computer to feature on your website
                </p>
              </div>
              <span className="mt-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors group-hover:bg-blue-500">
                + Attach Video File
              </span>
            </div>

            {/* Uploaded Video Reels ONLY */}
            {userUploadedReels.map((reel) => (
              <VideoReel key={reel.id} reel={reel} onDelete={handleDeleteReel} />
            ))}
          </div>
        )}

        {/* Projects Grid */}
        {activeTab === 'projects' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <Briefcase className="h-5 w-5 text-slate-500" />
                  </div>
                  <button
                    onClick={() => handleDeleteProject(item.id)}
                    title="Delete Project"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-500">
                  {item.category} · {item.year}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Client: {item.client}</p>
              </div>
            ))}

            {/* Add Project Card */}
            <div
              onClick={() => setIsAddProjectModalOpen(true)}
              className="group cursor-pointer flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-blue-300 hover:text-blue-500"
            >
              <Plus className="h-6 w-6 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium">Add Project</span>
            </div>
          </div>
        )}
      </div>

      {/* Add Reel Modal */}
      <AddReelModal
        isOpen={isAddReelModalOpen}
        onClose={() => setIsAddReelModalOpen(false)}
        onAddReel={addReel}
        freelancerId={profile.id}
      />

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onAddProject={handleAddProject}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
