import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stat, HealthStatsProps } from './types';
import InitialLayout from './components/InitialLayout';
import GridLayout from './components/GridLayout';
import StatPickerModal from './components/StatPickerModal';
import GoalInputModal from './components/GoalInputModal';
import { useThemeStore } from '@/store/useThemeStore';
import { COLORS } from '@/constants/theme';
import { DARK_COLORS } from '@/constants/theme';

// 2 card mặc định ban đầu (bắt buộc có)
const initialStats: Stat[] = [
  {
    key: 'heart',
    title: 'Nhịp tim',
    icon: { name: 'heart-outline', bg: '#FEEEEE', color: '#F38384' },
    getValue: (props) => `${props.heartRate}`,
  },
  {
    key: 'steps',
    title: 'Số bước',
    icon: { name: 'walk-outline', bg: '#ECEAFF', color: '#8862E0' },
    getValue: (props) =>
      `${props.steps.toLocaleString()} / ${props.stepsGoal.toLocaleString()}`,
    progress: (props) => props.steps / props.stepsGoal,
  },
];

// Các loại stat mà user có thể thêm vào
const availableStats: Stat[] = [
  {
    key: 'sleep',
    title: 'Giấc ngủ',
    icon: { name: 'moon-outline', bg: '#DDEBFF', color: '#3679E1' },
    getValue: (p) => `${p.sleep || 0} / ${p.sleepGoal || 8} giờ`,
    progress: (p) => (p.sleep && p.sleepGoal ? p.sleep / p.sleepGoal : 0),
  },
  {
    key: 'calories',
    title: 'Calo',
    icon: { name: 'flame-outline', bg: '#FFE8D6', color: '#FF7A00' },
    getValue: (p) => `${p.calories || 0} / ${p.caloriesGoal || 2000} kcal`,
    progress: (p) =>
      p.calories && p.caloriesGoal ? p.calories / p.caloriesGoal : 0,
  },
  {
    key: 'water',
    title: 'Nước uống',
    icon: { name: 'water-outline', bg: '#E0F7FA', color: '#00ACC1' },
    getValue: (p) => `${p.water || 0} / ${p.waterGoal || 2000} ml`,
    progress: (p) => (p.water && p.waterGoal ? p.water / p.waterGoal : 0),
  },
];

const HealthStatsView = () => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? DARK_COLORS : COLORS;

  const [healthProps, setHealthProps] = useState<HealthStatsProps>({
    heartRate: 120,
    steps: 5540,
    stepsGoal: 10000,
    sleep: 2,
    calories: 800,
    water: 500,
  });

  const [stats, setStats] = useState<Stat[]>(initialStats);
  const [showPicker, setShowPicker] = useState(false);
  const [pendingStat, setPendingStat] = useState<Stat | null>(null);
  const [goalValue, setGoalValue] = useState<string>('');

  const confirmAddWithGoal = () => {
    if (!pendingStat) return;
    const goalKey = (pendingStat.key + 'Goal') as keyof HealthStatsProps;
    const valueKey = pendingStat.key as keyof HealthStatsProps;

    setHealthProps((prev) => ({
      ...prev,
      [goalKey]: Number(goalValue),
      [valueKey]: (prev[valueKey] as number) || 0,
    }));

    setStats((prev) => [...prev, pendingStat]);
    setPendingStat(null);
    setGoalValue('');
  };

  const handleDelete = (key: string) => {
    if (initialStats.some((s) => s.key === key)) return;
    setStats((prev) => prev.filter((s) => s.key !== key));
  };

  const isInitial = stats.length === initialStats.length;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.background }]}>
      {isInitial ? (
        <InitialLayout
          initialStats={initialStats}
          healthProps={healthProps}
          onAdd={() => setShowPicker(true)}
        />
      ) : (
        <GridLayout
          stats={stats}
          initialStats={initialStats}
          healthProps={healthProps}
          onAdd={() => setShowPicker(true)}
          onDelete={handleDelete}
        />
      )}

      <StatPickerModal
        visible={showPicker}
        availableStats={availableStats}
        onSelect={(s) => {
          setPendingStat(s);
          setShowPicker(false);
        }}
        onClose={() => setShowPicker(false)}
      />

      <GoalInputModal
        visible={!!pendingStat}
        pendingStat={pendingStat}
        goalValue={goalValue}
        setGoalValue={setGoalValue}
        onConfirm={confirmAddWithGoal}
        onCancel={() => setPendingStat(null)}
      />
    </ScrollView>
  );

};

const styles = StyleSheet.create({
  screen: { flex: 1 },
});

export default HealthStatsView;
