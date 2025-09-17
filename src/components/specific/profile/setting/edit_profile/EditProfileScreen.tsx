// File tổng của EditProfileScreen
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS, SHADOWS, SIZES } from "@/constants/theme";
import { useIdentityStore } from "@/store/useIdentityStore";
import InfoRow from "./InfoRow";
import { Avatar } from "./Avatar";
import { InfoCard } from "./InfoCard";
import { SectionHeader } from "./ProfileSectionHeader";


const formatGender = (gender?: string | null): string => {
  if (!gender) return "Chưa cập nhật";
  if (gender.toUpperCase() === "FEMALE") return "Nữ";
  if (gender.toUpperCase() === "MALE") return "Nam";
  return gender;
};

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { identity } = useIdentityStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...identity });

  const handleSave = () => {
    console.log("Updated identity:", form);
    setIsEditing(false);
  };

  if (!identity) {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <Text>Không có thông tin cá nhân</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      {/* Header */}
      <View style={styles.headerBackground}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: SIZES.padding * 8 },
        ]}
      >
        {/* Avatar */}
        <Avatar uri="https://i.pravatar.cc/150?u=a042581f4e29026704d" />

        {/* Personal Info */}
        <SectionHeader
          title="Thông tin cá nhân"
          editable
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
        />
        <InfoCard>
          <InfoRow
            icon="person-outline"
            label="Họ và tên"
            value={form.fullName}
            editable={isEditing}
            onChangeText={(val) => setForm({ ...form, fullName: val })}
          />
          <InfoRow
            icon="call-outline"
            label="Số điện thoại"
            value={form.phoneNumber}
            editable={isEditing}
            onChangeText={(val) => setForm({ ...form, phoneNumber: val })}
          />
          <InfoRow
            icon="card-outline"
            label="Số CMND/CCCD"
            value={form.nationalId}
            editable={isEditing}
            onChangeText={(val) => setForm({ ...form, nationalId: val })}
          />
          <InfoRow
            icon="location-outline"
            label="Địa chỉ"
            value={form.address}
            editable={isEditing}
            onChangeText={(val) => setForm({ ...form, address: val })}
          />
          <InfoRow
            icon="calendar-outline"
            label="Năm sinh"
            value={form.birthYear}
            editable={isEditing}
            onChangeText={(val) =>
              setForm({ ...form, birthYear: val ? Number(val) : undefined })
            }
          />
          <InfoRow
            icon="male-female-outline"
            label="Giới tính"
            value={formatGender(form.gender)}
            showBorder={false}
          />
        </InfoCard>

        {/* Patient Info */}
        <SectionHeader title="Thông tin bệnh nhân" />
        <InfoCard>
          <InfoRow
            icon="id-card-outline"
            label="Mã bệnh nhân"
            value={form.externalPatientCode}
            editable={isEditing}
            onChangeText={(val) => setForm({ ...form, externalPatientCode: val })}
          />
          <InfoRow
            icon="medkit-outline"
            label="Số BHYT"
            value={form.healthInsuranceNumber}
            editable={isEditing}
            onChangeText={(val) =>
              setForm({ ...form, healthInsuranceNumber: val })
            }
            showBorder={form.hospitals?.length ? true : false}
          />

          {form.hospitals && form.hospitals.length > 0 && (
            <>
              <Text
                style={[
                  styles.sectionTitle,
                  { marginTop: SIZES.padding * 0.8 },
                ]}
              >
                Bệnh viện liên kết
              </Text>
              {form.hospitals.map((h) => (
                <InfoRow
                  key={h.id}
                  label={h.name}
                  value={h.name}
                  icon="business-outline"
                  editable={false}
                  showBorder={false}
                />
              ))}
            </>
          )}
        </InfoCard>
      </ScrollView>

      {/* Save button */}
      {isEditing && (
        <View style={styles.saveWrapper}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Lưu thay đổi</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBackground: {
    paddingTop: SIZES.padding * 3,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: SIZES.padding * 2,
    left: SIZES.padding,
    zIndex: 10,
  },
  container: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h2,
    color: COLORS.textDark,
    fontWeight: "bold",
  },
  saveWrapper: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: SIZES.padding * 7,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.medium,
    marginBottom: SIZES.padding * 3.5,
  },
  saveText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EditProfileScreen;
