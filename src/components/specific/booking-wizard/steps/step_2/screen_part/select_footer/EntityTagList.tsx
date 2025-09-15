import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Entity } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';
import EntityTag from './EntityTag';

interface EntityTagListProps {
  entities: Entity[];
  entityTimes: Record<string, string | undefined>;
  tagWidth: number;
}

const TAG_MARGIN = 6;

const EntityTagList: React.FC<EntityTagListProps> = ({ entities, entityTimes, tagWidth }) => {
  return (
    <View style={styles.tagContainer}>
      {entities.map((entity) => (
        <EntityTag
          key={entity.id}
          entity={entity}
          time={entityTimes[entity.id]}
          width={tagWidth}
        />
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
