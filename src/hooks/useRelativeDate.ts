import { useMemo } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
import updateLocale from 'dayjs/plugin/updateLocale';
import 'dayjs/locale/vi';

// Kích hoạt (extend) các plugin cần thiết cho dayjs
dayjs.extend(relativeTime);
dayjs.extend(calendar);
dayjs.extend(updateLocale);

// Đặt ngôn ngữ mặc định là tiếng Việt
dayjs.locale('vi');

// Tùy chỉnh lại cách hiển thị calendar theo ngôn ngữ Việt
dayjs.updateLocale('vi', {
  calendar: {
    sameDay: '[Hôm nay]',        // Ngày hiện tại
    nextDay: '[Ngày mai]',       // Ngày kế tiếp
    nextWeek: 'dddd',            // Trong tuần sau → hiển thị thứ (vd: Thứ Hai)
    lastDay: '[Hôm qua]',        // Ngày hôm qua
    lastWeek: 'dddd [tuần trước]', // Tuần trước (vd: Thứ Ba tuần trước)
    sameElse: 'DD/MM/YYYY',      // Mặc định: hiển thị theo format dd/mm/yyyy
  },
});


// Hook custom để trả về chuỗi mô tả ngày so với hiện tại
export const useRelativeDate = (date: dayjs.Dayjs): string => {
  // useMemo: chỉ tính toán lại khi "date" thay đổi
  const relativeString = useMemo(() => {
    const today = dayjs().startOf('day');     // Ngày hôm nay (bỏ giờ/phút/giây)
    const targetDate = date.startOf('day');   // Ngày cần so sánh
    const diffInDays = targetDate.diff(today, 'day'); // Khoảng cách ngày (có thể âm/dương)

    // Nếu ngày đó là hôm qua, hôm nay hoặc ngày mai
    if (Math.abs(diffInDays) <= 1) {
      return targetDate.calendar(null, {
        sameDay: '[Hôm nay]',
        nextDay: '[Ngày mai]',
        lastDay: '[Hôm qua]',
      });
    }

    // Nếu trong vòng 6 ngày tới
    if (diffInDays > 1 && diffInDays <= 6) {
      return `${diffInDays} ngày sau`;
    }

    // Nếu trong vòng 6 ngày trước
    if (diffInDays < -1 && diffInDays >= -6) {
      return `${Math.abs(diffInDays)} ngày trước`;
    }

    // Nếu trong tuần kế tiếp (7–13 ngày sau)
    if (diffInDays > 6 && diffInDays <= 13) {
      return 'Tuần sau';
    }

    // Nếu trong tuần trước (7–13 ngày trước)
    if (diffInDays < -6 && diffInDays >= -13) {
      return 'Tuần trước';
    }

    // Nếu xa hơn nữa thì dùng cách diễn đạt tương đối (fromNow)
    // ví dụ: "2 tháng trước", "trong 3 năm"
    return date.fromNow();

  }, [date]);

  return relativeString;
};
