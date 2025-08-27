import { COLORS } from '@/constants/theme';

export const getHeartRateStatus = (rate: number): { text: string; color: string; advice: string | null } => {
  if (rate < 40) return { text: 'Rất chậm', color: COLORS.accent, advice: '⚠️ Nguy hiểm: Nhịp tim quá thấp, hãy gọi cấp cứu ngay lập tức.' };
  if (rate < 50) return { text: 'Chậm đáng kể', color: COLORS.warning, advice: 'Nếu có mệt, chóng mặt hoặc ngất, hãy đi khám ngay.' };
  if (rate < 60) return { text: 'Dưới mức bình thường', color: COLORS.warning, advice: 'Có thể bình thường với người tập thể thao. Nếu thấy khó chịu, hãy tham khảo ý kiến bác sĩ.' };
  if (rate <= 100) return { text: 'Sức khỏe tim mạch của bạn đang rất tốt', color: COLORS.success, advice: null };
  return { text: 'Nhanh', color: COLORS.accent, advice: 'Hãy nghỉ ngơi, uống nước, thử hít thở sâu. Nếu kéo dài, hãy đi khám.' };
};
