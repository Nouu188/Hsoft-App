import type { Entity } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';

export interface AppointmentItem {
  key: string; 
  entity: Entity;
  date: string; 
  time?: string;
}

export default AppointmentItem;
