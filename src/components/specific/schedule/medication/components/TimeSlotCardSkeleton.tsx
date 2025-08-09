import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

type PlaceholderProps = {
  width: number | string;
  height: number | string;
  style?: object;
};

const Placeholder: React.FC<PlaceholderProps> = ({ width, height, style = {} }) => (
  <View style={[{ width, height, backgroundColor: COLORS.primaryLight, borderRadius: SIZES.radius }, style]} />
);

const TimeSlotCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Placeholder width={140} height={24} />
        <Placeholder width={80} height={24} />
      </View>

      <Placeholder width="100%" height={36} style={{ marginTop: SIZES.padding / 2 }} />
      
      <View style={styles.doseList}>
        <View style={styles.doseItem}>
          <Placeholder width={24} height={24} style={{ borderRadius: 6 }} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Placeholder width="70%" height={16} />
            <Placeholder width="50%" height={14} style={{ marginTop: 6 }} />
          </View>
        </View>
        <View style={styles.doseItem}>
          <Placeholder width={24} height={24} style={{ borderRadius: 6 }} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Placeholder width="60%" height={16} />
            <Placeholder width="40%" height={14} style={{ marginTop: 6 }} />
          </View>
        </View>
      </View>

      <Placeholder width="100%" height={48} style={{ marginTop: SIZES.padding / 2 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    borderWidth: 1.5,
    borderColor: '#E0E7FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SIZES.padding / 2,
  },
  doseList: {
    paddingVertical: SIZES.padding * 0.75,
    borderTopWidth: 1,
    borderTopColor: '#E0E7FF',
    marginTop: SIZES.padding,
  },
  doseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
});

export default TimeSlotCardSkeleton;