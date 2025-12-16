import React, { useState, useEffect } from 'react';

interface LeaderboardEntry {
  guest_name: string;
  submission_photo_url: string;
  score: number;
}

export default function ImpersonatorLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/get-impersonator-leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const data = await response.json();
        setLeaderboard(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return <div className="text-center p-8">Loading Leaderboard...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <h3 className="text-3xl font-bold text-center mb-6">Top Impersonators</h3>
      {leaderboard.length === 0 ? (
        <p className="text-center text-gray-500">No submissions yet. Be the first!</p>
      ) : (
        <ol className="space-y-4">
          {leaderboard.map((entry, index) => (
            <li key={index} className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
              <span className="text-2xl font-bold text-gray-500 w-8">{index + 1}.</span>
              <img src={entry.submission_photo_url} alt={entry.guest_name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-300" />
              <div className="flex-grow">
                <p className="font-semibold text-lg">{entry.guest_name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-500">{entry.score}%</p>
                <p className="text-sm text-gray-500">Score</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
