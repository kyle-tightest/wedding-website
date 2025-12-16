import React, { useState, useRef } from 'react';
import ImpersonatorLeaderboard from './ImpersonatorLeaderboard';

const TARGET_IMAGE = '/img/brent.jpeg'; // Example target image

export default function ImpersonatorChallenge() {
  const [guestName, setGuestName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScore(null); // Reset score when new image is selected
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !guestName) {
      setError('Please provide your name and select a photo.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setScore(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('guestName', guestName);
    formData.append('targetImage', TARGET_IMAGE);

    try {
      const response = await fetch('/api/upload-impersonator', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      const result = await response.json();
      setScore(result.score);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold text-center mb-8 font-display">Impersonator Challenge</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Target Image */}
        <div className="flex flex-col items-center">
          <h3 className="text-2xl font-semibold mb-4">Impersonate This!</h3>
          <div className="w-full max-w-sm bg-gray-200 rounded-lg shadow-lg overflow-hidden">
            <img src={TARGET_IMAGE} alt="Impersonate this" className="w-full h-auto" />
          </div>
        </div>

        {/* User Upload Section */}
        <div className="flex flex-col items-center">
          <h3 className="text-2xl font-semibold mb-4">Upload Your Attempt</h3>
          <form onSubmit={handleSubmit} className="w-full max-w-sm">
            <div className="mb-4">
              <label htmlFor="guestName" className="block text-gray-700 text-sm font-bold mb-2">Your Name</label>
              <input
                type="text"
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your name"
                required
              />
            </div>
            <div
              className="w-full h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-200"
              onClick={triggerFileInput}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Your impersonation" className="max-w-full max-h-full rounded-lg" />
              ) : (
                <span>Click to select a photo</span>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <button
              type="submit"
              disabled={isUploading || !selectedFile || !guestName}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4 disabled:bg-gray-400"
            >
              {isUploading ? 'Analyzing...' : 'Submit Impersonation'}
            </button>
          </form>

          {/* Score Display */}
          {score !== null && (
            <div className="mt-8 text-center">
              <h4 className="text-2xl font-semibold">Your Score:</h4>
              <p className="text-6xl font-bold text-green-500">{score}%</p>
              <p className="text-gray-600">Great attempt!</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 text-center text-red-500">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}
        </div>
      </div>
      <ImpersonatorLeaderboard />
    </div>
  );
}
