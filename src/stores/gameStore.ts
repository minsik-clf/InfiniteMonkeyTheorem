import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MonkeyState {
  id: string;
  buffer: string[];
}

interface GameState {
  gold: number;
  monkeys: MonkeyState[];
  addGold: (amount: number) => void;
  buyMonkey: () => void;
  updateMonkeyBuffer: (id: string, char: string) => void;
  clearMonkeyBuffer: (id: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      gold: 0,
      monkeys: [{ id: 'monkey-0', buffer: [] }],
      addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
      buyMonkey: () => {
        const currentCost = Math.floor(
          10 * Math.pow(1.5, get().monkeys.length - 1)
        );
        if (get().gold >= currentCost) {
          set((state) => ({
            gold: state.gold - currentCost,
            monkeys: [
              ...state.monkeys,
              { id: `monkey-${Date.now()}`, buffer: [] },
            ],
          }));
        }
      },
      updateMonkeyBuffer: (id, char) =>
        set((state) => {
          const monkey = state.monkeys.find((m) => m.id === id);
          // If buffer is already 3, don't add more until it's cleared
          if (monkey && monkey.buffer.length >= 3) return state;

          return {
            monkeys: state.monkeys.map((m) =>
              m.id === id ? { ...m, buffer: [...m.buffer, char].slice(-3) } : m
            ),
          };
        }),
      clearMonkeyBuffer: (id) =>
        set((state) => ({
          monkeys: state.monkeys.map((m) =>
            m.id === id ? { ...m, buffer: [] } : m
          ),
        })),
    }),
    {
      name: 'monkey-game-storage', // unique name for localStorage key
    }
  )
);

export const getMonkeyCost = (numMonkeys: number) => {
  return Math.floor(10 * Math.pow(1.5, numMonkeys - 1));
};
