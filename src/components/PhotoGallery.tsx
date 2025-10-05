import React, { useEffect, useState } from "react";

type Photo = {
  url: string;
  name: string;
};

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/list-pov-photos");
        const data = await res.json();
        setPhotos(data);
      } catch (e) {
        setPhotos([]);
      }
      setLoading(false);
    };
    fetchPhotos();
  }, []);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    if (!fullscreenPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenPhoto(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenPhoto]);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-soul mb-8 text-center drop-shadow-lg tracking-tight font-serif">
          POV Photo Gallery
        </h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-rose-400 border-opacity-50"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <button
                key={photo.name}
                className="group rounded-xl overflow-hidden shadow-lg bg-white focus:outline-none transition-transform hover:scale-105 border border-rose-100 hover:border-rose-300"
                onClick={() => setFullscreenPhoto(photo)}
                style={{ cursor: "zoom-in" }}
                aria-label="View full screen"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition">
                  {photo.name}
                </div>
              </button>
            ))}
          </div>
        )}
        {(!loading && photos.length === 0) && (
          <div className="text-center text-gray-400 mt-12 text-lg italic">No photos found.</div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {fullscreenPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fadein backdrop-blur-sm"
          onClick={() => setFullscreenPhoto(null)}
          style={{ cursor: "zoom-out" }}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-6 right-6 text-white bg-black/60 rounded-full p-3 hover:bg-rose-600/80 transition shadow-lg"
              onClick={() => setFullscreenPhoto(null)}
              aria-label="Close full screen"
            >
              <svg className="w-8 h-8" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeLinecap="round" />
                <line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeLinecap="round" />
              </svg>
            </button>
            <img
              src={fullscreenPhoto.url}
              alt={fullscreenPhoto.name}
              className="rounded-2xl shadow-2xl max-h-[80vh] w-auto h-auto animate-zoomin border-4 border-white"
              style={{ background: "#222" }}
            />
            <div className="mt-6 text-white text-center text-xl font-semibold drop-shadow-lg bg-black/40 px-4 py-2 rounded-lg">
              {fullscreenPhoto.name}
            </div>
          </div>
          <style>
            {`
              @keyframes fadein {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-fadein {
                animation: fadein 0.3s cubic-bezier(.4,0,.2,1);
              }
              @keyframes zoomin {
                from { transform: scale(0.85); opacity: 0; }
                80% { transform: scale(1.05); opacity: 1; }
                to { transform: scale(1); opacity: 1; }
              }
              .animate-zoomin {
                animation: zoomin 0.4s cubic-bezier(.4,0,.2,1);
              }
            `}
          </style>
        </div>
      )}
    </div>
  );
}