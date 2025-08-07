import { gql } from "@apollo/client";

export const REGISTER_FCM_TOKEN = gql`
    mutation REGISTER_FCM_TOKEN($fcm_token: String!) {
        registerFcmToken(fcm_token: $fcm_token) 
    }
`