import { gql } from "@apollo/client";

export const GET_DOSES_BY_DATE_RANGE = gql`
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

export const GET_DOSES_BY_SELECTED_DATE = gql`
  query GetMyDoses($selectedDate: String!) {
    dosesBySelectedDate(selectedDate: $selectedDate) {
      id
      due_at
      status
      medication_name
      dosage_instructions
      usage_instructions
    }
  }
`;  