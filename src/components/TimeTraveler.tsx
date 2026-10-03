import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Clock, 
  Activity, 
  AlertTriangle, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { TimelineStep } from '../types/chronograph';

interface TimeTravelerProps {
  timeline: TimelineStep[];
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  maxStep: number;
  activeCount: number;
  decayedCount: number;
}

export const TimeTraveler: React.FC<TimeTravelerProps> = ({
  timeline,
  currentStep,
  setCurrentStep,
  maxStep = 10,
  activeCount,
  decayedCount,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1800); // ms per step

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= maxStep) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, speed, maxStep, setCurrentStep]);

  const activeStepData = timeline.find((t) => t.step === currentStep) || timeline[0] || {
    step: currentStep,
    label: `Step T${currentStep}`,
    timestamp: `T${currentStep}`,
    event: 'Agent execution timeline',
    driftScore: 0.5,
  };

  return (
    <div className="h-28 lg:h-32 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 lg:px-6 py-2.5 flex flex-col justify-between shrink-0 z-20">
      {/* Top row: Current Event Summary & Telemetry */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Event label & icon */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0 font-mono font-bold text-xs">
            T{currentStep}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono">
                {activeStepData.label || `Step T${currentStep}`}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                {activeStepData.timestamp}
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate max-w-xl">
              {activeStepData.event}
            </p>
          </div>
        </div>

        {/* Right: Step Drift & Active Nodes info */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Drift @ T{currentStep}:</span>
            <span className={`font-bold ${
              activeStepData.driftScore > 0.6 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {(activeStepData.driftScore * 100).toFixed(0)}%
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              {activeCount} active
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-rose-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              {decayedCount} decayed
            </span>
          </div>

          {/* Controls: Play/Pause/Reset */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded-md transition-all ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
              }`}
              title={isPlaying ? 'Pause Simulation' : 'Play Timeline Animation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(1);
              }}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset to T1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSpeed((prev) => (prev === 1800 ? 900 : 1800))}
              className="px-2 py-1 rounded text-[10px] font-mono font-semibold text-slate-400 hover:text-slate-200"
              title="Toggle Playback Speed"
            >
              {speed === 1800 ? '1x' : '2x'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Interactive Timeline Scrubber with Milestones */}
      <div className="space-y-1.5 pt-1">
        <div className="relative flex items-center">
          {/* Custom Range Slider */}
          <input
            type="range"
            min={1}
            max={maxStep}
            value={currentStep}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentStep(Number(e.target.value));
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>

        {/* Milestone Steps (T1 to T10) */}
        <div className="flex justify-between items-center px-1">
          {Array.from({ length: maxStep }, (_, i) => {
            const stepNum = i + 1;
            const isCurrent = stepNum === currentStep;
            const isPassed = stepNum <= currentStep;
            const stepData = timeline.find((t) => t.step === stepNum);

            return (
              <button
                key={stepNum}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStep(stepNum);
                }}
                className={`group relative flex flex-col items-center focus:outline-none transition-all ${
                  isCurrent ? 'scale-110' : 'hover:scale-105'
                }`}
                title={stepData?.event || `Step T${stepNum}`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'border-cyan-400 bg-cyan-400 shadow-md shadow-cyan-400/50'
                      : isPassed
                      ? 'border-indigo-500 bg-indigo-950 text-indigo-400'
                      : 'border-slate-700 bg-slate-900 text-slate-600'
                  }`}
                />
                <span
                  className={`text-[9px] font-mono mt-0.5 ${
                    isCurrent
                      ? 'text-cyan-300 font-bold'
                      : isPassed
                      ? 'text-slate-400'
                      : 'text-slate-600'
                  }`}
                >
                  T{stepNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
