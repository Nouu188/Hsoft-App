import { gql } from "@apollo/client";

export const GET_MY_DOSES = gql`
  query GetMyDoses($startDate: String!, $endDate: String!) {
    dosesByDateRange(startDate: $startDate, endDate: $endDate) {
      id
      due_at
      status
      medication_name
      dosage_instructions
      usage_instructions
    }
  }
`;  