import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
    mutation LOGIN($identifier: String!, $password: String!) {
        login(loginInput: {
            identifier: $identifier,
            password: $password
        }) {
            accessToken    
        }
    }
`