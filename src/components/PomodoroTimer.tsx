
"use client";

import { Play, Pause, RefreshCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export const TIMES: Record<TimerMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

interface PomodoroTimerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: TimerMode;
  setMode: (mode: TimerMode) => void;
  timeLeft: number;
  isActive: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  workSessions: number;
}

const PomodoroTimer = ({
  isOpen,
  onClose,
  mode,
  setMode,
  timeLeft,
  isActive,
  toggleTimer,
  resetTimer,
  workSessions,
}: PomodoroTimerProps) => {

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / TIMES[mode]) * 100;

  return (
    <div className={cn(
      "fixed top-0 right-0 h-full w-80 bg-black/50 backdrop-blur-md text-white font-mono p-6 transition-transform duration-300 ease-in-out z-30",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="flex items-center justify-between mb-4">
        <Button onClick={onClose} variant="ghost" size="icon" className="text-primary hover:text-accent-foreground hover:bg-accent">
          <ArrowLeft size={24} />
        </Button>
        <h2 className="text-2xl font-bold text-primary text-shadow-neon-accent">Pomodoro Timer</h2>
        <div className="w-10"></div>
      </div>


      <div className="flex justify-center gap-2 mb-6">
        <Button variant={mode === 'work' ? 'secondary' : 'ghost'} size="sm" onClick={() => setMode('work')}>Work</Button>
        <Button variant={mode === 'shortBreak' ? 'secondary' : 'ghost'} size="sm" onClick={() => setMode('shortBreak')}>Short Break</Button>
        <Button variant={mode === 'longBreak' ? 'secondary' : 'ghost'} size="sm" onClick={() => setMode('longBreak')}>Long Break</Button>
      </div>

      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-muted"
            strokeWidth="7"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
          />
          <circle
            className="text-primary icon-shadow-neon-primary"
            strokeWidth="7"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={2 * Math.PI * 42 * (1 - progress / 100)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl text-shadow-neon-accent">{formatTime(timeLeft)}</span>
        </div>
      </div>
      
      <div className="flex justify-center gap-4">
        <Button onClick={toggleTimer} size="lg" variant="ghost" className="w-24 h-16 text-primary hover:text-accent-foreground hover:bg-accent text-lg">
          {isActive ? <Pause size={32} /> : <Play size={32} />}
          <span className='ml-2'>{isActive ? 'Pause' : 'Start'}</span>
        </Button>
        <Button onClick={resetTimer} size="icon" variant="ghost" className="w-16 h-16 text-primary hover:text-accent-foreground hover:bg-accent">
          <RefreshCcw size={28} />
        </Button>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">Completed Sessions: {workSessions}</p>
      </div>
    </div>
  );
};

export default PomodoroTimer;

    