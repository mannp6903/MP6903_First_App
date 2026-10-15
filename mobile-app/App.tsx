import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
  Habit,
  currentStreak,
  dayKey,
  daysAgo,
  loadHabits,
  newHabit,
  saveHabits,
  toggleDay,
} from './src/habits';

const COLORS = {
  bg: '#F6F7FB',
  card: '#FFFFFF',
  text: '#1B1D29',
  muted: '#7A7F95',
  accent: '#4F6BED',
  accentSoft: '#E3E8FD',
  border: '#E4E6EF',
};

const WEEKDAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function App() {
  return (
    <SafeAreaProvider>
      <HabitsScreen />
    </SafeAreaProvider>
  );
}

function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    loadHabits().then((h) => {
      setHabits(h);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveHabits(habits);
  }, [habits, loaded]);

  // Last 7 days, oldest first, ending today.
  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => daysAgo(6 - i)), []);
  const todayKey = dayKey(week[6]);
  const doneToday = habits.filter((h) => h.doneDates.includes(todayKey)).length;

  const addHabit = () => {
    const name = draft.trim();
    if (!name) return;
    setHabits((prev) => [...prev, newHabit(name)]);
    setDraft('');
  };

  const toggle = (id: string, key: string) =>
    setHabits((prev) => prev.map((h) => (h.id === id ? toggleDay(h, key) : h)));

  const confirmDelete = (habit: Habit) =>
    Alert.alert('Delete habit?', `"${habit.name}" and its history will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setHabits((prev) => prev.filter((h) => h.id !== habit.id)),
      },
    ]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Daily Habits</Text>
          <Text style={styles.subtitle}>
            {week[6].toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
            {habits.length > 0 && `  ·  ${doneToday}/${habits.length} done`}
          </Text>
        </View>

        <FlatList
          data={habits}
          keyExtractor={(h) => h.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            loaded ? (
              <Text style={styles.empty}>
                No habits yet.{'\n'}Add one below — like "Drink water" or "Read 10 pages".
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <HabitRow
              habit={item}
              week={week}
              onToggle={(key) => toggle(item.id, key)}
              onDelete={() => confirmDelete(item)}
            />
          )}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="New habit"
            placeholderTextColor={COLORS.muted}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={addHabit}
            returnKeyType="done"
            maxLength={40}
          />
          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            onPress={addHabit}
            accessibilityRole="button"
            accessibilityLabel="Add habit"
          >
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function HabitRow({
  habit,
  week,
  onToggle,
  onDelete,
}: {
  habit: Habit;
  week: Date[];
  onToggle: (key: string) => void;
  onDelete: () => void;
}) {
  const streak = currentStreak(habit);
  return (
    <Pressable style={styles.card} onLongPress={onDelete} delayLongPress={400}>
      <View style={styles.cardTop}>
        <Text style={styles.habitName} numberOfLines={1}>
          {habit.name}
        </Text>
        <Text style={styles.streak}>
          {streak} day{streak === 1 ? '' : 's'} 🔥
        </Text>
      </View>
      <View style={styles.week}>
        {week.map((date, i) => {
          const key = dayKey(date);
          const done = habit.doneDates.includes(key);
          const isToday = i === week.length - 1;
          return (
            <Pressable
              key={key}
              onPress={() => onToggle(key)}
              hitSlop={4}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              accessibilityLabel={`${habit.name}, ${date.toDateString()}`}
              style={styles.dayCol}
            >
              <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
                {WEEKDAY[date.getDay()]}
              </Text>
              <View style={[styles.dot, done && styles.dotDone, isToday && styles.dotToday]}>
                {done && <Text style={styles.check}>✓</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.text },
  subtitle: { marginTop: 4, fontSize: 15, color: COLORS.muted },
  list: { padding: 16, gap: 12, flexGrow: 1 },
  empty: {
    marginTop: 80,
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  habitName: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.text },
  streak: { fontSize: 14, fontWeight: '600', color: COLORS.muted, marginLeft: 8 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 6 },
  dayLabel: { fontSize: 12, color: COLORS.muted, fontWeight: '500' },
  todayLabel: { color: COLORS.accent, fontWeight: '800' },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotToday: { borderColor: COLORS.accent, borderWidth: 2 },
  dotDone: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  check: { color: '#fff', fontSize: 16, fontWeight: '800' },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: COLORS.bg,
    color: COLORS.text,
  },
  addButton: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
