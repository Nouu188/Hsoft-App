import { gql } from "@apollo/client";

export const REGISTER_FCM_TOKEN = gql`
  mutation RegisterFcmToken($deviceToken: DeviceTokenInput!) {
    registerFcmToken(deviceToken: $deviceToken)
  }
`;