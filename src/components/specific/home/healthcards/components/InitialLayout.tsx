import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SIZES } from '@/constants/theme';
import { Stat, HealthStatsProps } from '../types';
import StatCard from './StatCard';
import AddStatModal from './AddStatModal';

type Props = {
  initialStats: Stat[];
  healthProps: HealthStatsProps;
  onAdd: () => void;
};

const InitialLayout: React.FC<Props> = ({ initialStats, healthProps, onAdd }) => (
  <View style={styles.initialContainer}>
    <View style={styles.leftColumn}>
      <StatCard stat={initialStats[0]} healthProps={healthProps} large />
    </View>
    <View style={styles.rightColumn}>
      <View style={[styles.rightCardWrapper, { marginBottom: SIZES.base }]}>
        <StatCard stat={initialStats[1]} healthProps={healthProps} />
      </View>
      <View style={styles.rightCardWrapper}>
        <AddStatModal onPress={onAdd} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  initialContainer: { flexDirection: 'row', padding: SIZES.padding, height: 320 },
  leftColumn: { flex: 0.6, height: '100%' },
  rightColumn: { flex: 0.4 },
  rightCardWrapper: { flex: 1 },
});

export default InitialLayout;
