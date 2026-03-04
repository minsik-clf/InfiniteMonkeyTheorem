import { useEffect, useRef } from 'react';

import { useGameStore } from '@/stores/gameStore';

export function useGameLoop() {
  const tick = useGameStore((s) => s.tick);
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    const interval = setInterval(() => tickRef.current(), 1000);
    return () => clearInterval(interval);
  }, []);
}
