import { gql } from "@apollo/client";

export const LOGIN_BY_IDENTIFIER_MUTATION = gql`
    mutation LOGIN($identifier: String!, $password: String!) {
        loginByIdentifier(loginInput: {
            identifier: $identifier,
            password: $password
        }) {
            accessToken    
        }
    }
`

export const LOGIN_BY_EMAIL_MUTATION = gql`
    mutation LOGIN($email: String!, $password: String!) {
        loginByEmail(loginInput: {
            email: $email,
            password: $password
        }) {
            accessToken    
        }
    }
`

export const REGISTER_BY_EMAIL_MUTATION = gql`
    mutation REGISTER($email: String!, $password: String!, $hoten: String!) {
        requestEmailVerification(registerInput: {
            email: $email,
            hoten: $hoten,
            password: $password
        }) {
            accessToken    
        }
    }
`