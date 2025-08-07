import { Dose } from "./dose.dto";

export interface GroupedDose {
  time: string; 
  timeOfDay: 'Sáng' | 'Trưa' | 'Chiều' | 'Tối'; 
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'MISSED'; 
  doses: Dose[]; 
}