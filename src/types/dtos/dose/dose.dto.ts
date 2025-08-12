import { DoseStatus } from "@/types/enums/dose-status.enum";
import { MealRelation } from "./meal-relation.dto";

export interface Dose {
  id: string;
  medication_name: string;
  dosage_instructions: string;
  usage_instructions?: string;
  due_at: string; 
  
  // SỬ DỤNG ENUM ĐỂ ĐỒNG BỘ VỚI BACKEND
  status: DoseStatus;

  // Các trường chỉ tồn tại ở client-side để quản lý UI
  is_prepared: boolean; 
  
  // Các trường có thể có từ backend
  next_doses?: string[]; 
  meal_relation?: MealRelation | null;
}