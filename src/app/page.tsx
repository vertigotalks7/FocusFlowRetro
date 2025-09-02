"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Facebook, Twitter, Heart, ListMusic, Play, Pause, SkipForward, Volume2, Loader, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';

const VhsOverlay = ({ enabled }: { enabled: boolean }) => {
  if (!enabled) return null;
  return <div className="vhs-overlay fixed inset-0 pointer-events-none z-50" />;
};

interface Station {
  name: string;
  url: string;
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
        <Slider value={[volume]} onValueChange={(value) => setVolume(value[0])} max={1} step={0.05} disabled={isLoading} />
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
  const [volume, setVolume] = useState(0.5);
  const [glitchClass, setGlitchClass] = useState('');
  const [listeners, setListeners] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [imageUrl, setImageUrl] = useState("https://picsum.photos/1920/1080");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const updateImageUrl = () => {
    // This will generate a new random image URL
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
    window.addEventListener('keydown', handleFirstInteraction);
    return () => {
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [handleFirstInteraction]);


  useEffect(() => {
    const stations: Station[] = [
      { name: 'Lofi Girl - beats to relax/study to', url: 'https://stream.zeno.fm/f835fidaetpuv' },
      { name: 'Chillhop Radio - jazzy & lofi hip hop beats', url: 'https://stream.zeno.fm/upt3dhjfo88uv' },
      { name: 'lofi hip hop radio - beats to sleep/chill to', url: 'https://stream.zeno.fm/3614uhw84p8uv' },
      { name: 'The Bootleg Boy - 24/7 lofi hip hop radio', url: 'https://stream.zeno.fm/1zwd365gretuv' },
      { name: 'Radio Spinner - Lo-Fi', url: 'https://streams.radiospinner.com/lofi-hip-hop-free' },
    ];
    setMusicStreams(stations);
    setCurrentTrackIndex(Math.floor(Math.random() * stations.length));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Simulate listener count
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

  useEffect(() => {
    if (musicStreams.length > 0 && typeof window !== 'undefined') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const currentTrack = musicStreams[currentTrackIndex];
      if (currentTrack) {
        const audio = new Audio(currentTrack.url);
        audio.volume = volume;
        audioRef.current = audio;
        
        if (isPlaying) {
          audio.play().catch(e => {
            console.error("Audio play failed:", e);
            // Autoplay was prevented.
            setIsPlaying(false);
          });
        }
      }
    }
  }, [currentTrackIndex, musicStreams]);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (musicStreams.length === 0 || !audioRef.current) return;
    
    if(!isStarted){
      handleFirstInteraction();
      return;
    }

    setIsPlaying(prev => !prev);
  }

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current?.play().catch(e => {
        console.error("Audio play failed:", e)
        setIsPlaying(false);
      });
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  const nextTrack = () => {
    if (musicStreams.length === 0) return;
    setGlitchClass('glitch-active');
    setTimeout(() => setGlitchClass(''), 300);
    setCurrentTrackIndex(prev => (prev + 1) % musicStreams.length);
    updateImageUrl();
  };
  
  return (
    <>
      <VhsOverlay enabled={true} />
      <main className="min-h-screen flex flex-col relative overflow-hidden font-mono text-primary" onClick={handleFirstInteraction}>
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
           <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50">
             <h1 className="text-4xl font-headline text-shadow-neon-accent mb-4 animate-pulse">FocusFlow Retro</h1>
             <p className="text-lg">Press any key to begin</p>
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
