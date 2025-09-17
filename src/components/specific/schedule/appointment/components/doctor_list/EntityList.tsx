import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import EntityCard, { Entity } from './EntityCard';

interface EntityListProps {
  entities: Entity[];
  selectedEntities: Entity[];
  onSelectEntity: (entity: Entity) => void;
  entityTimes: Record<string, string | undefined>;
  selectedDate: string;
}

const EntityList = forwardRef<FlatList<Entity>, EntityListProps>(
  ({ entities, selectedEntities, onSelectEntity, entityTimes, selectedDate }, ref) => {
    const flatListRef = useRef<FlatList<Entity>>(null);

    useImperativeHandle(ref, () => flatListRef.current!);

    const renderItem = ({ item }: { item: Entity }) => {
      const timeKey = `${item.id}-${selectedDate}`;
      const isSelected = !!entityTimes[timeKey];
      return <EntityCard entity={item} selected={isSelected} onSelectEntity={onSelectEntity} />;
    };

    return (
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={entities}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 15, paddingVertical: 10 },
});

export default EntityList;
