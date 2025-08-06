// src/components/DoseList.tsx

import { COLORS, SIZES } from "@/constants/theme";
import { useScheduleStore } from "@/store/useScheduleStore";
import { ActivityIndicator, FlatList, StyleSheet, Text, View, TextInput, ScrollView } from "react-native";
import GroupedDoseCard from "./GroupedDoseCard";
import { useState, useMemo } from "react";
import Ionicons from "@react-native-vector-icons/ionicons";

const DoseList: React.FC = () => {
  const groupDosesForSelectedDay = useScheduleStore(state => state.groupDosesForSelectedDay);
  const isLoading = useScheduleStore(state => state.isLoading);
  const error = useScheduleStore(state => state.error);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return groupDosesForSelectedDay;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    
    return groupDosesForSelectedDay.filter(group => 
      group.doses.some(dose => 
        dose.medication_name.toLowerCase().includes(lowercasedQuery)
      )
    );
  }, [groupDosesForSelectedDay, searchQuery]);


  if (isLoading) {
    return (
      <View style={[styles.container, styles.centeredContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
       <View style={[styles.container, styles.centeredContent]}>
        <Text style={styles.errorText}>Lỗi: {error}</Text>
      </View>
    );
  }

  const renderContent = () => {
    if (filteredData.length === 0) {
      return (
        <View style={styles.centeredContent}>
          <Text style={styles.emptyText}>
            {groupDosesForSelectedDay.length > 0
              ? 'Không tìm thấy thuốc phù hợp.'
              : 'Không có lịch uống thuốc cho ngày này.'}
          </Text>
        </View>
      );
    }
    // Dùng .map() để render danh sách
    return filteredData.map(group => <GroupedDoseCard key={group.time} group={group} />);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm thuốc..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search-outline" size={22} color={COLORS.textLight} style={styles.searchIcon} />
      </View>

      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 472,
    backgroundColor: '#d0d8e05a', 
    borderRadius: SIZES.radius * 2,
    marginHorizontal: SIZES.padding * 0.8,
    padding: SIZES.padding * 0.8,
    display: 'flex',
    flexDirection: 'column',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding*0.8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: COLORS.textDark,
  },
  list: {
    flex: 1, 
  },
  centeredContent: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DoseList;