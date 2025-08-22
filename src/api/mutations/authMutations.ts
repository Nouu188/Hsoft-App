import { gql } from "@apollo/client";

export const LOGIN_BY_IDENTIFIER_MUTATION = gql`
    mutation LOGIN($identifier: String!, $password: String!) {
        loginByIdentifier(loginInput: {
            identifier: $identifier,
            password: $password
        }) {
            accessToken    
            user {
                id
                hoten
                sodienthoai
                socmnd
                email
                avatarUrl
                roles
            } 
        }
    }
`;

export const LOGIN_BY_EMAIL_MUTATION = gql`
    mutation LOGIN($email: String!, $password: String!) {
        loginByEmail(loginInput: {
            email: $email,
            password: $password
        }) {
            accessToken,
            user {
                id
                hoten
                sodienthoai
                socmnd
                email
                avatarUrl
                roles
            } 
        }
    }
`;

export const LOGIN_WITH_GOOGLE_MUTATION = gql`
  mutation LoginWithGoogle($googleLoginInput: GoogleLoginInput!) {
    loginWithGoogle(googleLoginInput: $googleLoginInput) {
      accessToken
      user {
        id
        hoten
        sodienthoai
        socmnd
        email
        avatarUrl
        roles
      }
    }
  }
`;

export const REQUEST_EMAIL_VERIFICATION_MUTATION = gql`
    mutation RequestEmailVerification($email: String!, $password: String!, $hoten: String!) {
        requestEmailVerification(registerInput: {
            email: $email,
            hoten: $hoten,
            password: $password
        }) {
            success
            message    
        }
    }
`;

export const EMAIL_REGISTER_MUTATION = gql`
    mutation VerifyEmailAndRegister($email: String!, $otp: String!) {
        verifyEmailAndRegister(verifyInput: {
            email: $email,
            otp: $otp
        }) {
            accessToken 
            user {
                id
                hoten
                sodienthoai
                socmnd
                email
                avatarUrl
                roles
            }   
        }
    }
`;

