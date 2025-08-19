import { useState, useEffect } from 'react';
import { ScheduleData } from '../types';

/**
 * Custom hook để fetch và quản lý state của lịch trình tiếp theo.
 * Trong thực tế, đây là nơi bạn sẽ gọi API.
 */
export const useNextSchedule = () => {
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hàm giả lập việc fetch dữ liệu từ API
    const fetchSchedule = () => {
      // --- Kịch bản 1: Có lịch trình ---
      const scheduleData: ScheduleData = {
        id: 'schedule-123',
        title: 'Uống 1 viên Panadol Extra',
        subtitle: 'Vào lúc 14:00 hôm nay',
      };
      setSchedule(scheduleData);

      // --- Kịch bản 2: Không có lịch trình (bạn có thể bỏ comment dòng dưới để test) ---
      // setSchedule(null);
      
      setIsLoading(false);
    };

    // Giả lập độ trễ mạng là 1.5 giây
    const timer = setTimeout(fetchSchedule, 1500);

    // Dọn dẹp timer khi component bị unmount
    return () => clearTimeout(timer);
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần

  return { schedule, isLoading };
};