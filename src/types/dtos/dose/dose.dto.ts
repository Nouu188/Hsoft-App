export interface Dose {
  id: string;
  medication_name: string;
  dosage_instructions: string;
  usage_instructions?: string;
  due_at: string;
  status: 'UPCOMING' | 'TAKEN' | 'SKIPPED';

  is_prepared: boolean; 
  next_doses?: string[]; 
}