import { MealRelationType } from "@/types/enums/meal-relation-type.enum";

export interface MealRelation {
  type: MealRelationType;
  minutes?: number;
}