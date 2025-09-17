import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { COLORS, SHADOWS, SIZES } from "@/constants/theme";

type Appointment = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  doctor: string;
  avatar?: string;
  contactType: 'call' | 'video' | 'chat';
};

type Props = {
  appointments: Appointment[];
};

// Lấy màu cho date block
const getDateBlockColor = (index: number) => {
  const colors = [COLORS.primary, COLORS.secondary, COLORS.success];
  return colors[index % colors.length];
};

const AppointmentView: React.FC<Props> = ({ appointments }) => {

  // Nhóm theo tháng
  const groupedAppointments = appointments.reduce((acc, appointment) => {
    const month = new Date(appointment.date).toLocaleString("en-US", { month: "long", year: "numeric" });
    if (!acc[month]) acc[month] = [];
    acc[month].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Render từng appointment
  const renderAppointmentItem = ({ item, index }: { item: Appointment, index: number }) => {
    const day = new Date(item.date).getDate();
    const monthShort = new Date(item.date).toLocaleString("en-US", { month: "short" }).toUpperCase();
    const blockColor = getDateBlockColor(index);

    let contactIcon;


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

        {contactIcon}
      </View>
    );
  };

  // Render section tháng
  const renderMonthSection = ({ month, appointmentsInMonth }: { month: string; appointmentsInMonth: Appointment[] }) => (
    <View style={styles.monthSection}>
      <Text style={styles.monthHeader}>{month.split(' ')[0]}</Text>
      <FlatList
        data={appointmentsInMonth.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item.id}
        nestedScrollEnabled={true} // cho phép cuộn bên trong FlatList cha
        scrollEnabled={true} // mở cuộn cho FlatList con
        contentContainerStyle={{ flexGrow: 1 }} // để FlatList con mở rộng
      />

    </View>
  );

  const allMonths = Object.keys(groupedAppointments);

  return (
    <FlatList
      data={allMonths}
      renderItem={({ item: month }) =>
        renderMonthSection({ month, appointmentsInMonth: groupedAppointments[month] })
      }
      keyExtractor={(month) => month}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.header}>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  header: {
    paddingVertical: SIZES.padding,

  },
  backButton: { padding: SIZES.base },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  placeholder: { width: 24 + SIZES.base * 2 },
  monthSection: { marginBottom: SIZES.padding },
  monthHeader: {
    fontSize: 28,
    fontWeight: 'bold',
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
    position: 'relative',
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
  monthText: { fontSize: 12, fontWeight: '600', color: COLORS.white },
  infoContainer: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: SIZES.base / 2 },
  time: { fontSize: 14, color: COLORS.text },
  contactIcon: {
    position: 'absolute',
    right: SIZES.base * 2,
    top: SIZES.base * 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default AppointmentView;
