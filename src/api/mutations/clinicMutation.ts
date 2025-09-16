import { gql } from "@apollo/client";

export const GET_ACTIVE_CLINIC = gql`
    query {
        activeClinics() {
            id
            externalCode
            name
        }
    }
`;

