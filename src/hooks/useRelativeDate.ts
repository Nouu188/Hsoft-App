import { useMemo } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
import updateLocale from 'dayjs/plugin/updateLocale';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.extend(calendar);
dayjs.extend(updateLocale);
dayjs.locale('vi');

dayjs.updateLocale('vi', {
  calendar: {
    sameDay: '[Hôm nay]',
    nextDay: '[Ngày mai]',
    nextWeek: 'dddd', 
    lastDay: '[Hôm qua]',
    lastWeek: 'dddd [tuần trước]',
    sameElse: 'DD/MM/YYYY',
  },
});

export const useRelativeDate = (date: dayjs.Dayjs): string => {
  const relativeString = useMemo(() => {
    const today = dayjs().startOf('day');
    const targetDate = date.startOf('day');
    const diffInDays = targetDate.diff(today, 'day');

    if (Math.abs(diffInDays) <= 1) {
      return targetDate.calendar(null, {
        sameDay: '[Hôm nay]',
        nextDay: '[Ngày mai]',
        lastDay: '[Hôm qua]',
      });
    }

    if (diffInDays > 1 && diffInDays <= 6) {
      return `${diffInDays} ngày sau`;
    }
    if (diffInDays < -1 && diffInDays >= -6) {
      return `${Math.abs(diffInDays)} ngày trước`;
    }

    if (diffInDays > 6 && diffInDays <= 13) {
      return 'Tuần sau';
    }
    if (diffInDays < -6 && diffInDays >= -13) {
      return 'Tuần trước';
    }

    return date.fromNow();

  }, [date]);

  return relativeString;
};