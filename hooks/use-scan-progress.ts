'use client';

import { useState, useRef, useCallback } from 'react';

export type ScanStep = {
  text: string;
  progress: number;
};

const SCAN_STEPS: ScanStep[] = [
  { text: '[scan] Querying grid...', progress: 8 },
  { text: '[scan] Resolving coordinates...', progress: 20 },
  { text: '[scan] Fetching business listings...', progress: 35 },
  { text: '[scan] Verifying domain names...', progress: 50 },
  { text: '[scan] Checking website presence...', progress: 63 },
  { text: '[scan] Scoring digital footprints...', progress: 76 },
  { text: '[scan] Compiling opportunity scores...', progress: 88 },
  { text: '[scan] Finalising results...', progress: 96 },
  { text: '[scan] Complete.', progress: 100 },
];

const TOTAL_DURATION_MS = 2200;

type UseScanProgressReturn = {
  scanning: boolean;
  progress: number;
  stepText: string;
  startScan: (onComplete: () => void) => void;
};

export function useScanProgress(): UseScanProgressReturn {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const startScan = useCallback(
    (onComplete: () => void) => {
      clearTimers();
      setScanning(true);
      setProgress(0);
      setStepText(SCAN_STEPS[0].text);

      SCAN_STEPS.forEach((step, i) => {
        const delay = (TOTAL_DURATION_MS / SCAN_STEPS.length) * i;
        const t = setTimeout(() => {
          setProgress(step.progress);
          setStepText(step.text);
        }, delay);
        timersRef.current.push(t);
      });

      const doneTimer = setTimeout(() => {
        setScanning(false);
        onComplete();
      }, TOTAL_DURATION_MS);
      timersRef.current.push(doneTimer);
    },
    [clearTimers]
  );

  return { scanning, progress, stepText, startScan };
}
