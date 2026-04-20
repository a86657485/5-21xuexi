import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import confetti from "canvas-confetti";

interface CelebrationProps {
  icon: string;
  title: string;
  msg: string;
  nextPage?: string;
  nextLabel?: string;
}

interface ProgressContextType {
  unlocked: number[];
  completed: number[];
  completeLevel: (level: number) => void;
  isUnlocked: (level: number) => boolean;
  isCompleted: (level: number) => boolean;
  resetProgress: () => void;
  stars: number;
  
  // Celebration state
  celebration: CelebrationProps | null;
  showCelebration: (props: CelebrationProps) => void;
  hideCelebration: () => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

const STORAGE_KEY = "jitu_progress";

const defaultState = { unlocked: [1], completed: [] };

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<number[]>(defaultState.unlocked);
  const [completed, setCompleted] = useState<number[]>(defaultState.completed);
  const [celebration, setCelebration] = useState<CelebrationProps | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUnlocked(parsed.unlocked || [1]);
        setCompleted(parsed.completed || []);
      }
    } catch (e) {
      console.error("Failed to load progress from localStorage", e);
    }
  }, []);

  const saveProgress = (newUnlocked: number[], newCompleted: number[]) => {
    setUnlocked(newUnlocked);
    setCompleted(newCompleted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ unlocked: newUnlocked, completed: newCompleted }));
  };

  const completeLevel = (level: number) => {
    const newCompleted = completed.includes(level) ? completed : [...completed, level];
    const newUnlocked = unlocked.includes(level + 1) ? unlocked : [...unlocked, level + 1];
    saveProgress(newUnlocked, newCompleted);
  };

  const resetProgress = () => {
    saveProgress(defaultState.unlocked, defaultState.completed);
  };

  const isUnlocked = (level: number) => level === 1 || unlocked.includes(level);
  const isCompleted = (level: number) => completed.includes(level);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#C8830A','#1E7A5C','#2B65D9','#C0392B','#F5C842','#A78BFA']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#C8830A','#1E7A5C','#2B65D9','#C0392B','#F5C842','#A78BFA']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleShowCelebration = (props: CelebrationProps) => {
    setCelebration(props);
    triggerConfetti();
  };

  return (
    <ProgressContext.Provider
      value={{
        unlocked,
        completed,
        completeLevel,
        isUnlocked,
        isCompleted,
        resetProgress,
        stars: completed.length,
        celebration,
        showCelebration: handleShowCelebration,
        hideCelebration: () => setCelebration(null)
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
