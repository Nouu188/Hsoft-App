import { useState, useCallback, useMemo } from 'react';
import { Stat, HealthStatsProps } from '../types';

/**
 * Hook quản lý danh sách các thống kê (stats).
 * - Cho phép thêm stat mới
 * - Tách riêng stat nhịp tim, stat bước đi và các stat khác
 */
export const useStats = (initialStats: Stat[]) => {
  // State chứa toàn bộ danh sách thống kê
  const [stats, setStats] = useState<Stat[]>(initialStats);

  // Hàm thêm stat mới
  const addStat = useCallback((newStat: Stat) => {
    setStats((prev) => [...prev, newStat]);
  }, []);

  // Lấy stat nhịp tim (heart)
  const heartStat = useMemo(() => stats.find((s) => s.key === 'heart'), [stats]);

  // Lấy stat bước đi (steps)
  const stepStat = useMemo(() => stats.find((s) => s.key === 'steps'), [stats]);

  // Lấy các stat khác (ngoài heart và steps)
  const extraStats = useMemo(
    () => stats.filter((s) => s.key !== 'heart' && s.key !== 'steps'),
    [stats]
  );

  return {
    stats,      // toàn bộ thống kê
    addStat,    // thêm thống kê mới
    heartStat,  // stat nhịp tim
    stepStat,   // stat bước đi
    extraStats, // các stat khác
  };
};
