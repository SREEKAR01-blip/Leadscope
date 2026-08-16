import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function LogoIcon({ size = 40, className, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
      {...props}
    >
      {/* Definitions for Gradients */}
      <defs>
        <linearGradient id="logo-blue" x1="200" y1="80" x2="200" y2="170" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="logo-green" x1="126" y1="207" x2="126" y2="297" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="logo-orange" x1="274" y1="207" x2="274" y2="297" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Outer Connecting Ring Segment 1 (Blue - top-left to top-right) */}
      <path
        d="M 148 220 A 90 90 0 0 1 252 220"
        stroke="#1d4ed8"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Outer Connecting Ring Segment 2 (Orange - right) */}
      <path
        d="M 252 220 A 90 90 0 0 1 200 310"
        stroke="#d97706"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Outer Connecting Ring Segment 3 (Green - left) */}
      <path
        d="M 200 310 A 90 90 0 0 1 148 220"
        stroke="#047857"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Top Bubble (Blue) - Storefront */}
      <g>
        <circle cx="200" cy="125" r="45" fill="url(#logo-blue)" />
        {/* Storefront Icon */}
        <g transform="translate(182, 107) scale(1.5)" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
          <path d="M2 7h20" />
        </g>
      </g>

      {/* Left Bubble (Green) - Person at Laptop */}
      <g>
        <circle cx="126" cy="252" r="45" fill="url(#logo-green)" />
        {/* User Icon */}
        <circle cx="126" cy="238" r="8" fill="white" />
        <path d="M112 268 C112 254, 140 254, 140 268 Z" fill="white" />
        {/* Laptop Icon (Overlaid on left) */}
        <polygon points="106,267 118,267 122,260 108,260" fill="url(#logo-green)" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      </g>

      {/* Right Bubble (Orange) - Professional / Auditor */}
      <g>
        <circle cx="274" cy="252" r="45" fill="url(#logo-orange)" />
        {/* User Profile */}
        <circle cx="274" cy="238" r="8" fill="white" />
        <path d="M260 268 C260 254, 288 254, 288 268 Z" fill="white" />
        {/* Tie Overlay */}
        <polygon points="272,254 276,254 278,260 274,265 270,260" fill="url(#logo-orange)" />
        {/* Magnifying Glass Icon (Overlaid on right) */}
        <circle cx="292" cy="256" r="6" stroke="white" strokeWidth="1.5" fill="url(#logo-orange)" />
        <line x1="296.5" y1="260.5" x2="302" y2="266" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Center Stylized Calligraphic "L" */}
      <path
        d="M 225 170 C 225 195, 210 220, 202 245 C 196 260, 200 268, 215 268 C 230 268, 245 266, 258 264 C 262 263, 262 268, 255 271 C 242 277, 222 279, 210 279 C 192 279, 185 272, 190 256 C 196 235, 210 210, 213 185 C 213 175, 225 175, 225 170 Z"
        fill="#0b192c"
      />
    </svg>
  );
}

export function LogoFull({ size = 200, showSubtext = true, dark = false, ...props }: { size?: number; showSubtext?: boolean; dark?: boolean }) {
  return (
    <div className="flex flex-col items-center select-none text-center">
      <LogoIcon size={size} />
      <div className="mt-4 flex flex-col items-center">
        <h1 className={cn(
          "text-3xl font-extrabold tracking-tight leading-none",
          dark ? "text-white" : "text-slate-900"
        )}>
          Lead<span className="text-blue-600">Scope</span>
        </h1>
        {showSubtext && (
          <div className={cn(
            "mt-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider",
            dark ? "text-slate-400" : "text-slate-500"
          )}>
            <span className="h-[2px] w-8 bg-emerald-500"></span>
            Discover. Analyze. Connect. Grow.
            <span className="h-[2px] w-8 bg-amber-500"></span>
          </div>
        )}
      </div>
    </div>
  );
}
