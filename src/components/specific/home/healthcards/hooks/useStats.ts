import { useState, useCallback, useMemo } from 'react';
import { Stat, HealthStatsProps } from '../types';

export const useStats = (initialStats: Stat[]) => {
  const [stats, setStats] = useState<Stat[]>(initialStats);

  const addStat = useCallback((newStat: Stat) => {
    setStats((prev) => [...prev, newStat]);
  }, []);

  // Dùng useMemo để tối ưu, chỉ tính toán lại khi `stats` thay đổi
  const heartStat = useMemo(() => stats.find((s) => s.key === 'heart'), [stats]);
  const stepStat = useMemo(() => stats.find((s) => s.key === 'steps'), [stats]);
  const extraStats = useMemo(() => stats.filter((s) => s.key !== 'heart' && s.key !== 'steps'), [stats]);

  return {
    stats,
    addStat,
    heartStat,
    stepStat,
    extraStats,
  };
};