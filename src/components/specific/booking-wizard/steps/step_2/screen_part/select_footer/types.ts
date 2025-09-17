import type { Entity } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';

export interface AppointmentItem {
  key: string; // e.g. 'entityId-YYYY-MM-DD'
  entity: Entity;
  date: string; // 'YYYY-MM-DD'
  time?: string;
}

export default AppointmentItem;
