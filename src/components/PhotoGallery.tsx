import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Starfield from "./Starfield"; // Make sure this import path is correct

type Photo = {
  url: string;
  name: string;
};

// --- Skeleton Loader ---
const SkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-pulse">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="w-full h-48 bg-rose-100/20 rounded-xl"></div>
    ))}
  </div>
);

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<Photo | null>(null);

  // --- Spotlight Effect ---
  const spotlightRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current) return;
      spotlightRef.current.style.background = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, rgba(251, 113, 133, 0.08) 0%, transparent 25%, transparent 100%)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // --- Data Fetching ---
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
      // Simulate loading for a better UX feel
      setTimeout(() => setLoading(false), 1000);
    };
    fetchPhotos();
  }, []);

  // --- 3D Gallery Tilt Effect ---
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 100 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 20); // Tilt range
    y.set(yPct * 20);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Starfield Background */}
      <div className="fixed inset-0 -z-10">
        <Starfield />
      </div>
      {/* Subtle Spotlight */}
      <div ref={spotlightRef} className="fixed inset-0 z-0 pointer-events-none"></div>

      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative max-w-5xl mx-auto py-12 px-4"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          style={{
            transformStyle: "preserve-3d",
            rotateY: springX,
            rotateX: springY,
          }}
        >
          <h1 className="text-4xl font-soul mb-8 text-center drop-shadow-lg tracking-tight text-gray-100">
            POV Photo Gallery
          </h1>
          {loading ? (
            <SkeletonGrid />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6" style={{ transform: "translateZ(20px)" }}>
              {photos.map((photo) => (
                <motion.button
                  key={photo.name}
                  className="group rounded-xl overflow-hidden shadow-lg bg-white/80 focus:outline-none border border-rose-100 hover:border-rose-300"
                  onClick={() => setFullscreenPhoto(photo)}
                  style={{ cursor: "zoom-in" }}
                  aria-label="View full screen"
                  whileHover={{ scale: 1.05, z: 50 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.name}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
          {(!loading && photos.length === 0) && (
            <div className="text-center text-gray-400 mt-12 text-lg italic">No photos found.</div>
          )}
        </motion.div>
      </div>

      {/* --- Fullscreen Modal with Framer Motion --- */}
      <AnimatePresence>
        {fullscreenPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setFullscreenPhoto(null)}
            style={{ cursor: "zoom-out" }}
          >
            <motion.div
              layoutId={`photo-${fullscreenPhoto.name}`}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={fullscreenPhoto.url}
                alt={fullscreenPhoto.name}
                className="rounded-2xl shadow-2xl max-h-[80vh] w-auto h-auto border-4 border-white"
              />
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-white text-center text-lg font-semibold drop-shadow-lg"
              >
                {fullscreenPhoto.name}
              </motion.div>
            </motion.div>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-rose-600/80 transition"
              onClick={() => setFullscreenPhoto(null)}
              aria-label="Close full screen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
