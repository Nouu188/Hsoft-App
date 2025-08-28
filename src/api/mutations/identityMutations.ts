import { gql } from '@apollo/client';

export const CREATE_OR_UPDATE_IDENTITY = gql`
  mutation CreateOrUpdateIdentity($input: CreateOrUpdateIdentityInput!) {
    createOrUpdateIdentity(input: $input) {
      id
      userId
      fullName
      dob
      gender
      phoneNumber
      email
      idCardNumber
      bhytNumber
      address
    }
  }
`;