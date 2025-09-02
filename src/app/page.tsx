"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, ListMusic, Bell, Play, Pause, SkipForward, Volume2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-black/20 backdrop-blur-lg border border-primary/20 rounded-2xl shadow-lg ${className}`}>
    {children}
  </div>
);

const VhsOverlay = ({ enabled }: { enabled: boolean }) => {
  if (!enabled) return null;
  return <div className="vhs-overlay fixed inset-0 pointer-events-none z-50" />;
};

const musicStreams = [
  { name: "Lofi Cafe", url: "https://stream.lofi.cafe/mp3" },
  { name: "Chiptune", url: "https://chiptune.shoutca.st:8000/stream" },
  { name: "Plaza One", url: "https://radio.plaza.one/mp3" },
];

const PomodoroTimer = ({ sessionType, timeLeft, isActive, toggleTimer, resetTimer, flipAnimation }) => (
  <GlassCard className={`p-6 md:p-8 text-center transition-transform duration-500 ${flipAnimation}`} style={{ transformStyle: 'preserve-3d' }}>
    <div className="h-full w-full" style={{ backfaceVisibility: 'hidden' }}>
      <h2 className="font-headline text-2xl md:text-3xl text-primary text-shadow-neon-accent mb-2">{sessionType}</h2>
      <div className="font-mono text-6xl md:text-8xl my-4 text-shadow-neon-accent tracking-widest">
        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <Button onClick={toggleTimer} variant="outline" size="lg" className="bg-accent/20 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
          {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={resetTimer} variant="ghost" size="lg">Reset</Button>
      </div>
    </div>
  </GlassCard>
);

const MusicPlayer = ({ isPlaying, togglePlay, nextTrack, currentTrack, volume, setVolume, glitchClass }) => (
  <GlassCard className="p-6">
    <div className={`flex items-center justify-between mb-4 ${glitchClass}`}>
      <div className="flex items-center gap-2 text-primary">
        <ListMusic className="icon-shadow-neon-primary" />
        <h3 className="font-headline text-xl">Lofi Player</h3>
      </div>
    </div>
    <div className="text-center">
      <p className="text-muted-foreground mb-4">Now Playing: <span className="text-foreground">{currentTrack.name}</span></p>
      <div className="flex items-center justify-center gap-4">
        <Button onClick={togglePlay} size="icon" variant="ghost" className="text-accent hover:text-accent-foreground hover:bg-accent rounded-full w-14 h-14">
          {isPlaying ? <Pause size={28} /> : <Play size={28} />}
        </Button>
        <Button onClick={nextTrack} size="icon" variant="ghost" className="text-accent hover:text-accent-foreground hover:bg-accent rounded-full w-14 h-14">
          <SkipForward size={28} />
        </Button>
      </div>
      <div className="flex items-center gap-2 mt-6">
        <Volume2 className="text-primary" />
        <Slider value={[volume]} onValueChange={(value) => setVolume(value[0])} max={1} step={0.05} />
      </div>
    </div>
  </GlassCard>
);

const AlarmPanel = () => (
  <GlassCard className="p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 text-primary">
        <Bell className="icon-shadow-neon-primary" />
        <h3 className="font-headline text-xl">Alarms</h3>
      </div>
      <Button size="icon" variant="ghost">
        <Plus className="text-accent" />
      </Button>
    </div>
    <div className="text-center text-muted-foreground py-8">
      <p>Alarm system coming soon.</p>
    </div>
  </GlassCard>
);


export default function Home() {
  const [settings, setSettings] = useState({
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    vhs: true,
  });
  const [sessionType, setSessionType] = useState('Focus');
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [glitchClass, setGlitchClass] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [flipAnimation, setFlipAnimation] = useState('');

  const resetTimer = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    let nextTime;
    if (sessionType === 'Focus') {
      nextTime = settings.focus * 60;
    } else if (sessionType === 'Short Break') {
      nextTime = settings.shortBreak * 60;
    } else {
      nextTime = settings.longBreak * 60;
    }
    setTimeLeft(nextTime);
  }, [sessionType, settings]);

  const nextSession = useCallback(() => {
    setFlipAnimation('animate-[spin_0.5s_ease-in-out]');
    setTimeout(() => setFlipAnimation(''), 500);

    let nextSessionType = 'Focus';
    if (sessionType === 'Focus') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      nextSessionType = newSessionCount % 4 === 0 ? 'Long Break' : 'Short Break';
    }
    
    setSessionType(nextSessionType);
    setIsActive(false);
  }, [sessionType, sessionCount]);
  
  useEffect(() => {
    resetTimer();
  }, [sessionType, settings, resetTimer]);
  
  useEffect(() => {
    if (isActive) {
      const endTime = Date.now() + timeLeft * 1000;
      intervalRef.current = setInterval(() => {
        const newTimeLeft = Math.round((endTime - Date.now()) / 1000);
        if (newTimeLeft < 0) {
          clearInterval(intervalRef.current!);
          nextSession();
        } else {
          setTimeLeft(newTimeLeft);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, nextSession]);

  const toggleTimer = () => setIsActive(prev => !prev);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(musicStreams[currentTrackIndex].url);
      audioRef.current.volume = volume;
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => setIsPlaying(prev => !prev);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  const nextTrack = () => {
    setGlitchClass('glitch-active');
    setTimeout(() => setGlitchClass(''), 300);

    setIsPlaying(false);
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
    }
    setCurrentTrackIndex(prev => (prev + 1) % musicStreams.length);
    setTimeout(() => setIsPlaying(true), 100);
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };
  
  return (
    <>
      <VhsOverlay enabled={settings.vhs} />
      <main className="min-h-screen p-4 md:p-8 flex flex-col relative overflow-hidden">
        <header className="flex justify-between items-center w-full max-w-6xl mx-auto">
          <h1 className="text-3xl font-headline text-shadow-neon-accent">FocusFlow Retro</h1>
          <SettingsDialog settings={settings} onSettingsChange={handleSettingsChange} />
        </header>

        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <PomodoroTimer 
              sessionType={sessionType}
              timeLeft={timeLeft}
              isActive={isActive}
              toggleTimer={toggleTimer}
              resetTimer={resetTimer}
              flipAnimation={flipAnimation}
            />
            <div className="flex flex-col gap-8">
              <MusicPlayer 
                isPlaying={isPlaying}
                togglePlay={togglePlay}
                nextTrack={nextTrack}
                currentTrack={musicStreams[currentTrackIndex]}
                volume={volume}
                setVolume={setVolume}
                glitchClass={glitchClass}
              />
              <AlarmPanel />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}


function SettingsDialog({ settings, onSettingsChange }) {
  const [tempSettings, setTempSettings] = useState(settings);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(tempSettings);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-6 w-6 text-accent icon-shadow-neon-accent" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-xl border-primary text-foreground">
        <DialogHeader>
          <DialogTitle className="font-headline text-primary text-shadow-neon-accent text-2xl">Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="focus" className="text-right">Focus</Label>
            <Input id="focus" type="number" value={tempSettings.focus} onChange={(e) => setTempSettings({...tempSettings, focus: parseInt(e.target.value)})} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="short-break" className="text-right">Short Break</Label>
            <Input id="short-break" type="number" value={tempSettings.shortBreak} onChange={(e) => setTempSettings({...tempSettings, shortBreak: parseInt(e.target.value)})} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="long-break" className="text-right">Long Break</Label>
            <Input id="long-break" type="number" value={tempSettings.longBreak} onChange={(e) => setTempSettings({...tempSettings, longBreak: parseInt(e.target.value)})} className="col-span-3" />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="vhs-mode" checked={tempSettings.vhs} onCheckedChange={(checked) => setTempSettings({...tempSettings, vhs: checked})} />
            <Label htmlFor="vhs-mode">VHS Effect</Label>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
