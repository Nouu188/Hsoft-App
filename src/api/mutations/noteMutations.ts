import { gql } from "@apollo/client";

export const CREATE_NOTE = gql`
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(createNoteInput: $input) {
      id
      title
      content
      metadata
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_NOTE = gql`
  mutation UpdateNote($input: UpdateNoteInput!) {
    updateNote(updateNoteInput: $input) {
      id
      title
      content
      metadata
      updatedAt
    }
  }
`;

export const REMOVE_NOTE = gql`
  mutation RemoveNote($id: ID!) {
    removeNote(id: $id)
  }
`;