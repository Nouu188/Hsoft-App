// AddRingTone.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/types'; 
import { COLORS, FONTS, SIZES } from '@/constants/theme'; 
import { pick, types } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
type AddAudioScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'AddRingtone'
>;

const AddAudioScreen: React.FC = () => {
  const navigation = useNavigation<AddAudioScreenNavigationProp>();
  const route = useRoute<any>();

  const handlePickFile = async () => {
  try {
    const [res] = await pick({ type: [types.audio] });
    if (!res) return;

    const destPath = `${RNFS.DocumentDirectoryPath}/${res.name}`;
    await RNFS.copyFile(res.uri, destPath);

    // Tạo sound để lấy duration
    const sound = new Sound(`file://${destPath}`, '', (error) => {
      if (error) {
        console.log('Failed to load sound for duration', error);
        return;
      }

      const minutes = Math.floor(sound.getDuration() / 60);
      const seconds = Math.floor(sound.getDuration() % 60);
      const durationStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      const newRingtone = {
        id: Date.now().toString(),
        name: res.name || 'Custom Ringtone',
        duration: durationStr, // độ dài
        isCustom: true,
        uri: `file://${destPath}`,
      };

      Alert.alert('Đã chọn file', `Tên: ${res.name}\nThời lượng: ${durationStr}`);

      if (route.params?.onSelect) {
        route.params.onSelect(newRingtone);
      }

      sound.release(); // giải phóng memory
      navigation.goBack();
    });

  } catch (err: any) {
    if (err?.code === 'DOCUMENTS_PICKER_CANCELED') {
      console.log('User cancelled file picker');
    } else {
      console.error('File picker error:', err);
    }
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm âm thanh</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.optionContainer}>
        <TouchableOpacity style={styles.optionItem} onPress={handlePickFile}>
          <View style={styles.iconTextContainer}>
            <Ionicons name="folder-outline" size={24} />
            <Text style={styles.optionText}>Chọn Tập tin</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.screenBackGround },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    marginTop: SIZES.padding * 1.3,
  },
  backButton: { padding: SIZES.padding / 2 },
  headerTitle: { flex: 1, textAlign: 'center', ...FONTS.h2, fontWeight: 'bold' },
  optionContainer: {
    marginTop: SIZES.padding,
    backgroundColor: COLORS.transparent,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  iconTextContainer: { flexDirection: 'row', alignItems: 'center' },
  optionText: { ...FONTS.body3, color: COLORS.textDark, marginLeft: SIZES.base },
});

export default AddAudioScreen;
