import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface PasswordModalProps {
  onCorrectPassword: () => void;
}

export default function PasswordModal({ onCorrectPassword }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const correctPassword = 'wedding2024'; // In a real app, this would be stored securely

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      onCorrectPassword();
      // Store in localStorage to persist the authentication
      localStorage.setItem('weddingAuthenticated', 'true');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="bg-gold-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gold-600" />
          </div>
          <h2 className="text-4xl font-script text-gold-600 mb-2">Welcome</h2>
          <p className="text-gray-600">Please enter the password to view our wedding website</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200 premium-border ${
                error ? 'border-red-500 shake' : ''
              }`}
              placeholder="Enter password"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">Incorrect password. Please try again.</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 text-white py-4 rounded-lg hover:bg-gold-600 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2 font-serif tracking-wider"
          >
            <Lock className="w-5 h-5" />
            <span>Enter Website</span>
          </button>
        </form>
      </div>
    </div>
  );
}