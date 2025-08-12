import { GroupedDoseStatus } from "@/types/enums/grouped-dose-status.enum";
import { Dose } from "./dose.dto";

export interface GroupedDose {
  time: string; 
  timeOfDay: 'Sáng' | 'Trưa' | 'Chiều' | 'Tối'; 
  
  status: GroupedDoseStatus; 
  
  doses: Dose[]; 
}