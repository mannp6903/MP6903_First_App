import AsyncStorage from '@react-native-async-storage/async-storage';

export type Habit = {
  id: string;
  name: string;
  // Local calendar days the habit was completed, as YYYY-MM-DD.
  doneDates: string[];
};

const STORAGE_KEY = 'habits:v1';

export async function loadHabits(): Promise<Habit[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Habit[]) : [];
  } catch {
    return [];
  }
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function daysAgo(n: number, from: Date = new Date()): Date {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() - n);
  return d;
}

// Consecutive completed days ending today, or ending yesterday if today
// isn't checked yet (so a streak doesn't look broken first thing in the morning).
export function currentStreak(habit: Habit, today: Date = new Date()): number {
  const done = new Set(habit.doneDates);
  let offset = done.has(dayKey(today)) ? 0 : 1;
  let streak = 0;
  while (done.has(dayKey(daysAgo(offset, today)))) {
    streak++;
    offset++;
  }
  return streak;
}

export function toggleDay(habit: Habit, key: string): Habit {
  const doneDates = habit.doneDates.includes(key)
    ? habit.doneDates.filter((d) => d !== key)
    : [...habit.doneDates, key];
  return { ...habit, doneDates };
}

export function newHabit(name: string): Habit {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    doneDates: [],
  };
}
