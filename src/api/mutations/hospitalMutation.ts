import { gql } from '@apollo/client';

export const GET_HOSPITALS = gql`
  query GetHospitals($isActive: Boolean) {
    hospitals(isActive: $isActive) {
      id
      name
      externalCode
      graphqlEndpoint
    }
  }
`;
