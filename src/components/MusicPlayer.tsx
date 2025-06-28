import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music4, Minus } from 'lucide-react';

const playlist = [
  {
    title: "Kiss Me",
    artist: "Sixpence None The Richer",
    src: "/music/kiss-me.mp3",
  },
  {
    title: "Perfect",
    artist: "Ed Sheeran",
    src: "/music/perfect.mp3",
  },
  {
    title: "All of Me",
    artist: "John Legend",
    src: "/music/all-of-me.mp3",
  },
  // You can add more of your favorite songs here!
];

const MusicPlayer = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  if (!isPlayerVisible) {
    return (
      <button
        key="player-icon"
        onClick={() => {
          setIsPlayerVisible(true);
          setIsPlaying(true); // Start playing automatically when opened
        }}
        className="fixed bottom-8 right-8 bg-red-500 text-white p-4 rounded-full shadow-lg z-50 transform hover:scale-110 transition-transform duration-300 animate-pulse"
        aria-label="Open Music Player"
      >
        <Music4 size={24} />
      </button>
    );
  }

  return (
    <div key="player-full" className="fixed bottom-8 right-8 bg-white bg-opacity-90 backdrop-blur-md rounded-lg shadow-2xl p-4 w-80 z-50 premium-border card-premium animate-fade-in-fast">
      <audio ref={audioRef} src={currentTrack.src} onEnded={handleEnded} preload="auto" />
      <div className="flex items-center justify-between mb-3">
        <div className="flex-grow min-w-0">
          <p className="font-bold text-gray-800 truncate">{currentTrack.title}</p>
          <p className="text-sm text-gray-600 truncate">{currentTrack.artist}</p>
        </div>
        <button onClick={handleClosePlayer} className="text-gray-500 hover:text-red-500 ml-2 flex-shrink-0" aria-label="Minimize player">
          <Minus size={20} />
        </button>
      </div>
      <div className="flex items-center justify-center space-x-6">
        <button onClick={handlePrevTrack} className="text-gray-700 hover:text-red-500 transition-colors">
          <SkipBack size={24} />
        </button>
        <button onClick={handlePlayPause} className="bg-red-500 text-white rounded-full p-4 transform hover:scale-110 transition-transform">
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
        <button onClick={handleNextTrack} className="text-gray-700 hover:text-red-500 transition-colors">
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;