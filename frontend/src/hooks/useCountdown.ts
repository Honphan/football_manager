import { useState, useEffect, useCallback } from 'react';

interface CountdownResult {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  formattedTime: string;
}

/**
 * Hook for countdown timer
 * @param expiresAt - ISO timestamp when the countdown expires
 * @param onExpire - Optional callback when timer expires
 */
export function useCountdown(
  expiresAt: string | null,
  onExpire?: () => void
): CountdownResult {
  const [totalSeconds, setTotalSeconds] = useState<number>(0);

  const calculateRemainingSeconds = useCallback(() => {
    if (!expiresAt) return 0;

    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const remaining = Math.max(0, Math.floor((expiry - now) / 1000));

    return remaining;
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt) {
      setTotalSeconds(0);
      return;
    }

    // Initial calculation
    setTotalSeconds(calculateRemainingSeconds());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateRemainingSeconds();
      setTotalSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, calculateRemainingSeconds, onExpire]);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isExpired = totalSeconds <= 0 && expiresAt !== null;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    minutes,
    seconds,
    totalSeconds,
    isExpired,
    formattedTime,
  };
}
