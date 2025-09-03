"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Facebook, Twitter, Heart, ListMusic, Play, Pause, SkipForward, Volume2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';
import { cn } from '@/lib/utils';

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

const MusicPlayer = ({ isPlaying, togglePlay, nextTrack, currentTrack, volume, setVolume, glitchClass, isLoading }) => (
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
        <p className="truncate">{isLoading ? "Finding vibes..." : currentTrack?.name || "No station selected"}</p>
      </div>
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

  const playerRef = useRef<YouTubePlayer | null>(null);

  const handleFirstInteraction = useCallback(() => {
    if (!canStart || isStarted) return;
    setIsStarted(true);
    setIsPlaying(true);
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
        name: 'Retro Drive Lofi', 
        id: '2pDiJvbaw6E',
        backgroundUrl: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExa2NlbHZhaDU0a3ppMXU0MmE5bHZ5bzhvczExZG4zOTJ6c3E3cWFwZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xWMPYx55WNhX136T0V/giphy.gif',
        backgroundType: 'image'
      },
      { 
        name: 'Snowy City Lofi', 
        id: 'UI5NKkW8acM',
        backgroundUrl: 'https://cdn.pixabay.com/video/2024/12/19/247740_large.mp4',
        backgroundType: 'video'
      },
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
      return;
    }
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
                    autoplay: isStarted ? 1 : 0,
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
                unoptimized
              />
          )}
        </div>

        {!isStarted && <TerminalLoader onFinished={() => setCanStart(true)} />}

        {isStarted && (
        <>
          <header className="flex justify-between items-center w-full max-w-7xl mx-auto p-4 text-sm z-10">
            <p>listening now {listeners}</p>
            <div className="flex items-center gap-3">
              <Share2 size={18} className="cursor-pointer hover:text-accent" />
              <Facebook size={18} className="cursor-pointer hover:text-accent" />
              <Twitter size={18} className="cursor-pointer hover:text-accent" />
              <Heart size={18} className="cursor-pointer hover:text-accent" />
            </div>
          </header>

          <MusicPlayer 
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            nextTrack={nextTrack}
            currentTrack={musicStreams[currentTrackIndex]}
            volume={volume}
            setVolume={setVolume}
            glitchClass={glitchClass}
            isLoading={isLoading}
          />
        </>
        )}
      </main>
    </>
  );
}
