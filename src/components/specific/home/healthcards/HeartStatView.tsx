import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SIZES } from '@/constants/theme';
import { Stat, HealthStatsProps } from './types';
import StatCard from './components/StatCard';
import AddStatModal from './components/AddStatModal'; 

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
    getValue: (props) => `${props.steps.toLocaleString()} / ${props.stepsGoal.toLocaleString()}`,
    progress: (props) => props.steps / props.stepsGoal,
  },
];

const HealthStatsView = () => {
  const [healthProps, setHealthProps] = useState<HealthStatsProps>({
    heartRate: 10,
    steps: 8540,
    stepsGoal: 10000,
  });

  const [stats, setStats] = useState<Stat[]>(initialStats);
  
  const addNewCard = () => {
    const newCard: Stat = {
      key: `sleep-${stats.length}`,
      title: 'Giấc ngủ',
      icon: { name: 'moon-outline', bg: '#DDEBFF', color: '#3679E1' },
      getValue: () => `7 giờ 30 phút`,
      progress: () => 0.9,
    };
    setStats([...stats, newCard]);
  };

  const renderInitialLayout = () => (
    <View style={styles.initialContainer}>
      <View style={styles.leftColumn}>
        <StatCard stat={stats[0]} healthProps={healthProps} large />
      </View>

      <View style={styles.rightColumn}>
        <View style={styles.rightCardWrapper}>
          <StatCard stat={stats[1]} healthProps={healthProps} />
        </View>
        <View style={styles.rightCardWrapper}>
          <AddStatModal onPress={addNewCard} />
        </View>
      </View>
    </View>
  );

  const renderGridLayout = () => (
    <View style={styles.gridContainer}>
      {stats.map((stat) => (
        <View key={stat.key} style={styles.gridCardWrapper}>
          <StatCard stat={stat} healthProps={healthProps} />
        </View>
      ))}
      <View style={styles.gridCardWrapper}>
        {/* BƯỚC 2: Sử dụng component AddStatModal */}
        <AddStatModal onPress={addNewCard} />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.screen}>
      {stats.length === initialStats.length ? renderInitialLayout() : renderGridLayout()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  initialContainer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    height: 320,
  },
  leftColumn: {
    flex: 0.6,
    paddingRight: SIZES.base,
    height: '97%',
  },
  rightColumn: {
    flex: 0.4,
    paddingLeft: SIZES.base,
  },
  rightCardWrapper: {
    flex: 1,
    paddingBottom: SIZES.base,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: SIZES.padding,
  },
  gridCardWrapper: {
    width: '48%',
    height: 160,
    marginBottom: SIZES.base * 2,
  },
});

export default HealthStatsView;