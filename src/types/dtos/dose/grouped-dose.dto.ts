import { Dose } from "./dose.dto";

export interface GroupedDose {
    
  time: string; 
  doses: Dose[];
}