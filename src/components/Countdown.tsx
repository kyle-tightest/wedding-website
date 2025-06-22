import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownProps {
  weddingDate: Date;
}

export default function Countdown({ weddingDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +weddingDate - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  return (
    <div className="flex gap-4 justify-center mt-8">
      <div className="bg-glass p-3 sm:p-4 rounded-lg backdrop-blur-md text-center flex-1 min-w-[60px] sm:min-w-[80px]">
        <div className="text-4xl font-bold">{timeLeft.days}</div>
        <div className="text-sm uppercase tracking-wider mt-1">Days</div>
      </div>
      <div className="bg-glass p-3 sm:p-4 rounded-lg backdrop-blur-md text-center flex-1 min-w-[60px] sm:min-w-[80px]">
        <div className="text-4xl font-bold">{timeLeft.hours}</div>
        <div className="text-sm uppercase tracking-wider mt-1">Hours</div>
      </div>
      <div className="bg-glass p-3 sm:p-4 rounded-lg backdrop-blur-md text-center flex-1 min-w-[60px] sm:min-w-[80px]">
        <div className="text-4xl font-bold">{timeLeft.minutes}</div>
        <div className="text-sm uppercase tracking-wider mt-1">Minutes</div>
      </div>
      <div className="bg-glass p-3 sm:p-4 rounded-lg backdrop-blur-md text-center flex-1 min-w-[60px] sm:min-w-[80px]">
        <div className="text-4xl font-bold">{timeLeft.seconds}</div>
        <div className="text-sm uppercase tracking-wider mt-1">Seconds</div>
      </div>
    </div>
  );
}