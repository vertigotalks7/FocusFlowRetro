
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Facebook, Twitter, Heart, ListMusic, Play, Pause, SkipForward, Volume2, Loader, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';
import { cn } from '@/lib/utils';
import PomodoroTimer, { type TimerMode, TIMES } from '@/components/PomodoroTimer';
import PomodoroProgress from '@/components/PomodoroProgress';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


const TimerFinishedAlert = ({ open, onOpenChange, title, description, onConfirm }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="font-mono bg-black/80 border-primary/50 text-primary">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-accent text-2xl text-shadow-neon-accent">{title}</AlertDialogTitle>
        <AlertDialogDescription className="text-primary/80 pt-2">
          {description}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction 
          onClick={onConfirm}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Ok
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);


const TerminalLoader = ({ onFinished }: { onFinished: () => void }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);

  const bootSequence = [
    "INITIALIZING FFS-1984...",
    "VIRTUAL BIOS v2.3.1",
    "CPU: SYNTHWAVE-8086 @ 4.77MHz",
    "MEMORY: 640KB OK",
    "LOADING VIBE OS...",
    "DECOMPRESSING LOFI.SYS... OK",
    "CONNECTING TO ETHER-REALM... CONNECTED.",
    "SYNCING... AUDIO_STREAMS... READY.",
    "USER_INTERFACE... READY.",
    "SYSTEM BOOT COMPLETE.",
  ];

  useEffect(() => {
    let lineIndex = 0;
    const lineInterval = setInterval(() => {
      if (lineIndex < bootSequence.length) {
        setLines(prev => [...prev, bootSequence[lineIndex]]);
        lineIndex++;
      } else {
        clearInterval(lineInterval);
        const progressInterval = setInterval(() => {
          setProgress(p => {
            if (p >= 100) {
              clearInterval(progressInterval);
              setTimeout(() => {
                setShowPrompt(true);
                onFinished();
              }, 200);
              return 100;
            }
            return p + 20;
          });
        }, 20);
      }
    }, 20);

    return () => {
      clearInterval(lineInterval);
    };
  }, [onFinished]);

  const progressBar = `[${'█'.repeat(progress / 4)}${'░'.repeat(25 - progress / 4)}] ${progress}%`;

  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-end md:items-start justify-center md:justify-start p-4 md:p-8">
      <div className="font-mono text-sm md:text-base text-primary w-full max-w-lg md:max-w-2xl bg-black/50 p-4 rounded-lg border border-primary/20">
        <pre className="text-accent text-xs md:text-sm whitespace-pre-wrap mb-4">
{`
    ██╗░░██╗██╗██╗░░░██╗██████╗░░█████╗░
    ██║░░██║██║╚██╗░██╔╝██╔══██╗██╔══██╗
    ███████║██║░╚████╔╝░██║░░██║██║░░██║
    ██╔══██║██║░░╚██╔╝░░██║░░██║██║░░██║
    ██║░░██║██║░░░██║░░░██████╔╝╚█████╔╝
    ╚═╝░░╚═╝╚═╝░░░╚═╝░░░╚═════╝░░╚════╝░
    .... FOCUSFLOW SYSTEM v1.9.8.4 ....
`}
        </pre>
        {lines.map((line, i) => (
          <p key={i}>
            <span className="text-accent">&gt;</span> {line}
          </p>
        ))}
        {lines.length === bootSequence.length && (
          <div>
            <p><span className="text-accent">&gt;</span> FINALIZING...</p>
            <p className="mt-2">{progressBar}</p>
          </div>
        )}
        {showPrompt && (
          <p className="text-lg text-center mt-4 animate-pulse">
            Click or Press any key to begin
          </p>
        )}
      </div>
    </div>
  );
};


interface Station {
  name: string;
  id: string; // YouTube Video ID for audio
  backgroundUrl: string;
  backgroundType: 'image' | 'video';
}

const loadingMessages = [
  "Finding vibes...",
  "Tuning frequencies...",
  "Syncing to the chillwave...",
  "Booting up the soundscape...",
  "Connecting to the Lofi-verse...",
  "Reticulating splines...",
];

const MusicPlayer = ({ isPlaying, togglePlay, nextTrack, currentTrack, volume, setVolume, glitchClass, isLoading, onPomodoroToggle, isPomodoroOpen, loadingMessage }) => (
  <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm text-sm z-20">
    <div className="max-w-7xl mx-auto flex items-center gap-4 text-white font-mono">
       <div className="flex items-center gap-2">
        <Button onClick={togglePlay} size="icon" variant="ghost" className="w-8 h-8 text-primary hover:text-accent-foreground hover:bg-accent" disabled={isLoading}>
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>
        <Button onClick={nextTrack} size="icon" variant="ghost" className="w-8 h-8 text-primary hover:text-accent-foreground hover:bg-accent" disabled={isLoading}>
          <SkipForward size={20} />
        </Button>
      </div>
      <div className="flex items-center gap-2 w-32">
        <Volume2 className="text-primary" />
        <Slider value={[volume]} onValueChange={(value) => setVolume(value[0])} max={100} step={1} disabled={isLoading} />
      </div>
      <div className={cn("flex-grow flex items-center gap-2", glitchClass)}>
        {isLoading ? <Loader size={20} className="text-primary animate-spin" /> : <ListMusic size={20} className="text-primary" />}
        <p className="truncate">{isLoading ? loadingMessage : currentTrack?.name || "No station selected"}</p>
      </div>
       <Button 
        onClick={onPomodoroToggle} 
        size="icon" 
        variant="secondary" 
        className="w-8 h-8 text-primary bg-primary/10 hover:bg-primary/20"
      >
          <Bell size={20} className={cn(isPomodoroOpen && "icon-shadow-neon-primary")} />
        </Button>
    </div>
  </div>
);


export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicStreams, setMusicStreams] = useState<Station[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(50);
  const [glitchClass, setGlitchClass] = useState('');
  const [listeners, setListeners] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  
  // Pomodoro State
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(TIMES.work);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [workSessions, setWorkSessions] = useState(0);
  const [isTimerFinished, setIsTimerFinished] = useState(false);

  const playerRef = useRef<YouTubePlayer | null>(null);

  const switchTimerMode = useCallback((newMode: TimerMode) => {
    setIsTimerActive(false);
    setTimerMode(newMode);
    setTimeLeft(TIMES[newMode]);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
        setIsTimerActive(false);
        setIsTimerFinished(true);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerActive, timeLeft]);


  const handleTimerCompletion = () => {
    if (timerMode === 'work') {
      const newWorkSessions = workSessions + 1;
      setWorkSessions(newWorkSessions);
      if (newWorkSessions % 4 === 0) {
        switchTimerMode('longBreak');
      } else {
        switchTimerMode('shortBreak');
      }
    } else {
      switchTimerMode('work');
    }
  }

  const toggleTimerActive = () => {
    setIsTimerActive(prev => !prev);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeLeft(TIMES[timerMode]);
  };

  const handleFirstInteraction = useCallback(() => {
    if (!canStart || isStarted) return;
    setIsStarted(true);
    setIsPlaying(false);
  }, [canStart, isStarted]);
  
  useEffect(() => {
    const handleInteraction = () => {
        handleFirstInteraction();
        window.removeEventListener('keydown', handleInteraction);
        window.removeEventListener('click', handleInteraction);
    }
    if (canStart) {
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('click', handleInteraction);
    }
    return () => {
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, [handleFirstInteraction, canStart]);

  useEffect(() => {
    const stations: Station[] = [
      { 
        name: 'Morning Lofi', 
        id: 'jfKfPfyJRdk',
        backgroundUrl: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTRuNjRvYWk0bW9kdTdxdml3NTE0Zm9jMnVicmlkYnNpcXA4N2VxMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xWMPYx55WNhX136T0V/giphy.gif',
        backgroundType: 'image'
      },
      { 
        name: 'Cafe Lofi', 
        id: 'UI5NKkW8acM',
        backgroundUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHJwY2I5a2ZidGt2NzV1cDI0bm9kaWcybXI2MW13ZmRpeXFrcm5ubCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pVGsAWjzvXcZW4ZBTE/giphy.gif',
        backgroundType: 'image'
      },
      {
        name: 'waterfall stream flow',
        id: 'qHXFLsnKDq0',
        backgroundUrl: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjh1ZnVxZmw1ZHM4bzNjNmNmbzNwZGZvZW9zMHNucDJmcTd2NTQ3aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JUwa2qSoTwcxv0gFJh/giphy.gif',
        backgroundType: 'image'
      },
      {
        name: 'baroque classical music',
        id: '2gO1v2GPMFk',
        backgroundUrl: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGZmdmx0YjlrdjV0Z3J2MXhvOHV0eXVpanl0anhoMzB6eWllejNnaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1yld7nW3oQ2IyRubUm/giphy.gif',
        backgroundType: 'image'
      }
    ];
    setMusicStreams(stations);
    setCurrentTrackIndex(0);
  }, []);

  useEffect(() => {
    if(!isStarted) return;
    const initialListeners = Math.floor(Math.random() * 10) + 1;
    setListeners(initialListeners);

    const interval = setInterval(() => {
      setListeners(l => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newListeners = l + change;
        return Math.max(1, newListeners);
      });
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [isStarted]);
  
  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume);
    setIsLoading(false);
    if(isStarted && isPlaying) {
      playerRef.current.playVideo();
    }
  };
  
  useEffect(() => {
    if (playerRef.current) {
        playerRef.current.setVolume(volume);
    }
  }, [volume]);
  
  const togglePlay = () => {
    if (!isStarted){
      handleFirstInteraction();
      setIsPlaying(true);
      return;
    }
    if (!playerRef.current) return;
    setIsPlaying(prev => !prev);
  }

  useEffect(() => {
    if (!playerRef.current || !isStarted) return;
    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying, isStarted]);

  const nextTrack = () => {
    if (musicStreams.length <= 1) return;
    if (playerRef.current) {
      playerRef.current.stopVideo();
    }
    setIsLoading(true);
    setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    setGlitchClass('glitch-active');
    setTimeout(() => setGlitchClass(''), 300);
    setCurrentTrackIndex(prev => (prev + 1) % musicStreams.length);
  };
  
  const currentStation = musicStreams[currentTrackIndex];

  return (
    <>
      <main className="min-h-screen flex flex-col relative overflow-hidden font-mono text-primary bg-black">
         <div style={{ display: 'none' }}>
           {currentStation && (
              <YouTube
                videoId={currentStation.id}
                opts={{
                  height: '0',
                  width: '0',
                  playerVars: {
                    autoplay: (isStarted && isPlaying) ? 1 : 0,
                  },
                }}
                onReady={onPlayerReady}
                onStateChange={(e) => {
                  if (e.data === 0) { // Video ended
                     nextTrack();
                  }
                }}
                key={currentStation.id}
              />
           )}
         </div>
        
        <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
          {currentStation?.backgroundType === 'video' ? (
            <video
              key={currentStation.backgroundUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              src={currentStation.backgroundUrl}
            />
          ) : currentStation && (
             <Image
                src={currentStation.backgroundUrl}
                alt="Lofi background"
                layout="fill"
                objectFit="cover"
                unoptimized={currentStation.backgroundUrl.endsWith('.gif')}
              />
          )}
        </div>

        {!isStarted && <TerminalLoader onFinished={() => setCanStart(true)} />}

        {isStarted && (
        <>
          <header className="flex justify-between items-center w-full max-w-7xl mx-auto p-4 text-sm z-10 mt-8">
            <p>listening now {listeners}</p>
            <div className="flex items-center gap-3">
              <Share2 size={18} className="cursor-pointer hover:text-accent" />
              <Facebook size={18} className="cursor-pointer hover:text-accent" />
              <Twitter size={18} className="cursor-pointer hover:text-accent" />
              <Heart size={18} className="cursor-pointer hover:text-accent" />
            </div>
          </header>
          
          <PomodoroProgress 
            isOpen={!isPomodoroOpen}
            isActive={isTimerActive}
            timeLeft={timeLeft}
            totalTime={TIMES[timerMode]}
          />

          <MusicPlayer 
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            nextTrack={nextTrack}
            currentTrack={musicStreams[currentTrackIndex]}
            volume={volume}
            setVolume={setVolume}
            glitchClass={glitchClass}
            isLoading={isLoading}
            onPomodoroToggle={() => setIsPomodoroOpen(p => !p)}
            isPomodoroOpen={isPomodoroOpen}
            loadingMessage={loadingMessage}
          />

          <PomodoroTimer
            isOpen={isPomodoroOpen}
            onClose={() => setIsPomodoroOpen(false)}
            mode={timerMode}
            setMode={switchTimerMode}
            timeLeft={timeLeft}
            isActive={isTimerActive}
            toggleTimer={toggleTimerActive}
            resetTimer={resetTimer}
            workSessions={workSessions}
          />

          <TimerFinishedAlert 
             open={isTimerFinished}
             onOpenChange={setIsTimerFinished}
             title={timerMode === 'work' ? 'Work Session Over' : 'Break Over'}
             description={timerMode === 'work' ? 'Time for a break!' : 'Time to get back to work!'}
             onConfirm={() => {
                setIsTimerFinished(false);
                handleTimerCompletion();
             }}
          />
        </>
        )}
      </main>
    </>
  );
}
