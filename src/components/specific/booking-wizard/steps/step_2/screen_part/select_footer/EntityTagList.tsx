import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Entity } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';
import EntityTag from './EntityTag';

interface AppointmentItem {
  key: string; // entityId-date (unique per appointment)
  entity: Entity;
  date: string;
  time?: string;
}

interface EntityTagListProps {
  appointments: AppointmentItem[];
  tagWidth: number;
}

const TAG_MARGIN = 6;

const EntityTagList: React.FC<EntityTagListProps> = ({ appointments, tagWidth }) => {
  return (
    <View style={styles.tagContainer}>
      {appointments.map((item) => (
        <EntityTag key={item.key} entity={item.entity} time={item.time} width={tagWidth} />
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

export default EntityTagList;
