import { gql } from '@apollo/client';

export const MARK_NOTIFICATIONS_AS_READ = gql`
  mutation MarkNotificationsAsRead($input: MarkAsReadInput!) {
    markNotificationsAsRead(input: $input)
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;