import { gql } from '@apollo/client';

export const GET_MY_NOTIFICATION_HISTORY = gql`
  query GetMyNotificationHistory($offset: Int, $limit: Int) {
    myNotificationHistory(
      offset: $offset, 
      limit: $limit
    ) {
      id
      user_id
      title
      body
      dose_ids
      type
      status
      payload
      sentAt
      createdAt
    }
  }
`;