import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Image, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '@/constants/theme';
import NewsCarouselView from '../../../../home/news_carousel/CarouselView';
import ExpandableText from '@/components/common/ExpandableText';
import type { Hospital } from '@/types/dtos/tenant/hospital.dto';
import { useHospitalUIStore } from '@/store/useHospitalUIStore';

interface Props {
  hospital: Hospital | null;
  onCancel: () => void;
  onSelect: (hospital: Hospital) => void;
}

const HospitalModal: React.FC<Props> = ({ hospital, onCancel, onSelect }) => {
  if (!hospital) return null;

  const carouselData = hospital.images
    ? Array.isArray(hospital.images)
      ? hospital.images.map((url, idx) => ({ id: idx + 1, url }))
      : [{ id: 1, url: hospital.images }]
    : [
      { id: 1, url: 'https://bvtn.org.vn/wp-content/uploads/2023/12/benh-vien-thong-nhat.jpg' }
    ];

  return (
    <Modal visible={!!hospital} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <NewsCarouselView
            data={carouselData}
            renderItem={({ url }) => (
              <Image source={{ uri: url }} style={{ width: '100%', height: '100%', borderTopLeftRadius: SIZES.radius*2, borderTopRightRadius: SIZES.radius*2 }} />
            )}
          />
          <View style={styles.info}>
            <ScrollView>
              <Text style={styles.title}>{hospital.name}</Text>
              <Text style={styles.text}>Địa chỉ: {hospital.address}</Text>
              <Text style={styles.text}>Điện thoại: {hospital.phone}</Text>
              <Text style={styles.text}>Email: contact@hospital.com</Text>
              <ExpandableText text={hospital.description || ''} limit={150} fontSize={16} />
            </ScrollView>
            <View style={styles.buttons}>
              <TouchableOpacity style={[styles.btn, {backgroundColor: COLORS.danger}]} onPress={onCancel}>
                <Text style={styles.btnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, {backgroundColor: COLORS.lightBlue}]} onPress={() => {
                onSelect(hospital);
                useHospitalUIStore.getState().setHospitalSelected(true);
                onCancel();
              }}>
                <Text style={styles.btnText}>Chọn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  content: { width:'95%', backgroundColor:COLORS.white, borderRadius: SIZES.radius*2 },
  info: { padding: 20, paddingTop: SIZES.padding/2 },
  title: { fontSize:25, fontWeight:'bold', marginBottom:10, color:COLORS.textDark },
  text: { fontSize:16, marginBottom:2, color:COLORS.textDark },
  buttons: { flexDirection:'row', justifyContent:'flex-end', gap:10 },
  btn: { paddingVertical:10, paddingHorizontal:20, borderRadius:SIZES.radius },
  btnText: { color:COLORS.white, fontWeight:'bold' },
});

export default HospitalModal;
