import React,{useState} from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity,ListRenderItemInfo,Alert } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/HomeScreenNavigator';
import NotificationSetting from '../../components/specific/notification/NotificationSetting'

type NotificationScreenProps = NativeStackScreenProps<HomeStackParamList, 'Notification'>;
interface Medicine {
  name: string;           // Tên thuốc
  instruction: string;    // Hướng dẫn sử dụng
  beforeMeal: boolean;    // Uống trước bữa ăn hay không
  times: string[];        // Mảng thời gian (có thể rỗng)
}

interface MedicineNotification {
  id: string;             // ID nhóm thông báo
  date: string;           // Ngày theo format "dd/MM/yyyy"
  timeGroup: string;      // Nhóm thời gian, ví dụ "Sáng - 07:00"
  status: string;  // Trạng thái uống thuốc
  medicines: Medicine[];  // Danh sách thuốc trong nhóm này
  isRead?: boolean;
}

const INITIAL_NOTIFICATIONS:MedicineNotification[] = [
  {
    id: '1',
    date: '12/08/2025',
    timeGroup: 'Sáng - 07:00',
    status: 'Đã bỏ lỡ',
    medicines: [
      {
        name: 'Acetazolamid 250mg',
        instruction: 'Uống mỗi ngày 1 lần, mỗi lần 3 viên',
        beforeMeal: true,
        times: ['07:00', '11:30', '17:00'],
      },
      {
        name: 'Butavell 50mg/ml lọ 5ml',
        instruction: 'Tiêm mỗi ngày 1 lần, mỗi lần 1 lọ',
        beforeMeal: true,
        times: [],
      },
    ],
  },
  {
    id: '2',
    date: '12/08/2025',
    timeGroup: 'Trưa - 12:00',
    status: 'Sắp uống',
    medicines: [
      {
        name: 'Paracetamol 500mg',
        instruction: 'Uống mỗi ngày 2 lần, mỗi lần 1 viên',
        beforeMeal: false,
        times: ['12:00', '20:00'],
      },
      {
        name: 'Vitamin C 1000mg',
        instruction: 'Uống mỗi ngày 1 lần, mỗi lần 1 viên',
        beforeMeal: true,
        times: ['12:00'],
      },
    ],
  },
  {
    id: '3',
    date: '12/08/2025',
    timeGroup: 'Chiều - 15:30',
    status: 'Đã uống',
    medicines: [
      {
        name: 'Amoxicillin 500mg',
        instruction: 'Uống mỗi ngày 3 lần, mỗi lần 1 viên',
        beforeMeal: false,
        times: ['07:00', '15:30', '22:00'],
      },
    ],
  },
  {
    id: '4',
    date: '13/08/2025',
    timeGroup: 'Tối - 20:00',
    status: 'Sắp uống',
    medicines: [
      {
        name: 'Thuốc ho Prospan',
        instruction: 'Uống mỗi ngày 2 lần, mỗi lần 10ml',
        beforeMeal: false,
        times: ['08:00', '20:00'],
      },
    ],
  },
  {
    id: '5',
    date: '13/08/2025',
    timeGroup: 'Sáng - 06:30',
    status: 'Đã bỏ lỡ',
    medicines: [
      {
        name: 'Aspirin 81mg',
        instruction: 'Uống mỗi ngày 1 lần, mỗi lần 1 viên',
        beforeMeal: true,
        times: ['06:30'],
      },
      {
        name: 'Omeprazole 20mg',
        instruction: 'Uống mỗi ngày 1 lần, mỗi lần 1 viên',
        beforeMeal: true,
        times: ['06:30'],
      },
    ],
  },
  {
    id: '6',
    date: '13/08/2025',
    timeGroup: 'Trưa - 13:15',
    status: 'Đã uống',
    medicines: [
      {
        name: 'Thuốc bổ gan Boganic',
        instruction: 'Uống mỗi ngày 2 lần, mỗi lần 2 viên',
        beforeMeal: false,
        times: ['13:15', '21:00'],
      },
    ],
  },
  {
    id: '7',
    date: '14/08/2025',
    timeGroup: 'Chiều - 16:45',
    status: 'Sắp uống',
    medicines: [
      {
        name: 'Cefuroxime 250mg',
        instruction: 'Uống mỗi ngày 2 lần, mỗi lần 1 viên',
        beforeMeal: false,
        times: ['08:00', '16:45'],
      },
      {
        name: 'Canxi Corbiere 10ml',
        instruction: 'Uống mỗi ngày 1 lần, mỗi lần 1 ống',
        beforeMeal: false,
        times: ['16:45'],
      },
    ],
  },
  {
    id: '8',
    date: '14/08/2025',
    timeGroup: 'Tối - 21:00',
    status: 'Đã bỏ lỡ',
    medicines: [
      {
        name: 'Melatonin 3mg',
        instruction: 'Uống mỗi ngày 1 lần, mỗi lần 1 viên',
        beforeMeal: false,
        times: ['21:00'],
      },
    ],
  },
  {
    id: '9',
    date: '14/08/2025',
    timeGroup: 'Sáng - 08:00',
    status: 'Đã uống',
    medicines: [
      {
        name: 'Glucosamine 1500mg',
        instruction: 'Uống mỗi ngày 1 lần, mỗi lần 1 viên',
        beforeMeal: false,
        times: ['08:00'],
      },
    ],
  },
  {
    id: '10',
    date: '15/08/2025',
    timeGroup: 'Trưa - 11:00',
    status: 'Sắp uống',
    medicines: [
      {
        name: 'Thuốc bổ máu Ferrovit',
        instruction: 'Uống mỗi ngày 1 lần, mỗi lần 1 viên',
        beforeMeal: true,
        times: ['11:00'],
      },
      {
        name: 'Vitamin D3 1000IU',
        instruction: 'Uống mỗi ngày 1 lần, mỗi lần 1 viên',
        beforeMeal: false,
        times: ['11:00'],
      },
    ],
  },
];

const NotificationScreen = () => {
    // --- THAY ĐỔI 2: Quản lý dữ liệu và modal bằng state ---
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    // State này sẽ lưu ID của item được chọn, null nghĩa là modal đang đóng
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const navigation = useNavigation();
     // --- THAY ĐỔI 3: Tạo các hàm xử lý hành động ---
    const handleDelete = () => {
        if (!selectedItemId) return;
        setNotifications(prevNotifications =>
            prevNotifications.filter(item => item.id !== selectedItemId)
        );
        setSelectedItemId(null); // Đóng modal sau khi xóa
        Alert.alert("Đã xóa thông báo.");
    };

    const handleMarkAsRead = () => {
        if (!selectedItemId) return;
        setNotifications(prevNotifications =>
            prevNotifications.map(item =>
                item.id === selectedItemId ? { ...item, isRead: true } : item
            )
        );
        setSelectedItemId(null); // Đóng modal sau khi cập nhật
    };

    const renderMedicineItem = ({ item }:ListRenderItemInfo<Medicine>) => (
    <View style={styles.medicineItem}>
      <Text style={styles.medicineName}>{item.name}</Text>
    </View>
  );

  const renderTimeGroup = ({ item }: ListRenderItemInfo<MedicineNotification>) => {
  return (
    <View style={[styles.notificationItem, !item.isRead && styles.unreadItem]}>
      {!item.isRead && <View style={styles.unreadDot} />}
      <View style={{ flex: 1, marginLeft: !item.isRead ? 10 : 0 }}>
        <View style={styles.groupHeader}>
          <Text style={styles.timeGroup}>
            {item.timeGroup} - {item.date}
          </Text>
          <Text
            style={[
              styles.status,
              item.status === 'Đã bỏ lỡ'
                ? styles.statusMissed
                : item.status === 'Sắp uống'
                ? styles.statusUpcoming
                : styles.statusDone,
            ]}
          >
            {item.status}
          </Text>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('NotificationSetting' as any)}>
                            <Ionicons name="ellipsis-horizontal" size={20} color="#555" />
                        </TouchableOpacity>
        </View>
        <FlatList
          data={item.medicines}
          keyExtractor={(med, index) => `${item.id}-med-${index}`}
          renderItem={renderMedicineItem}
        />
      </View>
    </View>
  );
};



  return (
    <View >
        <View style={styles.header} >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleButton} >
            <Ionicons name="arrow-back-outline" size={24} color="#000000ff"/>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nhắc uống thuốc</Text>
            <View style={styles.headerRight}>
            <TouchableOpacity style={{ marginRight: 10 }}>
          <Ionicons name="checkmark-done-outline" size={24} color="#888585ff" />
        </TouchableOpacity>
            </View>
        </View>
        <FlatList
            data={INITIAL_NOTIFICATIONS}
            keyExtractor={(item) => item.id}
            renderItem={renderTimeGroup}
            style={{marginBottom:180}}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  header: {
    height: 56,
    backgroundColor: '#f8c7d4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    marginTop: 35,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },

  groupContainer: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,          // Thêm đường kẻ dưới cho nhóm
    borderBottomColor: '#e6bebeff',
  },
  timeGroup: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusMissed: { color: '#e74c3c' },
  statusUpcoming: { color: '#f39c12' },
  statusDone: { color: '#2ecc71' },
  medicineItem: {
    //borderTopWidth: 1,
    //borderTopColor: '#eee',
    paddingVertical: 8,
  },
  medicineName: {
    fontSize: 15,
    fontWeight: '600',
  },
  medicineInstruction: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  beforeMeal: {
    fontSize: 12,
    color: '#2980b9',
    marginTop: 2,
  },
  times: {
    fontSize: 12,
    color: '#8e44ad',
    marginTop: 2,
  },
  notificationItem: {
  flexDirection: 'row',
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 12,
  marginBottom: 12,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 4,
  elevation: 2,
  
},
unreadDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#ff3b30',
  marginTop: 4,
},
unreadItem: {
  backgroundColor: '#fff8f8', // Nền nhạt hơn cho thông báo chưa đọc
  borderLeftWidth: 4,        // Viền nổi bật bên trái
  borderLeftColor: '#ff3b30',
},
circleButton: {
  width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: 'rgba(196, 120, 120, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
},
 iconButton: {
    marginLeft: 8,
    padding: 4,
  },
});


export default NotificationScreen;
