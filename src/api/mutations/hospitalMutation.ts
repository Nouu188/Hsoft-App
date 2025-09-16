import { gql } from '@apollo/client';

export const GET_HOSPITALS = gql`
  query {
    hospitals {
      id
      name
      externalCode
    }
  }
`;
