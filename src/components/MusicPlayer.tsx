import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music4, Minus, Volume2, Volume1, VolumeX } from 'lucide-react';

const playlist = [
  {
    title: "Kiss Me",
    artist: "Sixpence None The Richer",
    src: "/music/kiss-me.mp3",
  },
  {
    title: "Iris",
    artist: "Goo Goo Dolls",
    src: "/music/iris.mp3",
  },
  {
    title: "Decode (Acoustic)",
    artist: "Paramore",
    src: "/music/decode.mp3",
  },
  // You can add more of your favorite songs here!
];

const Equalizer = () => (
  <div className="flex items-end justify-center w-8 h-8 gap-1">
    <span className="w-1.5 h-full rounded-t-full bg-red-500 animate-wave" style={{ animationDelay: '0.0s' }}></span>
    <span className="w-1.5 h-full rounded-t-full bg-red-500 animate-wave" style={{ animationDelay: '0.2s' }}></span>
    <span className="w-1.5 h-full rounded-t-full bg-red-500 animate-wave" style={{ animationDelay: '0.4s' }}></span>
    <span className="w-1.5 h-full rounded-t-full bg-red-500 animate-wave" style={{ animationDelay: '0.6s' }}></span>
  </div>
);

const MusicPlayer = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);

  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying && isPlayerVisible) {
        audio.play().catch(error => console.log("Playback was prevented. User interaction needed.", error));
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, currentTrackIndex, isPlayerVisible]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // Close volume slider when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeControlRef.current && !volumeControlRef.current.contains(event.target as Node)) {
        setIsVolumeSliderVisible(false);
      }
    };

    if (isVolumeSliderVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVolumeSliderVisible]);

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setTrackProgress(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setTrackDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current || !trackDuration) return;
    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newTime = (offsetX / rect.width) * trackDuration;
    audioRef.current.currentTime = newTime;
    setTrackProgress(newTime);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const volumeBar = e.currentTarget;
    const rect = volumeBar.getBoundingClientRect();
    // Calculate volume from the bottom of the bar (since it's a vertical slider)
    const newVolume = (rect.bottom - e.clientY) / rect.height;
    setVolume(Math.max(0, Math.min(1, newVolume)));
  };

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleNextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };
  
  const handleEnded = () => handleNextTrack();

  const handleClosePlayer = () => {
    setIsPlayerVisible(false);
  };

  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} />;
    if (volume < 0.5) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  if (!isPlayerVisible) {
    return (
      <button
        key="player-icon"
        onClick={() => {
          setIsPlayerVisible(true);
          setIsPlaying(true); // Start playing automatically when opened
        }}
        className="fixed bottom-8 right-8 bg-black text-red-400 p-4 rounded-full shadow-lg z-50 transform hover:scale-110 transition-transform duration-300 animate-pulse"
        aria-label="Open Music Player"
      >
        <Music4 size={24} />
      </button>
    );
  }

  return (
    <div key="player-full" className="fixed bottom-8 right-8 bg-gray-800 text-white rounded-lg shadow-2xl p-4 w-96 z-50 animate-fade-in-fast flex flex-col">
      <audio 
        key={currentTrack.src} 
        ref={audioRef} 
        src={currentTrack.src} 
        onEnded={handleEnded} 
        preload="auto"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
      />
      
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0 mr-4 overflow-hidden">
          {isPlaying ? <Equalizer /> : <Music4 size={32} className="text-gray-400" />}
        </div>
        <div className="flex-grow min-w-0">
          <p className="font-bold text-white truncate">{currentTrack.title}</p>
          <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
        </div>
        <button onClick={handleClosePlayer} className="p-2 -m-2 text-gray-400 hover:text-white rounded-full ml-2 flex-shrink-0 transition-colors" aria-label="Minimize player">
          <Minus size={20} />
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="w-10"></div> {/* Spacer */}
        <div className="flex items-center justify-center space-x-6">
          <button onClick={handlePrevTrack} className="p-2 -m-2 text-gray-400 hover:text-white rounded-full transition-colors">
            <SkipBack size={20} />
          </button>
          <button onClick={handlePlayPause} className="bg-red-500 text-white rounded-full p-4 transform hover:scale-110 transition-transform">
            {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1" />}
          </button>
          <button onClick={handleNextTrack} className="p-2 -m-2 text-gray-400 hover:text-white rounded-full transition-colors">
            <SkipForward size={20} />
          </button>
        </div>
        <div className="w-10 flex justify-end" ref={volumeControlRef}>
          <div className="relative flex items-center">
            <button onClick={() => setIsVolumeSliderVisible(v => !v)} className="p-2 -m-2 text-gray-400 hover:text-white rounded-full transition-colors" aria-label="Adjust volume">
              <VolumeIcon />
            </button>
            <div className={`absolute bottom-full mb-4 p-1 bg-gray-900/70 backdrop-blur-md rounded-lg shadow-lg transition-all duration-200 ease-in-out origin-bottom ${isVolumeSliderVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div 
                onClick={handleVolumeClick}
                className="w-2 h-24 bg-gray-600 rounded-full flex flex-col-reverse cursor-pointer group"
              >
                <div 
                  className="w-full bg-white group-hover:bg-red-500 rounded-full transition-colors duration-200"
                  style={{ height: `${volume * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-xs text-gray-400">
        <span>{formatTime(trackProgress)}</span>
        <div ref={progressBarRef} onClick={handleProgressClick} className="w-full bg-gray-600 rounded-full h-1.5 cursor-pointer group">
          <div 
            className="bg-white group-hover:bg-red-500 rounded-full h-1.5 transition-colors duration-200"
            style={{ width: `${(trackProgress / trackDuration) * 100 || 0}%` }}
          ></div>
        </div>
        <span>{formatTime(trackDuration)}</span>
      </div>
    </div>
  );
};

export default MusicPlayer;