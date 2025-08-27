import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SIZES } from '@/constants/theme';
import { Stat, HealthStatsProps } from '../types';
import StatCard from './StatCard';
import AddStatModal from './AddStatModal';

type Props = {
  stats: Stat[];
  initialStats: Stat[];
  healthProps: HealthStatsProps;
  onAdd: () => void;
  onDelete: (key: string) => void;
};

const GridLayout: React.FC<Props> = ({ stats, initialStats, healthProps, onAdd, onDelete }) => (
  <View style={styles.gridContainer}>
    {stats.map((stat) => (
      <View key={stat.key} style={styles.gridCardWrapper}>
        <StatCard
          stat={stat}
          healthProps={healthProps}
          onDelete={initialStats.some((s) => s.key === stat.key) ? undefined : onDelete}
        />
      </View>
    ))}
    <View style={styles.gridCardWrapper}>
      <AddStatModal onPress={onAdd} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  gridCardWrapper: {
    width: '48%',
    height: 156,
    marginBottom: SIZES.padding,
  },
});

export default GridLayout;
