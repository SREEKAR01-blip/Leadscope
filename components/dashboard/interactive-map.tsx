'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ExtendedLead } from '@/lib/app-context';
import { REGIONS, findRegion } from '@/lib/location-data';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

type Props = {
  leads: ExtendedLead[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchedLocation: string | null;
};

// Custom Google Maps Pin Icon using DivIcon and SVG
const createCustomPin = (isSelected: boolean, score: number) => {
  const pinColor = isSelected ? '#dc2626' : '#ef4444'; // Darker red when selected
  const strokeColor = isSelected ? '#991b1b' : '#b91c1c';
  
  // Color code based on digital score to match score color scheme
  let markerColor = '#ef4444'; // Poor
  if (score >= 75) markerColor = '#22c55e'; // High
  else if (score >= 50) markerColor = '#3b82f6'; // Good
  else if (score >= 30) markerColor = '#f59e0b'; // Low

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div class="relative flex items-center justify-center transition-transform duration-300 ${isSelected ? 'scale-125 z-[1000]' : 'hover:scale-110 z-[500]'}">
        <!-- SVG Pin Shape (Looks like Google Map Pin) -->
        <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.16 24.84 0 16 0ZM16 22C12.69 22 10 19.31 10 16C10 12.69 12.69 10 16 10C19.31 10 22 12.69 22 16C22 19.31 19.31 22 16 22Z" fill="${markerColor}" stroke="${strokeColor}" stroke-width="1"/>
          <!-- Inner circle dot -->
          <circle cx="16" cy="16" r="4.5" fill="#000000"/>
        </svg>
        ${isSelected ? `<span class="absolute -top-1 -right-1 flex h-3.5 w-3.5 rounded-full bg-red-600 border border-white animate-ping"></span>` : ''}
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

export default function InteractiveMap({ leads, selectedId, onSelect, searchedLocation }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [mapReady, setMapReady] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Detect center from searched location or default to showing complete India
    let centerLat = 20.5937;
    let centerLng = 78.9629;
    let zoomLevel = 5;

    if (searchedLocation) {
      const region = findRegion(searchedLocation);
      if (region) {
        centerLat = region.centerLat;
        centerLng = region.centerLng;
        zoomLevel = region.key === 'india' ? 5 : region.key === 'hyderabad' ? 12 : 13;
      }
    }

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: zoomLevel,
      zoomControl: false, // Position standard zoom control manually
      attributionControl: false,
    });

    // Patch Leaflet to avoid crash on unmount during transitions/animations
    const proto = map as any;
    const originalOnZoomTransitionEnd = proto._onZoomTransitionEnd;
    if (originalOnZoomTransitionEnd) {
      proto._onZoomTransitionEnd = function (...args: any[]) {
        if (!this._mapPane) return;
        return originalOnZoomTransitionEnd.apply(this, args);
      };
    }
    const originalGetMapPanePos = proto._getMapPanePos;
    if (originalGetMapPanePos) {
      proto._getMapPanePos = function (...args: any[]) {
        if (!this._mapPane) return { x: 0, y: 0 };
        return originalGetMapPanePos.apply(this, args);
      };
    }

    // CartoDB Voyager Layer (resembles the Google Maps pastel design)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Zoom Controls Placement
    L.control.zoom({
      position: 'bottomright',
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Update center when location searched changes
  useEffect(() => {
    if (!mapRef.current || !mapReady || !searchedLocation) return;
    const region = findRegion(searchedLocation);
    if (region) {
      const zoom = region.key === 'india' ? 5 : region.key === 'hyderabad' ? 12 : 13;
      mapRef.current.setView([region.centerLat, region.centerLng], zoom, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [searchedLocation, mapReady]);

  // Update Pins
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const map = mapRef.current;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    // Filter leads with valid coordinates
    const validLeads = leads.filter((l) => l.latitude != null && l.longitude != null);

    // Plot pins
    validLeads.forEach((lead) => {
      const isSelected = selectedId === lead.id;
      const marker = L.marker([lead.latitude!, lead.longitude!], {
        icon: createCustomPin(isSelected, lead.digital_score),
      });

      // Marker Click Event
      marker.on('click', () => {
        onSelect(lead.id);
      });

      // Popup Content matching Google Maps look
      const popupContent = `
        <div class="p-1 min-w-[140px] font-sans text-slate-800">
          <p class="font-bold text-xs leading-tight mb-0.5">${lead.name}</p>
          <p class="text-[10px] text-slate-500 mb-1.5">${lead.category} · ${lead.city}</p>
          <div class="flex items-center justify-between text-[10px]">
            <span class="flex items-center gap-0.5 text-amber-500 font-bold">
              ★ ${lead.rating ? lead.rating.toFixed(1) : 'N/A'}
            </span>
            <span class="font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
              Score: ${lead.digital_score}/100
            </span>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent, { closeButton: false });

      marker.addTo(map);
      markersRef.current[lead.id] = marker;

      // Keep popup open if selected
      if (isSelected) {
        setTimeout(() => {
          marker.openPopup();
        }, 100);
      }
    });

    // Auto-fit bounds if we have points and no specific selection
    if (validLeads.length > 0 && !selectedId) {
      const group = L.featureGroup(Object.values(markersRef.current));
      map.fitBounds(group.getBounds().pad(0.15), {
        maxZoom: 15,
        animate: true,
        duration: 1.0,
      });
    }
  }, [leads, mapReady]);

  // Center & Open Popup on Selected Business
  useEffect(() => {
    if (!mapRef.current || !mapReady || !selectedId) return;

    const marker = markersRef.current[selectedId];
    if (marker) {
      const map = mapRef.current;
      const latLng = marker.getLatLng();
      
      // Update marker icons to highlight selected
      Object.entries(markersRef.current).forEach(([id, m]) => {
        const lead = leads.find((l) => l.id === id);
        const score = lead ? lead.digital_score : 50;
        m.setIcon(createCustomPin(id === selectedId, score));
      });

      map.setView(latLng, Math.max(map.getZoom(), 14), {
        animate: true,
        duration: 1.2,
      });
      
      setTimeout(() => {
        marker.openPopup();
      }, 300);
    }
  }, [selectedId, mapReady]);

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Styled Overlay Legend (Looks like Google Maps card) */}
      <div className="absolute left-4 top-4 z-[500] flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur max-w-[200px]">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Digital Opportunity</p>
        {[
          { label: 'High Score (75+)', color: 'bg-green-500' },
          { label: 'Good Score (50-74)', color: 'bg-blue-500' },
          { label: 'Low Score (30-49)', color: 'bg-amber-500' },
          { label: 'Poor Score (<30)', color: 'bg-red-500' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 rounded-full', item.color)} />
            <span className="text-[10px] font-medium text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
