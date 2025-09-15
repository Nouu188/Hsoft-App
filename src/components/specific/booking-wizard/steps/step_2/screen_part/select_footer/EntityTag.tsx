import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';
import { Entity } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';

interface EntityTagProps {
  entity: Entity;
  time?: string;
  width: number;
}

const EntityTag: React.FC<EntityTagProps> = ({ entity, time, width }) => {
  const displayName = entity.name || entity.specialty;

  return (
    <View style={[styles.tag, { width }]}>
      <Text style={styles.tagText} numberOfLines={1}>
        {displayName}
        {time ? ` (${time})` : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    backgroundColor: COLORS.lightBlue,
    height: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default EntityTag;
