import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { MISSIONS } from '@/config/missions';

export interface VisualMonkey {
  id: string;
  batchSize: number;
  targetString: string;
  earnedGold: number;
  showReward: boolean;
}

interface PersistedState {
  gold: number;
  monkeyCount: number;
  currentMissionIndex: number;
  bestMatchCount: number;
}

interface TransientState {
  typingProgress: number;
  visualMonkeys: VisualMonkey[];
  showCelebration: boolean;
  lastGoldPerSecond: number;
  completedMissionName: string;
}

interface Actions {
  tick: () => void;
  buyMonkeys: () => void;
  dismissCelebration: () => void;
  resetGame: () => void;
}

export type GameState = PersistedState & TransientState & Actions;

const MONKEY_BASE_COST = 10;
const MONKEY_GROWTH_RATE = 1.04;

export function getMonkeyCostSingle(index: number): number {
  return Math.floor(MONKEY_BASE_COST * Math.pow(MONKEY_GROWTH_RATE, index));
}

export function getPurchaseUnit(count: number): number {
  if (count < 100) return 1;
  const digits = Math.floor(Math.log10(count)) + 1;
  const tier = Math.floor((digits - 1) / 2);
  return Math.pow(10, tier * 2);
}

export function getBulkCost(currentCount: number, unitToBuy: number): number {
  const singleCost = getMonkeyCostSingle(currentCount);
  if (unitToBuy === 1) return singleCost;
  // 100마리: 20배, 1000마리: 30배, 10000마리: 40배 (100배가 아닌 10~20배 수준)
  const multiplier = 10 * Math.log10(unitToBuy);
  return Math.floor(singleCost * multiplier);
}

function getBestMatchCount(batchSize: number, L: number, C: number): number {
  if (batchSize === 1) {
    let matches = 0;
    for (let i = 0; i < L; i++) {
      if (Math.random() < 1 / C) matches++;
    }
    return matches;
  }

  const p = 1 / C;
  const probs = [];
  for (let m = 0; m <= L; m++) {
    let comb = 1;
    for (let i = 1; i <= m; i++) {
      comb = (comb * (L - i + 1)) / i;
    }
    probs.push(comb * Math.pow(p, m) * Math.pow(1 - p, L - m));
  }

  const cdf = new Array(L + 1).fill(0);
  cdf[L] = probs[L];
  for (let m = L - 1; m >= 0; m--) {
    cdf[m] = cdf[m + 1] + probs[m];
  }

  const pMaxGeq = new Array(L + 1).fill(0);
  for (let m = 0; m <= L; m++) {
    // Poisson approximation for extreme batch sizes
    const probLess = Math.exp(-batchSize * cdf[m]);
    pMaxGeq[m] = 1 - probLess;
  }

  const r = Math.random();
  for (let m = L; m >= 0; m--) {
    if (r <= pMaxGeq[m]) {
      return m;
    }
  }
  return 0;
}

function generateStringWithMatches(
  target: string,
  max_m: number,
  charPool: string
): string {
  const L = target.length;
  const matchPositions = new Set<number>();

  // Use Fisher-Yates shuffle approach or simple random sampling for small L
  while (matchPositions.size < max_m) {
    matchPositions.add(Math.floor(Math.random() * L));
  }

  let result = '';
  for (let i = 0; i < L; i++) {
    if (matchPositions.has(i)) {
      result += target[i];
    } else {
      let ch = charPool[Math.floor(Math.random() * charPool.length)];
      while (ch === target[i]) {
        ch = charPool[Math.floor(Math.random() * charPool.length)];
      }
      result += ch;
    }
  }
  return result;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      gold: 0,
      monkeyCount: 1,
      currentMissionIndex: 0,
      bestMatchCount: 0,

      typingProgress: 0,
      visualMonkeys: [],
      showCelebration: false,
      lastGoldPerSecond: 0,
      completedMissionName: '',

      tick: () => {
        set((state) => {
          if (state.currentMissionIndex >= MISSIONS.length) return state;

          const mission = MISSIONS[state.currentMissionIndex];
          const { target, charPool, goldPerMatch, completionBonus } = mission;
          const L = target.length;
          const C = charPool.length;

          let currentProgress = state.typingProgress;

          // If L changed or no monkeys, reset progress
          if (currentProgress > L || state.visualMonkeys.length === 0) {
            currentProgress = 0;
          }

          if (currentProgress === 0 || currentProgress === L) {
            // GENERATE NEW CYCLE
            const numVisual = Math.min(state.monkeyCount, 100);
            const baseBatch = Math.floor(state.monkeyCount / numVisual);
            const remainder = state.monkeyCount % numVisual;

            const newVMonkeys: VisualMonkey[] = [];
            for (let i = 0; i < numVisual; i++) {
              const batchSize = baseBatch + (i < remainder ? 1 : 0);
              const max_m = getBestMatchCount(batchSize, L, C);
              const targetString = generateStringWithMatches(
                target,
                max_m,
                charPool
              );

              let batchGold = 0;
              if (batchSize === 1) {
                batchGold = max_m * goldPerMatch;
                if (max_m === L) batchGold += completionBonus;
              } else {
                batchGold += max_m * goldPerMatch;
                if (max_m === L) batchGold += completionBonus;
                const remaining = batchSize - 1;
                batchGold += remaining * (L / C) * goldPerMatch;
                batchGold += remaining * Math.pow(1 / C, L) * completionBonus;
              }

              newVMonkeys.push({
                id: `vmonkey-${i}-${Date.now()}`,
                batchSize,
                targetString,
                earnedGold: Math.floor(batchGold),
                showReward: false,
              });
            }

            if (L === 1) {
              // Complete immediately
              let cycleGold = 0;
              let foundPerfect = false;
              let cycleMaxMatch = 0;

              const nextVMonkeys = newVMonkeys.map((vm) => {
                cycleGold += vm.earnedGold;
                let matches = 0;
                if (vm.targetString[0] === target[0]) matches++;
                if (matches === 1) foundPerfect = true;
                if (matches > cycleMaxMatch) cycleMaxMatch = matches;

                return { ...vm, showReward: true };
              });

              const nextBestMatch = Math.max(
                state.bestMatchCount,
                cycleMaxMatch
              );
              let nextIndex = state.currentMissionIndex;
              let nextShowCelebration = false;
              let completedName = state.completedMissionName;

              if (foundPerfect) {
                nextIndex = Math.min(
                  state.currentMissionIndex + 1,
                  MISSIONS.length - 1
                );
                nextShowCelebration = true;
                completedName = target;
              }

              return {
                gold: state.gold + cycleGold,
                visualMonkeys: nextVMonkeys,
                typingProgress: 1,
                bestMatchCount: foundPerfect ? 0 : nextBestMatch,
                currentMissionIndex: nextIndex,
                showCelebration: nextShowCelebration,
                lastGoldPerSecond: cycleGold,
                completedMissionName: completedName,
              };
            }

            return {
              visualMonkeys: newVMonkeys,
              typingProgress: 1,
              showCelebration: false,
            };
          } else {
            // ADVANCE CYCLE
            const nextProgress = currentProgress + 1;
            if (nextProgress === L) {
              let cycleGold = 0;
              let foundPerfect = false;
              let cycleMaxMatch = 0;

              const nextVMonkeys = state.visualMonkeys.map((vm) => {
                cycleGold += vm.earnedGold;
                let matches = 0;
                for (let i = 0; i < L; i++) {
                  if (vm.targetString[i] === target[i]) matches++;
                }
                if (matches === L) foundPerfect = true;
                if (matches > cycleMaxMatch) cycleMaxMatch = matches;

                return { ...vm, showReward: true };
              });

              const nextBestMatch = Math.max(
                state.bestMatchCount,
                cycleMaxMatch
              );
              let nextIndex = state.currentMissionIndex;
              let nextShowCelebration = false;
              let completedName = state.completedMissionName;

              if (foundPerfect) {
                nextIndex = Math.min(
                  state.currentMissionIndex + 1,
                  MISSIONS.length - 1
                );
                nextShowCelebration = true;
                completedName = target;
              }

              return {
                gold: state.gold + cycleGold,
                visualMonkeys: nextVMonkeys,
                typingProgress: L,
                bestMatchCount: foundPerfect ? 0 : nextBestMatch,
                currentMissionIndex: nextIndex,
                showCelebration: nextShowCelebration,
                lastGoldPerSecond: cycleGold / L,
                completedMissionName: completedName,
              };
            } else {
              return { typingProgress: nextProgress };
            }
          }
        });
      },

      buyMonkeys: () => {
        const state = get();
        const unit = getPurchaseUnit(state.monkeyCount);
        const cost = getBulkCost(state.monkeyCount, unit);
        if (state.gold >= cost) {
          set({
            gold: state.gold - cost,
            monkeyCount: state.monkeyCount + unit,
          });
        }
      },

      dismissCelebration: () => set({ showCelebration: false }),

      resetGame: () =>
        set({
          gold: 0,
          monkeyCount: 1,
          currentMissionIndex: 0,
          bestMatchCount: 0,
          typingProgress: 0,
          visualMonkeys: [],
          showCelebration: false,
          lastGoldPerSecond: 0,
          completedMissionName: '',
        }),
    }),
    {
      name: 'monkey-game-storage',
      partialize: (state) => ({
        gold: state.gold,
        monkeyCount: state.monkeyCount,
        currentMissionIndex: state.currentMissionIndex,
        bestMatchCount: state.bestMatchCount,
      }),
    }
  )
);
