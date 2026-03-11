'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

import { PixelMonkey, type TypedShape } from '@/components/game/PixelMonkey';
import { PixelTypewriter } from '@/components/game/PixelTypewriter';
import { MISSIONS } from '@/config/missions';
import { useGameLoop } from '@/hooks/useGameLoop';
import { formatNumber } from '@/lib/format';
import { playMonkeySuccessSound } from '@/lib/sounds';
import {
  useGameStore,
  getPurchaseUnit,
  getBulkCost,
  type VisualMonkey,
} from '@/stores/gameStore';

function CelebrationOverlay({
  missionName,
  onDismiss,
}: {
  missionName: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    playMonkeySuccessSound();
  }, []);

  useEffect(() => {
    const timer = setTimeout(onDismiss, 2500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="celebration-overlay" onClick={onDismiss}>
      <div className="celebration-content">
        <div className="celebration-emoji">🎉</div>
        <div className="celebration-title">MISSION COMPLETE!</div>
        <div className="celebration-target font-mono">
          &quot;{missionName}&quot;
        </div>
        <div className="celebration-sub">완전 일치 달성!</div>
      </div>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="confetti-particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1.5 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  );
}

function MonkeyCard({
  monkey,
  target,
  typingProgress,
}: {
  monkey: VisualMonkey;
  target: string;
  typingProgress: number;
}) {
  const currentChars = monkey.showReward
    ? monkey.targetString
    : monkey.targetString.slice(0, typingProgress);

  const typedShapes: TypedShape[] = Array.from({
    length: currentChars.length,
  }).map((_, i) => {
    const isMatch = currentChars[i] === target[i];
    return {
      shape: isMatch ? ('match' as const) : ('miss' as const),
      symbol: currentChars[i],
    };
  });

  const typing = !monkey.showReward && typingProgress < target.length;

  return (
    <div className="monkey-card relative">
      {/* 원숭이 (위) + 타이핑 표시 */}
      <div className="monkey-icon-wrapper">
        <PixelMonkey
          typing={typing}
          typedShapes={typedShapes}
          earnedGold={monkey.showReward ? monkey.earnedGold : undefined}
        />
        {monkey.batchSize > 1 && (
          <div className="monkey-batch-badge font-mono">
            x{formatNumber(monkey.batchSize)}
          </div>
        )}
      </div>
      {/* 타자기 (아래, 원숭이 바로 앞) */}
      <div className="flex justify-center">
        <PixelTypewriter />
      </div>
    </div>
  );
}

function MissionProgressBar({
  bestMatch,
  targetLength,
}: {
  bestMatch: number;
  targetLength: number;
}) {
  const pct = targetLength > 0 ? (bestMatch / targetLength) * 100 : 0;
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-text">
        최고 {bestMatch}/{targetLength} ({Math.floor(pct)}%)
      </span>
    </div>
  );
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;
const ZOOM_SENSITIVITY = 0.002;

function getTouchDistance(touches: React.TouchList | TouchList): number {
  if (touches.length < 2) return 0;
  const a = touches[0];
  const b = touches[1];
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const pinchStart = useRef({ distance: 0, scale: 1 });

  const gold = useGameStore((s) => s.gold);
  const monkeyCount = useGameStore((s) => s.monkeyCount);
  const currentMissionIndex = useGameStore((s) => s.currentMissionIndex);
  const bestMatchCount = useGameStore((s) => s.bestMatchCount);
  const visualMonkeys = useGameStore((s) => s.visualMonkeys);
  const typingProgress = useGameStore((s) => s.typingProgress);
  const showCelebration = useGameStore((s) => s.showCelebration);
  const lastGoldPerSecond = useGameStore((s) => s.lastGoldPerSecond);
  const completedMissionName = useGameStore((s) => s.completedMissionName);
  const buyMonkeys = useGameStore((s) => s.buyMonkeys);
  const dismissCelebration = useGameStore((s) => s.dismissCelebration);
  const resetGame = useGameStore((s) => s.resetGame);

  useGameLoop();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDismiss = useCallback(() => {
    dismissCelebration();
  }, [dismissCelebration]);

  const handleReset = useCallback(() => {
    if (confirm('게임을 초기화하시겠습니까? (모든 데이터가 삭제됩니다)')) {
      resetGame();
    }
  }, [resetGame]);

  const onPanStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if ('touches' in e && e.touches.length === 2) {
        pinchStart.current = {
          distance: getTouchDistance(e.touches),
          scale,
        };
        return;
      }
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setIsDragging(true);
      dragStart.current = { x: clientX, y: clientY, panX: pan.x, panY: pan.y };
    },
    [pan.x, pan.y, scale]
  );
  const onPanMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length === 2) {
        const dist = getTouchDistance(e.touches);
        if (pinchStart.current.distance > 0) {
          const ratio = dist / pinchStart.current.distance;
          const next = Math.min(
            MAX_ZOOM,
            Math.max(MIN_ZOOM, pinchStart.current.scale * ratio)
          );
          setScale(next);
        }
        return;
      }
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setPan({
        x: dragStart.current.panX + clientX - dragStart.current.x,
        y: dragStart.current.panY + clientY - dragStart.current.y,
      });
    },
    [isDragging]
  );
  const onPanEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener('mousemove', onPanMove);
    window.addEventListener('mouseup', onPanEnd);
    window.addEventListener('touchmove', onPanMove, { passive: true });
    window.addEventListener('touchend', onPanEnd);
    return () => {
      window.removeEventListener('mousemove', onPanMove);
      window.removeEventListener('mouseup', onPanEnd);
      window.removeEventListener('touchmove', onPanMove);
      window.removeEventListener('touchend', onPanEnd);
    };
  }, [isDragging, onPanMove, onPanEnd]);

  const viewportRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const el = viewportRef.current;
      if (!el || !el.contains(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();
      setScale((s) => {
        const delta = -e.deltaY * ZOOM_SENSITIVITY;
        return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s + delta * s));
      });
    };
    document.addEventListener('wheel', onWheel, {
      passive: false,
      capture: true,
    });
    return () =>
      document.removeEventListener('wheel', onWheel, { capture: true });
  }, []);

  const pixelContainerStyle: React.CSSProperties = {
    backgroundColor: '#0d1117',
    color: '#e6edf3',
    fontFamily: '"Press Start 2P", cursive',
    backgroundImage: `
      linear-gradient(rgba(48,54,61,0.3) 1px, transparent 1px),
      linear-gradient(90deg, rgba(48,54,61,0.3) 1px, transparent 1px)
    `,
    backgroundSize: '16px 16px',
  };

  if (!mounted) {
    return (
      <div className="game-container" style={pixelContainerStyle}>
        <div className="loading-screen font-mono">Loading...</div>
      </div>
    );
  }

  const mission = MISSIONS[currentMissionIndex];
  const isLastMission = currentMissionIndex >= MISSIONS.length - 1;
  const unit = getPurchaseUnit(monkeyCount);
  const cost = getBulkCost(monkeyCount, unit);
  const canBuy = gold >= cost;

  return (
    <div
      ref={viewportRef}
      className="game-container"
      style={pixelContainerStyle}
    >
      {/* Top Info Bar */}
      <header className="info-bar">
        <div className="info-item gold-display">
          <span className="info-label">GOLD</span>
          <span className="info-value gold-value font-mono">
            {formatNumber(gold)}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">MONKEYS</span>
          <span className="info-value font-mono">
            {formatNumber(monkeyCount)}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">CYCLES/s</span>
          <span className="info-value font-mono">
            {formatNumber(monkeyCount)}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">GOLD/s</span>
          <span className="info-value gps-value font-mono">
            {formatNumber(lastGoldPerSecond)}
          </span>
        </div>
        <button
          className="reset-button"
          onClick={handleReset}
          title="Reset Game"
        >
          🔄
        </button>
      </header>

      {/* Center: 전체 화면 원숭이 그리드 (드래그·스크롤 줌) */}
      <main
        className="main-viewport"
        onMouseDown={onPanStart}
        onTouchStart={onPanStart}
      >
        {/* 배경: 원숭이 그리드 (드래그 패닝 + 스크롤/핀치 줌) */}
        <div
          className="world-layer"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          }}
          role="presentation"
        >
          <div className="monkey-grid monkey-grid-background">
            {visualMonkeys.length === 0 ? (
              <div className="results-empty font-mono">
                Waiting for typing...
              </div>
            ) : (
              visualMonkeys.map((vm) => (
                <MonkeyCard
                  key={vm.id}
                  monkey={vm}
                  target={mission.target}
                  typingProgress={typingProgress}
                />
              ))
            )}
          </div>
        </div>

        {/* 플로팅: 미션 패널 */}
        <section className="floating-panel mission-panel">
          <div className="mission-header">
            <span className="mission-number font-mono">
              MISSION #{mission.id}
            </span>
            {isLastMission && currentMissionIndex > 0 && (
              <span className="mission-final">FINAL</span>
            )}
          </div>
          <div className="mission-label">TARGET</div>
          <div className="mission-target font-mono symbol-row">
            {Array.from(mission.target).map((char, i) => {
              const filled =
                char === '○'
                  ? '●'
                  : char === '△'
                    ? '▲'
                    : char === '□'
                      ? '■'
                      : char;
              return (
                <span key={i} className="symbol-cell">
                  {filled}
                </span>
              );
            })}
          </div>
          <div className="mission-meta">
            <span>길이: {mission.target.length}자</span>
            <span>글자당: {formatNumber(mission.goldPerMatch)}G</span>
          </div>
        </section>
      </main>

      {/* Bottom Control Area */}
      <footer className="control-area">
        <MissionProgressBar
          bestMatch={bestMatchCount}
          targetLength={mission.target.length}
        />
        <button
          className={`buy-button font-mono ${canBuy ? 'buy-active' : 'buy-disabled'}`}
          onClick={buyMonkeys}
          disabled={!canBuy}
        >
          <span className="buy-icon" style={{ transform: 'scale(0.6)' }}>
            <PixelMonkey iconOnly />
          </span>
          <span className="buy-text">원숭이 +{formatNumber(unit)}</span>
          <span className="buy-cost">{formatNumber(cost)} G</span>
        </button>
      </footer>

      {/* Celebration Overlay */}
      {showCelebration && (
        <CelebrationOverlay
          missionName={completedMissionName}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}
