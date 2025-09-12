import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '@/constants/theme';
import Ionicons from '@react-native-vector-icons/ionicons';

export type TimeSlot = { time: string; isAvailable: boolean };
export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  gender: 'male' | 'female';
  availableTimes: TimeSlot[];
};

interface DoctorCardProps extends Doctor {
  selected?: boolean;
  onSelectDoctor?: (doctor: Doctor) => void;
  onEditDoctor?: (doctor: Doctor) => void; // ✅ thêm prop mới
  variant?: 'select' | 'summary';
  appointmentTime?: string;
}

const maleAvatar: ImageSourcePropType = require('../../../../../../assets/images/male-doctor.png');
const femaleAvatar: ImageSourcePropType = require('../../../../../../assets/images/female-doctor.png');

const getBrightness = (hexColor: string) => {
  const c = hexColor.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
};

const DoctorCard: React.FC<DoctorCardProps> = ({
  id, name, specialty, hospital, gender, availableTimes,
  selected = false, onSelectDoctor, onEditDoctor,
  variant = 'select', appointmentTime,
}) => {
  const avatarSource = gender === 'male' ? maleAvatar : femaleAvatar;

  const handleSelect = () => {
    onSelectDoctor?.({ id, name, specialty, hospital, gender, availableTimes });
  };

  const handleEdit = () => {
    onEditDoctor?.({ id, name, specialty, hospital, gender, availableTimes });
  };

  // 📌 Layout Step 3 (summary)
  if (variant === 'summary') {
    return (
      <View style={styles.summaryCard}>
        <Image source={avatarSource} style={styles.summaryAvatar} />

        <View style={styles.summaryInfo}>
          <Text style={styles.summaryName}>{name}</Text>
          <Text style={styles.summarySub}>
            Chuyên khoa: <Text style={styles.summaryValue}>{specialty}</Text>
          </Text>
          <Text style={styles.summarySub}>
            Lịch hẹn:{' '}
            <Text style={styles.summaryValue}>
              {appointmentTime ?? 'Chưa chọn'}
            </Text>
          </Text>
        </View>

        {/* Nút chỉnh */}
        <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
          <Ionicons name="create-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    );
  }

  // 📌 Layout Step 2 (select)
  const cardGradient = selected
    ? [COLORS.lightBlue, COLORS.primary]
    : [COLORS.primaryLight, COLORS.primary];

  const brightness = getBrightness(cardGradient[0]);
  const textColor = brightness > 180 ? 'black' : 'white';
  const selectBackground = selected ? 'rgba(255,255,255,0.2)' : COLORS.lightBlue;

  return (
    <LinearGradient
      colors={cardGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.info}>
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: textColor }]}>{name}</Text>
          <Text style={[styles.specialty, { color: textColor }]}>{specialty}</Text>
          <Text style={[styles.hospital, { color: textColor }]}>{hospital}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.selectBtn, { backgroundColor: selectBackground }]}
        onPress={handleSelect}
      >
        <Text style={[styles.selectText, { color: selected ? textColor : COLORS.white }]}>
          {selected ? 'Hủy chọn' : 'Chọn'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  info: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  textContainer: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  specialty: { fontSize: 14, marginTop: 2 },
  hospital: { fontSize: 14, marginTop: 2 },
  selectBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  selectText: { fontWeight: 'bold', fontSize: 14 },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  summaryAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  summaryInfo: { flex: 1 },
  summaryName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  summarySub: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  summaryValue: {
    fontWeight: '500',
    color: COLORS.textDark,
  },
  editBtn: {
    padding: 6,
    borderRadius: 6,
    marginLeft: 8,
    alignSelf: 'center',
  },
});

export default DoctorCard;
