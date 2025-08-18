// src/screens/HealthStatsScreen.tsx
import React, { useState, useCallback, ComponentProps } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SIZES } from '@/constants/theme'; // Giữ lại SIZES phòng khi cần dùng

// --- ĐỊNH NGHĨA CÁC TYPE CẦN THIẾT (Không thay đổi) ---
type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface Stat {
  key: string;
  title: string;
  icon: {
    name: IoniconName;
    color: string;
    bg: string;
  };
  bgCard: string;
  getValue: (p: HealthStatsProps) => string;
  progress: (p: HealthStatsProps) => number;
  progressColor: string;
}

interface HealthStatsProps {
  heartRate: number;
  steps: number;
  stepsGoal: number;
  water: number;
  waterGoal: number;
  sleepHours: number;
  sleepGoal: number;
}

// --- DỮ LIỆU BAN ĐẦU (Không thay đổi) ---
const initialStats: Stat[] = [
    {
        key: 'heart',
        title: 'Nhịp tim',
        icon: { name: 'heart', color: '#E53935', bg: '#FFD6D6' },
        bgCard: '#6CC16C',
        getValue: (p: HealthStatsProps) => `${p.heartRate} bpm`,
        progress: (p: HealthStatsProps) => p.heartRate / 100,
        progressColor: '#4CAF50'
    },
    {
        key: 'steps',
        title: 'Số bước',
        icon: { name: 'footsteps', color: '#fff', bg: '#B38DD9' },
        bgCard: '#9B6CC1',
        getValue: (p: HealthStatsProps) => `${p.steps.toLocaleString()} / ${p.stepsGoal.toLocaleString()}`,
        progress: (p: HealthStatsProps) => p.steps / p.stepsGoal,
        progressColor: '#7B4DB3'
    },
    // ... bạn có thể thêm lại các mục nước, giấc ngủ ở đây
];


// --- COMPONENT CON: StatCard (Tối ưu hóa với React.memo) ---
interface StatCardProps {
    stat: Stat;
    healthProps: HealthStatsProps;
}

const StatCard: React.FC<StatCardProps> = React.memo(({ stat, healthProps }) => (
    <View style={[styles.card, { backgroundColor: stat.bgCard }]}>
        <View style={styles.cardHeader}>
            <View style={[styles.iconWrapper, { backgroundColor: stat.icon.bg }]}>
                <Ionicons name={stat.icon.name} size={18} color={stat.icon.color} />
            </View>
            <Text style={styles.cardTitle}>{stat.title}</Text>
        </View>
        <Text style={styles.cardValue}>{stat.getValue(healthProps)}</Text>
        <View style={styles.progressBar}>
            <View
                style={[
                    styles.progressFill,
                    {
                        width: `${Math.min(stat.progress(healthProps) * 100, 100)}%`,
                        backgroundColor: stat.progressColor,
                    },
                ]}
            />
        </View>
    </View>
));


// --- COMPONENT CON: AddStatModal (Logic không đổi) ---
interface AddStatModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (newStat: Stat) => void;
}

const AddStatModal: React.FC<AddStatModalProps> = ({ visible, onClose, onAdd }) => {
    const [title, setTitle] = useState('');

    const handleAdd = () => {
        if (!title.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên mục theo dõi.');
            return;
        }

        const newStat: Stat = {
            key: new Date().toISOString(),
            title: title.trim(),
            icon: { name: 'barbell', color: '#fff', bg: '#8D6E63' },
            bgCard: '#A1887F',
            getValue: () => 'Chưa có dữ liệu',
            progress: () => 0,
            progressColor: '#6D4C41',
        };

        onAdd(newStat);
        setTitle('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Thêm mục theo dõi mới</Text>
                    <TextInput
                        placeholder="Ví dụ: Lượng đường trong máu"
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                    />
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handleAdd}>
                            <Text style={[styles.buttonText, { color: '#fff' }]}>Thêm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};


// --- COMPONENT MÀN HÌNH CHÍNH ---
const HealthStatsScreen: React.FC<HealthStatsProps> = (props) => {
  const [stats, setStats] = useState<Stat[]>(initialStats);
  const [isModalVisible, setModalVisible] = useState(false);

  // Sử dụng useCallback để tối ưu hóa, tránh tạo lại hàm mỗi lần render
  const openModal = useCallback(() => setModalVisible(true), []);
  const closeModal = useCallback(() => setModalVisible(false), []);

  const handleAddStat = useCallback((newStat: Stat) => {
    setStats(prevStats => [...prevStats, newStat]);
  }, []);


  return (
    <View style={styles.healthContainer}>
      <View style={styles.cardContainer}>
        {/* Render danh sách các thẻ thống kê */}
        {stats.map((stat) => (
          <StatCard key={stat.key} stat={stat} healthProps={props} />
        ))}

        {/* Thẻ "Thêm mới" để mở Modal */}
        <TouchableOpacity
          style={[styles.card, styles.addCard]}
          onPress={openModal} // Kết nối chức năng mở modal
        >
          <Ionicons name="add" size={40} color="#B0B0B0" />
          <Text style={styles.addCardText}>Thêm mới</Text>
        </TouchableOpacity>
      </View>

      {/* Render Modal */}
      <AddStatModal 
        visible={isModalVisible}
        onClose={closeModal}
        onAdd={handleAddStat}
      />
    </View>
  );
};

// --- STYLES (Không thay đổi) ---
const styles = StyleSheet.create({
  healthContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    height: 120,
    justifyContent: 'space-between',
  },
  addCard: {
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addCardText: {
    color: '#A0A0A0',
    fontWeight: '600',
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  addButton: {
    backgroundColor: '#4DA6FF',
  },
  buttonText: {
      color: 'black', // Đổi màu chữ nút Hủy cho dễ nhìn
      fontWeight: 'bold'
  }
});

export default HealthStatsScreen;