import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  Alert,
} from "react-native";
import {
  CompositeNavigationProp,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { storageService } from "@/services/storage";
import { COLORS, SIZES } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { RootStackParamList, MainTabsParamList } from "@/navigation/types";
import type { NavigatorScreenParams } from "@react-navigation/native";

dayjs.locale("vi");

type Appointment = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  doctor: string;
  avatar?: string;
  contactType: "call" | "video" | "chat";
};

type Props = {
  appointments: Appointment[];
};

type AppointmentViewNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, "Schedule">,
  NativeStackNavigationProp<RootStackParamList>
>;

const getDateBlockColor = (index: number) => {
  const colors = [COLORS.primary, COLORS.secondary, COLORS.success];
  return colors[index % colors.length];
};

const AppointmentView: React.FC<Props> = ({ appointments }) => {
  const [storedAppointments, setStoredAppointments] = useState<Appointment[]>([]);
  const isFocused = useIsFocused();
  const navigation = useNavigation<AppointmentViewNav>();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const list: any[] = await storageService.getBookings();
        if (!mounted) return;

        const mapped = (list || []).flatMap((booking) =>
          (booking.appointments || []).map((appt: any) => ({
            id: appt.id,
            date: appt.date,
            time: appt.time,
            title: appt.title,
            doctor: appt.entityName,
            contactType: "call",
          }))
        );

        setStoredAppointments(mapped);
      } catch (err) {
        console.error("Failed to load stored bookings", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isFocused]);

  // 👉 Hàm xoá lịch
  const handleCancel = (appointment: Appointment) => {
  Alert.alert("Xác nhận hủy", "Bạn có chắc chắn muốn hủy lịch hẹn này?", [
    { text: "Không", style: "cancel" },
    {
      text: "Có",
      style: "destructive",
      onPress: async () => {
        try {
          // Lấy tất cả booking từ storage
          const bookings: any[] = await storageService.getBookings();

          // Lọc bỏ appointment bị hủy
          const updatedBookings = bookings
            .map((booking) => ({
              ...booking,
              appointments: (booking.appointments as Appointment[] | undefined)?.filter(
                (appt: Appointment) => appt.id !== appointment.id
              ) || [],
            }))
            // Loại bỏ những booking không còn appointments
            .filter((b) => (b.appointments || []).length > 0);

          // Cập nhật lại storage
          await storageService.saveBookings(updatedBookings);

          // Cập nhật state local
          setStoredAppointments((prev) =>
            prev.filter((a) => a.id !== appointment.id)
          );
        } catch (err) {
          console.error("Failed to cancel appointment", err);
          Alert.alert("Lỗi", "Không thể hủy lịch. Vui lòng thử lại.");
        }
      },
    },
  ]);
};



  type Row =
    | { type: "header"; id: string; title: string }
    | ({ type: "item"; id: string } & Appointment);

  const rows = useMemo(() => {
    const now = dayjs();
    const all = [...appointments, ...storedAppointments].filter((a) =>
      dayjs(a.date).endOf("day").isAfter(now.subtract(1, "day"))
    );

    const groups = all.reduce((acc, appointment) => {
      const monthKey = dayjs(appointment.date).locale("vi").format("[Tháng] M YYYY");
      if (!acc[monthKey]) acc[monthKey] = [] as Appointment[];
      acc[monthKey].push(appointment);
      return acc;
    }, {} as Record<string, Appointment[]>);

    const monthKeys = Object.keys(groups).sort(
      (a, b) =>
        dayjs(groups[a][0].date).toDate().getTime() -
        dayjs(groups[b][0].date).toDate().getTime()
    );

    const result: Row[] = [];
    monthKeys.forEach((month) => {
      result.push({ type: "header", id: `h-${month}`, title: month });
      groups[month]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .forEach((item) => result.push({ ...item, type: "item" } as Row));
    });
    return result;
  }, [appointments, storedAppointments, isFocused]);

  const renderRow = ({ item, index }: ListRenderItemInfo<Row>) => {
    if (item.type === "header") {
      return (
        <View>
          <Text style={styles.monthHeader}>{item.title}</Text>
        </View>
      );
    }

    const appointmentIndex = index;
    const day = new Date(item.date).getDate();
    const monthShort = new Date(item.date)
      .toLocaleString("vi-VN", { month: "short" })
      .toUpperCase();

    const blockColor = getDateBlockColor(appointmentIndex);

    return (
      <View style={styles.card}>
        <View style={[styles.dateBlock, { backgroundColor: blockColor }]}>
          <Text style={styles.dayText}>{day}</Text>
          <Text style={styles.monthText}>{monthShort}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <View style={styles.actionsWrapper}>
          <Pressable
            accessible
            accessibilityRole="button"
            onPress={async () => {
              try {
                const bookings = await storageService.getBookings();
                const booking = bookings.find((b) =>
                  (b.appointments || []).some((appt: any) => appt.id === item.id)
                );

                if (booking) {
                  // ✅ ép kiểu cho navigate
                  navigation.navigate("BookingWizard", {
                    screen: "BookingReceipt",
                    params: {
                      bookingData: booking.bookingData,
                      appointmentCode: booking.appointmentCode,
                      fromAppointment: true,
                    },
                  });


                } else {
                  Alert.alert("Không tìm thấy chi tiết lịch hẹn này");
                }
              } catch (err) {
                console.error("Failed to open receipt", err);
              }
            }}
            style={({ pressed }) => [
              styles.actionButton,
              styles.detailButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.actionText}>Chi tiết</Text>
          </Pressable>

          <Pressable
            accessible
            accessibilityRole="button"
            onPress={() => handleCancel(item as Appointment)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.cancelButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.actionText}>Hủy</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => {
    console.log("Render key:", item.id);
    return item.id;
  }}
      renderItem={renderRow}
      contentContainerStyle={[
        styles.listContent,
        { paddingBottom: SIZES.padding * 4 },
      ]}
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có lịch hẹn</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    width: "100%",
  },
  monthHeader: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SIZES.base * 2,
    marginLeft: SIZES.base,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.transparent,
    borderRadius: SIZES.radius * 2,
    paddingVertical: SIZES.base * 2,
    paddingHorizontal: SIZES.base * 3,
    marginBottom: SIZES.base * 2,
    position: "relative",
  },
  dateBlock: {
    width: 70,
    height: 70,
    borderRadius: SIZES.radius * 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.base * 3,
  },
  dayText: { fontSize: 28, fontWeight: "800", color: COLORS.white },
  monthText: { fontSize: 12, fontWeight: "600", color: COLORS.white },
  infoContainer: { flex: 1, justifyContent: "center" },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SIZES.base / 2,
  },
  time: { fontSize: 14, color: COLORS.text },
  actionsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: SIZES.base,
    position: "absolute",
    right: SIZES.base * 2,
    top: 0,
    bottom: 0,
    marginTop: SIZES.padding * 2,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  detailButton: { backgroundColor: COLORS.primary },
  cancelButton: { backgroundColor: COLORS.danger || "#E53935" },
  actionText: { color: COLORS.white, fontWeight: "700", fontSize: 13 },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.995 }] },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.padding,
  },
  emptyText: { color: COLORS.text, fontSize: 16, opacity: 0.6 },
});

export default AppointmentView;
