import { gql } from "@apollo/client";

export const UPDATE_DOSE_STATUS = gql`
  mutation UpdateDoseStatus($doseId: ID!, $status: DoseStatus!) {
    updateDoseStatus(doseId: $doseId, status: $status) {
      id
      status
      taken_at
    }
  }
`;

export const UPDATE_DOSES_MUTATION = gql`
  mutation UpdateDoses($updates: [UpdateDoseInput!]!) {
    updateDoses(updates: $updates) {
      id
      due_at
      status
    }
  }
`;