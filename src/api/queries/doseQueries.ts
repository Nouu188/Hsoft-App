import { gql } from "@apollo/client";

export const GET_MY_DOSES = gql`
  # Query này không cần userId nữa
  query GetMyDoses($date: DateTime!) {
    dosesInWeek(date: $date) {
      id
      due_at
      status
      medication_name
      dosage_instructions
      usage_instructions
    }
  }
`;