"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Facebook, Twitter, Heart, ListMusic, Play, Pause, SkipForward, Volume2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'react-youtube';

const VhsOverlay = ({ enabled }: { enabled: boolean }) => {
  if (!enabled) return null;
  return <div className="vhs-overlay fixed inset-0 pointer-events-none z-50" />;
};

interface Station {
  name: string;
  id: string; // YouTube Video ID
}

const MusicPlayer = ({ isPlaying, togglePlay, nextTrack, currentTrack, volume, setVolume, glitchClass, isLoading }) => (
  <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm text-sm">
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
      <div className={`flex-grow flex items-center gap-2 ${glitchClass}`}>
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
  const [imageUrl, setImageUrl] = useState("https://picsum.photos/1920/1080");

  const playerRef = useRef<YouTubePlayer | null>(null);
  
  const updateImageUrl = () => {
    const newImageUrl = `https://picsum.photos/1920/1080?random=${Math.random()}`;
    setImageUrl(newImageUrl);
  };

  const handleFirstInteraction = useCallback(() => {
    if (!isStarted) {
      setIsStarted(true);
      setIsPlaying(true);
    }
  }, [isStarted]);
  
  useEffect(() => {
    const handleInteraction = () => {
        handleFirstInteraction();
        window.removeEventListener('keydown', handleInteraction);
        window.removeEventListener('click', handleInteraction);
    }
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('click', handleInteraction);

    return () => {
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, [handleFirstInteraction]);

  useEffect(() => {
    const stations: Station[] = [
      { name: 'SYNTHWAVE Radio 24/7', id: '2pDiJvbaw6E' },
    ];
    setMusicStreams(stations);
    setCurrentTrackIndex(0);
    setIsLoading(false);
  }, []);

  useEffect(() => {
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
  }, []);
  
  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume);
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
    if (!playerRef.current) return;
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
    updateImageUrl();
  };
  
  const currentStation = musicStreams[currentTrackIndex];

  return (
    <>
      <VhsOverlay enabled={true} />
      <main className="min-h-screen flex flex-col relative overflow-hidden font-mono text-primary">
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
              />
           )}
         </div>
         <Image 
          src={imageUrl}
          alt="Retro car interior view with palm trees"
          fill
          quality={85}
          className="object-cover -z-10 transition-opacity duration-1000"
          key={imageUrl}
          data-ai-hint="retro vaporwave"
         />
        <div className="absolute inset-0 bg-purple-900/50 -z-10" />

        {!isStarted && (
           <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50 cursor-pointer">
             <h1 className="text-4xl font-headline text-shadow-neon-accent mb-4 animate-pulse">FocusFlow Retro</h1>
             <p className="text-lg">Click or Press any key to begin</p>
           </div>
        )}

        {isStarted && (
        <>
          <header className="flex justify-between items-center w-full max-w-7xl mx-auto p-4 text-sm">
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
