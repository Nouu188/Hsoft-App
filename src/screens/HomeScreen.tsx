import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '../constants/theme';
import HeartProgress from '@/components/specific/home/HeartProgress';

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="menu" size={28} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Med Plus</Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={28} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        {/* Pillo Med Care Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="ellipse" size={30} color={COLORS.primary} style={{transform: [{ rotate: '90deg' }]}}/>
                <View style={{ marginLeft: SIZES.padding / 2 }}>
                    <Text style={styles.cardTitle}>Pillo Med Care</Text>
                    <Text style={styles.cardSubtitle}>1 Tablet</Text>
                </View>
            </View>
            <Ionicons name="ellipsis-vertical" size={24} color={COLORS.textLight} />
          </View>
          <View style={styles.pillButtons}>
            <TouchableOpacity style={[styles.pillButton, styles.pillButtonActive]}>
              <Text style={styles.pillButtonTextActive}>Scheduled 1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pillButton}>
              <Text style={styles.pillButtonText}>As-needed 0</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.listButton}>
            <Text style={styles.listButtonText}>Pillo Med Care list</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Measurement Tracker */}
        <Text style={styles.sectionTitle}>Measurement Tracker</Text>
        <View style={[styles.card, { alignItems: 'center' }]}>
            <View style={[styles.cardHeader, { width: '100%' }]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Ionicons name="heart-outline" size={24} color={COLORS.textDark} />
                    <View style={{marginLeft: 10}}>
                        <Text style={styles.cardTitle}>Heart Health</Text>
                        <Text style={styles.cardSubtitle}>70bpm</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
            <HeartProgress percentage={60} />
        </View>

        {/* Blood Check (Simplified) */}
        <View style={styles.card}>
            <View style={[styles.cardHeader, { width: '100%' }]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Ionicons name="pulse-outline" size={24} color={COLORS.textDark} />
                    <View style={{marginLeft: 10}}>
                        <Text style={styles.cardTitle}>Blood Check</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
            <View style={{height: 60, marginTop: 20}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
  card: { backgroundColor: COLORS.lightGray, borderRadius: SIZES.radius * 1.5, padding: SIZES.padding, margin: SIZES.padding, marginTop: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  cardSubtitle: { fontSize: 14, color: COLORS.textLight },
  pillButtons: { flexDirection: 'row', marginTop: SIZES.padding },
  pillButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.lightGray, marginRight: 10 },
  pillButtonActive: { backgroundColor: COLORS.primary },
  pillButtonText: { color: COLORS.textLight, fontWeight: '500' },
  pillButtonTextActive: { color: COLORS.white, fontWeight: '500' },
  listButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.lightGray, padding: 12, borderRadius: SIZES.radius, marginTop: SIZES.padding },
  listButtonText: { color: COLORS.primary, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, padding: SIZES.padding },
  addButton: { backgroundColor: COLORS.lightGray, padding: 5, borderRadius: 20 },
});

export default HomeScreen;