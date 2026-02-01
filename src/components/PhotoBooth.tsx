import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X, Check, Loader2, AlertCircle, Wand2, ZoomIn, ZoomOut } from "lucide-react";

const CAMERA_SOUND = "/audio/camera.mp3";

const FILTERS = [
  { name: "Normal", filter: "none" },
  { name: "B&W", filter: "grayscale(100%)" },
  { name: "Sepia", filter: "sepia(100%)" },
  { name: "Beautify", filter: "brightness(112%) contrast(108%) saturate(125%) blur(0.6px) sepia(10%)" },
  { name: "Sparkle", filter: "brightness(105%) saturate(110%)" },
];

const SparklesOverlay = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            scale: 0,
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%"
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 1.5 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut"
          }}
          className="absolute w-4 h-4 text-yellow-200/60"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraAudioRef = useRef<HTMLAudioElement>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [useRearCamera, setUseRearCamera] = useState(true);
  const [rearCameraAvailable, setRearCameraAvailable] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const activeStreamRef = useRef<MediaStream | null>(null);

  // Detect rear camera availability on mount
  useEffect(() => {
    async function checkRearCamera() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasRear = devices.some(
          (d) =>
            d.kind === "videoinput" &&
            (d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("rear") ||
              d.label.toLowerCase().includes("environment"))
        );
        setRearCameraAvailable(hasRear);
        setUseRearCamera(hasRear); // default to rear if available
      } catch {
        setRearCameraAvailable(false);
        setUseRearCamera(false);
      }
    }
    checkRearCamera();
  }, []);

  // Automatically start the camera on mount and when returning to camera view
  useEffect(() => {
    const stopCurrentStream = () => {
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
        activeStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const startCamera = async () => {
      stopCurrentStream();
      setIsCameraLoading(true);
      setCameraError(null);

      try {
        const constraints: MediaStreamConstraints = {
          video: useRearCamera
            ? { facingMode: "environment" }
            : { facingMode: "user" }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Use onloadedmetadata to ensure video is ready before playing
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current?.play();
              setIsCameraLoading(false);

              // Re-check for rear camera availability now that we have permission
              if (!rearCameraAvailable) {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasRear = devices.some(
                  (d) =>
                    d.kind === "videoinput" &&
                    (d.label.toLowerCase().includes("back") ||
                      d.label.toLowerCase().includes("rear") ||
                      d.label.toLowerCase().includes("environment"))
                );
                if (hasRear) setRearCameraAvailable(true);
              }
            } catch (e) {
              console.error("Play error:", e);
            }
          };
        }
      } catch (err: any) {
        console.error("Camera error:", err);
        // Fallback to any camera if specific facing mode fails
        if (useRearCamera) {
          setUseRearCamera(false);
        } else {
          setCameraError("Could not access camera. Please check permissions.");
          setIsCameraLoading(false);
        }
      }
    };

    if (cameraActive) {
      startCamera();
    } else {
      stopCurrentStream();
    }

    return () => {
      stopCurrentStream();
    };
  }, [cameraActive, useRearCamera]);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Get the dimensions of the video display (how it looks on screen)
    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;
    const displayAspectRatio = displayWidth / displayHeight;

    // Get the raw stream dimensions
    const streamWidth = video.videoWidth;
    const streamHeight = video.videoHeight;
    const streamAspectRatio = streamWidth / streamHeight;

    // Set canvas to a generous resolution while maintaining display aspect ratio
    // We want at least 1080p-tier height if possible
    canvas.height = 1920;
    canvas.width = canvas.height * displayAspectRatio;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      let sWidth = streamWidth;
      let sHeight = streamHeight;

      // Logic to mimic object-cover:
      if (streamAspectRatio > displayAspectRatio) {
        sWidth = streamHeight * displayAspectRatio;
      } else if (streamAspectRatio < displayAspectRatio) {
        sHeight = streamWidth / displayAspectRatio;
      }

      // Apply digital zoom to the crop area
      const zoomedSWidth = sWidth / zoomLevel;
      const zoomedSHeight = sHeight / zoomLevel;
      const sX = (streamWidth - zoomedSWidth) / 2;
      const sY = (streamHeight - zoomedSHeight) / 2;

      ctx.filter = selectedFilter.filter;
      ctx.drawImage(video, sX, sY, zoomedSWidth, zoomedSHeight, 0, 0, canvas.width, canvas.height);

      // Add baked-in sparkles if Sparkle filter is active
      if (selectedFilter.name === "Sparkle") {
        for (let i = 0; i < 40; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = 15 + Math.random() * 30;
          const opacity = 0.4 + Math.random() * 0.4;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.random() * Math.PI);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

          // Draw a simple 4-pointed star
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(size * 0.2, -size * 0.2);
          ctx.lineTo(size, 0);
          ctx.lineTo(size * 0.2, size * 0.2);
          ctx.lineTo(0, size);
          ctx.lineTo(-size * 0.2, size * 0.2);
          ctx.lineTo(-size, 0);
          ctx.lineTo(-size * 0.2, -size * 0.2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setPhotoDataUrl(dataUrl);
      setCameraActive(false);

      if (cameraAudioRef.current) {
        cameraAudioRef.current.currentTime = 0;
        cameraAudioRef.current.play();
      }
    }
  };

  const uploadPhoto = async () => {
    if (!photoDataUrl) return;
    setIsUploading(true);
    try {
      await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photoDataUrl }),
      });
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setPhotoDataUrl(null);
        // If rear camera is not available, ensure we use front camera
        if (!rearCameraAvailable) setUseRearCamera(false);
        setCameraActive(true);
      }, 1800);
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const backToCamera = () => {
    setPhotoDataUrl(null);
    // If rear camera is not available, ensure we use front camera
    if (!rearCameraAvailable) setUseRearCamera(false);
    setCameraActive(true);
  };

  const handleSwitchCamera = () => {
    setUseRearCamera((prev) => !prev);
    setCameraActive(false);
    setTimeout(() => setCameraActive(true), 100); // restart camera after switching
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] py-10">
      <audio ref={cameraAudioRef} src={CAMERA_SOUND} preload="auto" />

      <div className="relative flex flex-col items-center justify-center bg-black rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-8 border-gray-800 overflow-hidden"
        style={{ width: 340, height: 680, maxWidth: "95vw" }}>

        {/* Top bar - Glassmorphic notch look */}
        <div className="absolute top-0 left-0 w-full h-12 flex items-center justify-center z-30">
          <div className="w-32 h-6 bg-gray-900 rounded-b-2xl flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
            <div className="w-12 h-1 bg-gray-800 rounded-full" />
          </div>
        </div>

        {/* Camera info */}
        <div className="absolute top-12 left-0 w-full flex items-center justify-between px-6 z-20">
          <div className="text-white text-[10px] font-soul tracking-[0.2em] opacity-60 uppercase">
            Wedding POV
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-[10px] font-soul tracking-[0.1em] uppercase">Live</span>
          </div>
        </div>

        {/* Camera preview */}
        <div className="absolute inset-0 w-full h-full bg-gray-950 overflow-hidden">
          <AnimatePresence mode="wait">
            {!photoDataUrl ? (
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative"
              >
                {isCameraLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10 transition-all duration-300">
                    <Loader2 className="animate-spin h-10 w-10 text-white opacity-80" />
                  </div>
                )}
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-20 px-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <AlertCircle className="h-12 w-12 text-red-500" />
                      <p className="text-white text-sm font-soul leading-relaxed">{cameraError}</p>
                      <button
                        onClick={() => setCameraActive(true)}
                        className="px-6 py-2 bg-white text-black rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
                <video
                  ref={videoRef}
                  className="object-cover w-full h-full transition-transform duration-300 ease-out"
                  style={{
                    filter: selectedFilter.filter,
                    transform: `scale(${zoomLevel})`
                  }}
                  autoPlay
                  playsInline
                  muted
                />
                {selectedFilter.name === "Sparkle" && <SparklesOverlay />}

                {/* Zoom Controls Overlay */}
                {!photoDataUrl && !isCameraLoading && !cameraError && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3.0))}
                      className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-all shadow-lg"
                      aria-label="Zoom In"
                    >
                      <ZoomIn size={16} />
                    </button>
                    <div className="w-8 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[9px] font-bold text-white/90">{zoomLevel.toFixed(1)}x</span>
                    </div>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1.0))}
                      className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-all shadow-lg"
                      aria-label="Zoom Out"
                    >
                      <ZoomOut size={16} />
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full h-full"
              >
                <img
                  src={photoDataUrl as string}
                  alt="Captured"
                  className="object-cover w-full h-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Control Area - Glassmorphism */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-end pb-4 z-30">

          {/* Filters Carousel - Elegant Pop-out */}
          <AnimatePresence>
            {showFilters && !photoDataUrl && !isCameraLoading && !cameraError && (
              <motion.div
                initial={{ y: 30, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 30, opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                className="w-full mb-6 px-4 bg-black/40 backdrop-blur-xl py-4 border-t border-white/5 relative z-20"
              >
                <div className="flex items-center justify-start gap-5 py-2 px-6 overflow-x-auto premium-scrollbar scroll-smooth">
                  {FILTERS.map((filter) => (
                    <button
                      key={filter.name}
                      onClick={() => {
                        setSelectedFilter(filter);
                        setShowFilters(false);
                      }}
                      className="flex flex-col items-center gap-1 group flex-shrink-0"
                    >
                      <div className={`w-12 h-12 rounded-full border-2 transition-all duration-300 overflow-hidden ${selectedFilter.name === filter.name ? "border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]" : "border-white/10 opacity-60 hover:opacity-100"
                        }`}>
                        <div
                          className="w-full h-full bg-gray-500"
                          style={{ filter: filter.filter }}
                        />
                      </div>
                      <span className={`text-[9px] font-soul uppercase tracking-[0.1em] transition-all duration-300 ${selectedFilter.name === filter.name ? "text-white opacity-100 font-bold" : "text-white/40 opacity-70"
                        }`}>
                        {filter.name}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Actions */}
          <div className="flex items-center justify-between px-10 w-full mb-2">
            {!photoDataUrl ? (
              <>
                <div className="w-12 flex justify-start">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`w-12 h-12 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 pointer-events-auto ${showFilters ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" : "bg-white/10 text-white border-white/20 active:scale-90"
                      }`}
                    aria-label="Toggle Filters"
                  >
                    <Wand2 size={24} className={showFilters ? "animate-pulse" : ""} />
                  </button>
                </div>

                <button
                  onClick={takePhoto}
                  className="w-20 h-20 rounded-full bg-white p-1 shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 transition-all relative overflow-hidden group pointer-events-auto z-10"
                  aria-label="Take Photo"
                >
                  <div className="w-full h-full rounded-full border-4 border-black/5 flex items-center justify-center relative z-10">
                    <div className="w-14 h-14 rounded-full bg-black/5 border border-black/10" />
                  </div>
                </button>

                <div className="w-12 flex justify-end">
                  {rearCameraAvailable && (
                    <button
                      onClick={handleSwitchCamera}
                      className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-all pointer-events-auto"
                      aria-label="Switch Camera"
                    >
                      <RefreshCw size={22} />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-12"
              >
                <button
                  onClick={backToCamera}
                  className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-red-500/20 hover:border-red-500/40 active:scale-90 transition-all"
                  aria-label="Retake"
                >
                  <X size={24} />
                </button>

                <button
                  onClick={uploadPhoto}
                  disabled={isUploading}
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-black shadow-xl hover:scale-105 active:scale-90 transition-all disabled:opacity-50"
                  aria-label="Upload"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={32} /> : <Check size={32} strokeWidth={3} />}
                </button>
              </motion.div>
            )}
          </div>

          <div className="h-4" /> {/* Bottom spacer instead of bar */}
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Modal for success */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900 border border-white/10 rounded-3xl p-10 flex flex-col items-center gap-6 shadow-2xl"
              >
                <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                  <Check size={40} className="text-white" strokeWidth={3} />
                </div>
                <div className="text-center">
                  <h3 className="text-white text-2xl font-soul font-bold mb-2">Moments Saved!</h3>
                  <p className="text-white/60 text-sm font-soul tracking-wide">Thank you for sharing your love.</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
