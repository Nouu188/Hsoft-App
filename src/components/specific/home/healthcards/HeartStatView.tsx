import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stat, HealthStatsProps } from './types';
import InitialLayout from './components/InitialLayout';
import GridLayout from './components/GridLayout';
import StatPickerModal from './components/StatPickerModal';
import GoalInputModal from './components/GoalInputModal';

// 2 card mặc định ban đầu (bắt buộc có)
const initialStats: Stat[] = [
  {
    key: 'heart',
    title: 'Nhịp tim',
    icon: { name: 'heart-outline', bg: '#FEEEEE', color: '#F38384' },
    getValue: (props) => `${props.heartRate}`, // hiển thị nhịp tim
  },
  {
    key: 'steps',
    title: 'Số bước',
    icon: { name: 'walk-outline', bg: '#ECEAFF', color: '#8862E0' },
    getValue: (props) =>
      `${props.steps.toLocaleString()} / ${props.stepsGoal.toLocaleString()}`, // số bước / mục tiêu
    progress: (props) => props.steps / props.stepsGoal, // tiến độ % số bước
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
  // Dữ liệu sức khỏe hiện tại
  const [healthProps, setHealthProps] = useState<HealthStatsProps>({
    heartRate: 120,
    steps: 5540,
    stepsGoal: 10000,
    sleep: 2,
    calories: 800,
    water: 500,
  });

  // Danh sách các card stat đang hiển thị
  const [stats, setStats] = useState<Stat[]>(initialStats);

  // Trạng thái hiển thị modal chọn stat
  const [showPicker, setShowPicker] = useState(false);

  // Stat đang chờ thêm (chưa xác nhận mục tiêu)
  const [pendingStat, setPendingStat] = useState<Stat | null>(null);

  // Giá trị mục tiêu mà user nhập
  const [goalValue, setGoalValue] = useState<string>('');

  // Xác nhận thêm stat kèm mục tiêu
  const confirmAddWithGoal = () => {
    if (!pendingStat) return;
    const goalKey = (pendingStat.key + 'Goal') as keyof HealthStatsProps;
    const valueKey = pendingStat.key as keyof HealthStatsProps;

    // Cập nhật healthProps kèm mục tiêu
    setHealthProps((prev) => ({
      ...prev,
      [goalKey]: Number(goalValue),
      [valueKey]: (prev[valueKey] as number) || 0,
    }));

    // Thêm stat vào danh sách hiển thị
    setStats((prev) => [...prev, pendingStat]);

    // Reset state
    setPendingStat(null);
    setGoalValue('');
  };

  // Xóa stat (chỉ cho phép xóa stat thêm sau, không xóa 2 card gốc)
  const handleDelete = (key: string) => {
    if (initialStats.some((s) => s.key === key)) return;
    setStats((prev) => prev.filter((s) => s.key !== key));
  };

  // Kiểm tra xem chỉ có 2 card gốc hay đã có thêm stat
  const isInitial = stats.length === initialStats.length;

  return (
    <ScrollView style={styles.screen}>
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
  screen: { flex: 1, backgroundColor: '#F7F8FC' },
});

export default HealthStatsView;
