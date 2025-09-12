import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Image, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';
import NewsCarouselView from '../../../../home/news_carousel/CarouselView';
import ExpandableText from '@/components/common/ExpandableText';
import type { Hospital } from '@/types/dtos/tenant/hospital.dto';
import { useBookingStore } from '@/store/useBookingStore';
import type { Doctor } from '@/components/specific/schedule/appointment/components/doctor_list/DoctorCard';

interface Props {
  type: 'hospital' | 'doctor';
  item: Hospital | Doctor | null;
  onCancel: () => void;
  onSelect?: (item: Hospital) => void;
}

const EntityModal: React.FC<Props> = ({ type, item, onCancel, onSelect }) => {
  if (!item) return null;

  const carouselData = (item as any).images
    ? Array.isArray((item as any).images)
      ? (item as any).images.map((url: string, idx: number) => ({ id: idx + 1, url }))
      : [{ id: 1, url: (item as any).images }]
    : [
      { id: 1, url: 'https://bvtn.org.vn/wp-content/uploads/2023/12/benh-vien-thong-nhat.jpg' },
      { id: 2, url: 'https://prod-cdn.pharmacity.io/blog/benh-vien-thong-nhat-truc-thuoc-bo-y-te-va-la-mot-trong-nhung-benh-vien-lon-trong-khu-vuc.png' },
    ];

  return (
    <Modal visible={!!item} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <NewsCarouselView
            data={carouselData}
            renderItem={({ url }) => (
              <Image
                source={{ uri: url }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderTopLeftRadius: SIZES.radius * 2,
                  borderTopRightRadius: SIZES.radius * 2,
                }}
              />
            )}
          />

          <View style={styles.info}>
            <ScrollView>
              <Text style={styles.title}>{(item as any).name}</Text>

              {type === 'hospital' && (
                <>
                  <Text style={styles.text}>Địa chỉ: {(item as Hospital).address}</Text>
                  <Text style={styles.text}>Điện thoại: {(item as Hospital).phone}</Text>
                  <Text style={styles.text}>Email: contact@hospital.com</Text>
                  <ExpandableText text={(item as Hospital).description || ''} limit={150} fontSize={16} />
                </>
              )}

              {type === 'doctor' && (
                <>
                  <Text style={styles.text}>Chuyên khoa: {(item as Doctor).specialty}</Text>
                  <Text style={styles.text}>Bệnh viện: {(item as Doctor).hospital}</Text>
                  <Text style={styles.text}>Giới tính: {(item as Doctor).gender}</Text>
                </>
              )}
            </ScrollView>
            <View style={styles.buttons}>
              {type === 'hospital' && (
                <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.danger }]} onPress={onCancel}>
                  <Text style={styles.btnText}>Hủy</Text>
                </TouchableOpacity>
              )}
              {type === 'hospital' && onSelect && (
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: COLORS.lightBlue }]}
                  onPress={() => {
                    onSelect(item as Hospital);
                    useBookingStore.getState().setHospitalSelected(true);
                    onCancel();
                  }}
                >
                  <Text style={styles.btnText}>Chọn</Text>
                </TouchableOpacity>
              )}

              {type === 'doctor' && (
                <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.lightBlue }]} onPress={onCancel}>
                  <Text style={styles.btnText}>Đóng</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  content: { width: '95%', backgroundColor: COLORS.white, borderRadius: SIZES.radius * 2 },
  info: { padding: 20, paddingTop: SIZES.padding / 2, maxHeight: 400 },
  title: { fontSize: 25, fontWeight: 'bold', marginBottom: 10, color: COLORS.textDark },
  text: { fontSize: 16, marginBottom: 2, color: COLORS.textDark },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  btn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: SIZES.radius },
  btnText: { color: COLORS.white, fontWeight: 'bold' },
});

export default EntityModal;
