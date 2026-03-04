'use client';

import { useEffect, useState, useCallback } from 'react';

import { MISSIONS } from '@/config/missions';
import { useGameLoop } from '@/hooks/useGameLoop';
import { formatNumber } from '@/lib/format';
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
  const displayLength = target.length;
  // Use id parts for pseudo-random delay
  const monkeyIndex = parseInt(monkey.id.split('-')[1] || '0');
  const animationDelay = `${(monkeyIndex % 5) * 0.2}s`;

  const getMonkeyHue = (batchSize: number) => {
    if (batchSize === 1) return 0;
    if (batchSize < 10) return 45; // bronze/goldish
    if (batchSize < 100) return 180; // cyan
    if (batchSize < 1000) return 270; // purple
    return 320; // pink/magenta
  };

  const currentChars = monkey.showReward
    ? monkey.targetString
    : monkey.targetString.slice(0, typingProgress);

  return (
    <div className="monkey-card">
      <div className="monkey-bubble font-mono">
        {monkey.showReward && monkey.earnedGold > 0 && (
          <div className="floating-reward">
            +{formatNumber(monkey.earnedGold)}G
          </div>
        )}
        {Array.from({ length: displayLength }).map((_, i) => {
          if (i < currentChars.length) {
            const isMatch = currentChars[i] === target[i];
            return (
              <span key={i} className={isMatch ? 'char-match' : 'char-miss'}>
                {currentChars[i]}
              </span>
            );
          }
          return (
            <span key={i} className="char-empty">
              _
            </span>
          );
        })}
      </div>
      <div className="monkey-icon-wrapper">
        <div
          className="monkey-icon"
          style={{
            animationDelay,
            filter: `hue-rotate(${getMonkeyHue(monkey.batchSize)}deg)`,
          }}
        >
          🐒
        </div>
        {monkey.batchSize > 1 && (
          <div className="monkey-batch-badge font-mono">
            x{formatNumber(monkey.batchSize)}
          </div>
        )}
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

export default function Home() {
  const [mounted, setMounted] = useState(false);

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

  if (!mounted) {
    return (
      <div className="game-container">
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
    <div className="game-container">
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

      {/* Center Main Area */}
      <main className="main-area">
        {/* Mission Display */}
        <section className="mission-panel">
          <div className="mission-header">
            <span className="mission-number font-mono">
              MISSION #{mission.id}
            </span>
            {isLastMission && currentMissionIndex > 0 && (
              <span className="mission-final">FINAL</span>
            )}
          </div>
          <div className="mission-label">TARGET</div>
          <div className="mission-target font-mono">{mission.target}</div>
          <div className="mission-meta">
            <span>
              Pool: {mission.charPool.length === 3 ? '○△□' : 'A-Z'} (
              {mission.charPool.length}종)
            </span>
            <span>길이: {mission.target.length}자</span>
            <span>글자당: {formatNumber(mission.goldPerMatch)}G</span>
          </div>
        </section>

        {/* Typing Results - Monkey Grid */}
        <section className="results-panel">
          <div className="results-header">
            <span className="results-title font-mono">&gt; WORKFORCE</span>
            <span className="results-count font-mono">
              {visualMonkeys.length} monkeys
            </span>
          </div>
          <div className="monkey-grid">
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
          <span className="buy-icon">🐒</span>
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
