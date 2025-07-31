import { gql } from "@apollo/client";

// src/graphql/queries.ts
export const GET_MY_DOSES = gql`
  # Query này không cần userId nữa
  query GetMyDoses($startDate: DateTime!, $endDate: DateTime!) {
    myDoses(startDate: $startDate, endDate: $endDate) {
      id
      due_at
      status
      medication_name
      dosage_instructions
      usage_instructions
    }
  }
`;