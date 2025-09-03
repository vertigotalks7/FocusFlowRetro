
"use client";

import { cn } from '@/lib/utils';
import { Timer } from 'lucide-react';

interface PomodoroProgressProps {
  isOpen: boolean;
  isActive: boolean;
  timeLeft: number;
  totalTime: number;
}

const PomodoroProgress = ({ isOpen, isActive, timeLeft, totalTime }: PomodoroProgressProps) => {
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  
  if (!isActive || !isOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-black/50 backdrop-blur-sm z-20 flex items-center px-4 font-mono text-sm">
      <div className="flex items-center gap-2 text-primary w-full">
        <Timer size={16} className="icon-shadow-neon-primary" />
        <span className="text-shadow-neon-accent">{formatTime(timeLeft)}</span>
        <div className="flex-grow h-1.5 bg-primary/20 rounded-full ml-4">
            <div 
              className="h-1.5 bg-primary rounded-full"
              style={{ width: `${progress}%`, transition: 'width 0.5s linear' }}
            ></div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroProgress;

    