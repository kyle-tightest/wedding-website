import React, { useRef, useState, useEffect } from "react";

const CAMERA_SOUND = "/audio/camera.mp3";

export default function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraAudioRef = useRef<HTMLAudioElement>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [useRearCamera, setUseRearCamera] = useState(true); // default to rear camera
  const [rearCameraAvailable, setRearCameraAvailable] = useState(false);

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
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: useRearCamera
            ? { facingMode: { exact: "environment" } }
            : { facingMode: "user" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        // fallback to front camera if rear is not available
        if (useRearCamera) {
          setUseRearCamera(false);
        }
        console.log("Could not access camera.");
      }
    };
    if (cameraActive) startCamera();

    return () => {
      // Stop camera when leaving camera view
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [cameraActive, useRearCamera]);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPhotoDataUrl(dataUrl);
      setCameraActive(false); // Stop camera after photo
      // Play camera sound
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
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <audio ref={cameraAudioRef} src={CAMERA_SOUND} preload="auto" />
      <div className="relative flex flex-col items-center justify-center bg-black rounded-[2.5rem] shadow-2xl border-4 border-gray-900"
        style={{ width: 320, height: 600, maxWidth: "90vw" }}>
        {/* Top bar */}
        <div className="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-2 z-10">
          <div className="w-6 h-6 rounded-full bg-gray-700" />
          <div className="text-white text-xs font-semibold tracking-widest">PHOTO</div>
          <div className="w-10 h-2 rounded-full bg-gray-700" />
        </div>
        {/* Camera preview */}
        <div className="flex items-center justify-center w-full h-[420px] mt-8 mb-2 overflow-hidden rounded-[2rem] bg-gray-900 border-2 border-gray-800">
          {!photoDataUrl ? (
            <video
              ref={videoRef}
              className="object-cover w-full h-full"
              autoPlay
              playsInline
              width={320}
              height={420}
            />
          ) : (
            <img src={photoDataUrl} alt="Your photo" className="object-cover w-full h-full" />
          )}
        </div>
        {/* Shutter and controls */}
        <div className="absolute bottom-0 left-0 w-full flex flex-col items-center pb-8">
          <div className="flex items-center justify-center gap-8 mb-4">
            {!photoDataUrl ? (
              <>
                <button
                  onClick={takePhoto}
                  className="w-16 h-16 rounded-full bg-white border-4 border-gray-400 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="Take Photo"
                >
                  <span className="block w-8 h-8 rounded-full bg-gray-300" />
                </button>
                {rearCameraAvailable && (
                  <button
                    onClick={handleSwitchCamera}
                    className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-4 border-blue-800 transition-opacity"
                    aria-label="Switch Camera"
                    title={useRearCamera ? "Use Front Camera" : "Use Rear Camera"}
                  >
                    {/* Camera switch icon */}
                    <svg className="w-7 h-7" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M15 7l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M20 12a8 8 0 11-16 0" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={backToCamera}
                  className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-4 border-red-800 transition-opacity"
                  aria-label="Back to Camera"
                >
                  {/* Red X icon */}
                  <svg className="w-7 h-7" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                    <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeLinecap="round" />
                    <line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  onClick={uploadPhoto}
                  disabled={!photoDataUrl || isUploading}
                  className={`w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg border-4 border-green-800 transition-opacity ${!photoDataUrl ? "opacity-50" : ""}`}
                  aria-label="Upload Photo"
                >
                  {/* Green tick icon or spinner */}
                  {isUploading ? (
                    <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                      <polyline points="5 13 10 18 19 7" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
          <div className="w-24 h-2 rounded-full bg-gray-700 mb-2" />
        </div>
        <canvas ref={canvasRef} style={{ display: "none" }} />
        {/* Modal for upload success */}
        {showModal && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center animate-pop">
              <svg className="w-16 h-16 mb-4 text-green-500 animate-bounce-in" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <polyline points="5 13 10 18 19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-2xl font-bold text-green-600 mb-2">Photo Uploaded!</div>
              <div className="text-gray-700 text-center">Thank you for sharing your moment.<br /></div>
            </div>
            <style>
              {`
                @keyframes fade-in {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                .animate-fade-in {
                  animation: fade-in 2.0s ease;
                }
                @keyframes pop {
                  0% { transform: scale(0.7); opacity: 0; }
                  80% { transform: scale(1.1); opacity: 1; }
                  100% { transform: scale(1); opacity: 1; }
                }
                .animate-pop {
                  animation: pop 0.5s cubic-bezier(.4,0,.2,1);
                }
                @keyframes bounce-in {
                  0% { transform: scale(0.5); opacity: 0; }
                  70% { transform: scale(1.2); opacity: 1; }
                  100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-in {
                  animation: bounce-in 0.6s cubic-bezier(.4,0,.2,1);
                }
              `}
            </style>
          </div>
        )}
      </div>
    </div>
  );
}
