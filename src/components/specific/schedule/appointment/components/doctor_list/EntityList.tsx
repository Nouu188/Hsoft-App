import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import EntityCard, { Entity } from './EntityCard';

interface EntityListProps {
  entities: Entity[];
  selectedEntities: Entity[];
  onSelectEntity: (entity: Entity) => void;
}

const EntityList: React.FC<EntityListProps> = ({ entities, selectedEntities, onSelectEntity }) => {
  const renderItem = ({ item }: { item: Entity }) => {
    const isSelected = !!selectedEntities.find(e => e.id === item.id);
    return (
      <EntityCard
        entity={item}
        selected={isSelected}
        onSelectEntity={onSelectEntity}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={entities}
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

export default EntityList;
