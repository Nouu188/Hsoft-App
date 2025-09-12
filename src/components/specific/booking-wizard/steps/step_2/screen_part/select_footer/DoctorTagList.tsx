import React from 'react';
import { View, StyleSheet } from 'react-native';
import DoctorTag from './DoctorTag';
import { Doctor } from '@/components/specific/schedule/appointment/components/doctor_list/DoctorCard';

interface DoctorTagListProps {
  doctors: Doctor[];
  doctorTimes: Record<string, string | undefined>;
  tagWidth: number;
}

const TAG_MARGIN = 6;

const DoctorTagList: React.FC<DoctorTagListProps> = ({ doctors, doctorTimes, tagWidth }) => {
  return (
    <View style={styles.tagContainer}>
      {doctors.map(d => (
        <DoctorTag key={d.id} name={d.name} time={doctorTimes[d.id]} width={tagWidth} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TAG_MARGIN,
  },
});

export default DoctorTagList;