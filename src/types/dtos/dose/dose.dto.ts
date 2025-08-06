export interface Dose {
  id: string;
  due_at: string; // ISO Date String
  status: 'PENDING' | 'TAKEN' | 'SKIPPED';
  medication_name: string;
  dosage_instructions?: string;
  usage_instructions?: string;
}