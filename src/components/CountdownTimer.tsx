"use client";

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  onReset?: () => void;
}

export default function CountdownTimer({ onReset }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  const [isResetting, setIsResetting] = useState(false);

  const calculateTimeLeft = () => {
    const now = new Date();
    
    // Convert to Pacific Time
    const pacificTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
    
    // Set target time to 9:00 AM Pacific today
    const target = new Date(pacificTime);
    target.setHours(9, 0, 0, 0);
    
    // If it's already past 9 AM today, set target to 9 AM tomorrow
    if (pacificTime >= target) {
      target.setDate(target.getDate() + 1);
    }
    
    const difference = target.getTime() - pacificTime.getTime();
    
    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    }
    
    return { hours: 0, minutes: 0, seconds: 0 };
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('/api/daily-reset', {
        method: 'POST',
      });
      
      if (response.ok) {
        console.log('Daily reset completed successfully');
        onReset?.();
      } else {
        console.error('Daily reset failed');
      }
    } catch (error) {
      console.error('Error triggering daily reset:', error);
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // Check if we've reached zero
      if (newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        handleReset();
      }
    }, 1000);

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center border-t border-gray-200 pt-4">
      <p className="text-sm font-light lowercase tracking-wide text-gray-600 mb-2">new question in</p>
      <div className="flex justify-center items-center space-x-4">
        <div className="text-center">
          <div className="text-lg font-medium text-black">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-xs text-gray-500 lowercase">hours</div>
        </div>
        <div className="text-gray-400">:</div>
        <div className="text-center">
          <div className="text-lg font-medium text-black">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-xs text-gray-500 lowercase">minutes</div>
        </div>
        <div className="text-gray-400">:</div>
        <div className="text-center">
          <div className="text-lg font-medium text-black">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-xs text-gray-500 lowercase">seconds</div>
        </div>
      </div>
      {isResetting && (
        <p className="text-xs text-blue-600 mt-2 lowercase">resetting...</p>
      )}
    </div>
  );
} 