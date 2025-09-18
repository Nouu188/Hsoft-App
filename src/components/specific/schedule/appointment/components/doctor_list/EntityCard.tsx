import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SIZES } from '@/constants/theme';
import Ionicons from '@react-native-vector-icons/ionicons';
import EntityModal from '@/components/specific/booking-wizard/steps/step_1/hospital_input/EntityModal';
export type TimeSlot = { date: string; time: string; isAvailable: boolean };
export type Doctor = {
  id: string;
  type: 'doctor';
  name: string;
  specialty: string;
  hospital: string;
  gender: 'male' | 'female';
  availableTimes: TimeSlot[];
};
export interface Clinic {
  id: string;
  type: 'clinic';
  name: string;
  specialty: string;
  hospital: string;
  email: string;
  availableTimes: TimeSlot[];
}
export type Entity = Doctor | Clinic;
interface EntityCardProps {
  entity: Entity;
  selected?: boolean;
  appointmentTime?: string;
  variant?: 'select' | 'summary';
  onSelectEntity?: (entity: Entity) => void;
  onEditEntity?: (entity: Entity) => void;
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
const EntityCard: React.FC<EntityCardProps> = ({
  entity,
  selected = false,
  appointmentTime,
  variant = 'select',
  onSelectEntity,
  onEditEntity,
}) => {
  const [showModal, setShowModal] = useState(false);

  const avatarSource =
    entity.type === 'doctor'
      ? entity.gender === 'male'
        ? maleAvatar
        : femaleAvatar
      : null;

  const handleSelect = () => onSelectEntity?.(entity);
  const handleEdit = () => onEditEntity?.(entity);

  // Layout Step 3 (summary)
  if (variant === 'summary') {
    return (
      <>
        <View style={styles.summaryCard}>
          {entity.type === 'doctor' && <Image source={avatarSource!} style={styles.summaryAvatar} />}
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryName}>{entity.name}</Text>
            {entity.type === 'doctor' ? (
              <>
                <Text style={styles.summarySub}>
                  Chuyên khoa: <Text style={styles.summaryValue}>{entity.specialty}</Text>
                </Text>
                <Text style={styles.summarySub}>
                  Lịch hẹn: <Text style={styles.summaryValue}>{appointmentTime ?? 'Chưa chọn'}</Text>
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.summarySub}>
                  Email: <Text style={styles.summaryValue}>{entity.email}</Text>
                </Text>
                <Text style={styles.summarySub}>
                  Chuyên khoa: <Text style={styles.summaryValue}>{entity.specialty}</Text>
                </Text>
              </>
            )}
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
            <Ionicons name="create-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        {/* Modal */}
        {showModal && (
          <EntityModal
            type={entity.type}
            item={entity}
            onCancel={() => setShowModal(false)}
          />
        )}
      </>
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
    <>
      <LinearGradient
        colors={cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.info}>
          {entity.type === 'doctor' && <Image source={avatarSource!} style={styles.avatar} />}
          <View style={styles.textContainer}>
            <Text style={[styles.name, { color: textColor }]}>{entity.name}</Text>
            <Text style={[styles.specialty, { color: textColor }]}>Chuyên khoa: {entity.specialty}</Text>
            {entity.type === 'clinic' && (
              <Text style={[styles.hospital, { color: textColor }]}>
                Email: {entity.email}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.detailBtn, selected ? styles.detailBtnSelected : styles.detailBtnUnselected]}
            onPress={() => setShowModal(true)}
          >
            <Text
              style={[
                styles.detailText,
                selected ? styles.detailTextSelected : styles.detailTextUnselected,
              ]}
            >
              Chi tiết
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectBtn, { backgroundColor: selectBackground }]}
            onPress={handleSelect}
          >
            <Text style={[styles.selectText, { color: selected ? textColor : COLORS.white }]}>
              {selected ? 'Hủy chọn' : 'Chọn'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Modal */}
      {showModal && (
        <EntityModal
          type={entity.type}
          item={entity}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
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

  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  detailBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 10,
  },
  selectBtn: {
    paddingVertical: 8,
    paddingHorizontal: SIZES.padding,
    borderRadius: 6,
  },
  selectText: { fontWeight: 'bold', fontSize: 14 },
  detailText: { fontWeight: 'bold', fontSize: 14 },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  summaryAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  summaryInfo: { flex: 1 },
  summaryName: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 6 },
  summarySub: { fontSize: 16, color: COLORS.text, marginBottom: 4 },
  summaryValue: { fontWeight: '500', color: COLORS.textDark },
  editBtn: { padding: 6, borderRadius: 6, marginLeft: 8, alignSelf: 'center' },
  detailBtnSelected: { borderColor: COLORS.white, backgroundColor: 'rgba(255,255,255,0.1)' },
  detailBtnUnselected: { borderColor: COLORS.lightBlue, backgroundColor: 'rgba(173,216,230,0.1)' },
  detailTextSelected: { color: COLORS.white },
  detailTextUnselected: { color: COLORS.secondary },
});

export default EntityCard;
