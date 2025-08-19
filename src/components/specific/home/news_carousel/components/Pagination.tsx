import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';
interface PaginationProps {
dataLength: number;
activeIndex: number;
}
// Dùng React.memo để tối ưu, component này sẽ chỉ render lại khi props thay đổi
const Pagination: React.FC<PaginationProps> = React.memo(({ dataLength, activeIndex }) => {
// Tạo một mảng rỗng với độ dài bằng số lượng item để map qua
const dots = Array.from({ length: dataLength });
return (
<View style={styles.paginationContainer}>
{dots.map((_, index) => (
<View
key={index}
style={[
styles.paginationDot,
{ opacity: index === activeIndex ? 1 : 0.3 },
]}
/>
))}
</View>
);
});
const styles = StyleSheet.create({
paginationContainer: {
position: 'absolute',
bottom: 15,
left: 0,
right: 0,
flexDirection: 'row',
justifyContent: 'center',
},
paginationDot: {
width: 8,
height: 8,
borderRadius: 4,
marginHorizontal: 4,
backgroundColor: COLORS.primary,
},
});
export default Pagination;