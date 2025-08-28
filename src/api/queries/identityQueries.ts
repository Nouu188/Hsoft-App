import { gql } from '@apollo/client';

export const GET_IDENTITY_BY_USER_ID = gql`
  query GetIdentityByUserId($userId: ID!) {
    identityByUserId(userId: $userId) {
      id
      userId
      fullName
      externalPatientCode
      gender
      phoneNumber
      nationalId
      healthInsuranceNumber
      address
      birthYear
      createdAt
      updatedAt
      hospitals {
        id
        name
        graphqlEndpoint
      }
    }
  }
`;
