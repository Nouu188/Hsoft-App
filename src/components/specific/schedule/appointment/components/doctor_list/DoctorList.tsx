import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import DoctorCard, { Doctor } from './DoctorCard';

interface DoctorListProps {
  doctors: Doctor[];
  selectedDoctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void; // callback mở màn hình chọn giờ
}

const DoctorList: React.FC<DoctorListProps> = ({ doctors, selectedDoctors, onSelectDoctor }) => {
  const renderItem = ({ item }: { item: Doctor }) => {
    const isSelected = !!selectedDoctors.find(d => d.id === item.id);
    return (
      <DoctorCard
        {...item}
        selected={isSelected}
        onSelectDoctor={onSelectDoctor}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={doctors}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 15, paddingVertical: 10 },
});

export default DoctorList;
