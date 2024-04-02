const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    isGuest: Boolean!
  }

  type Conversation {
    id: ID!
    participants: [User!]!
  }

  type ChatMessage {
    id: ID!
    content: String!
    sender: User!
    conversation: Conversation!
    createdAt: String!
  }

  type Query {
    conversations(userId: ID!): [Conversation!]
    chatMessages(conversationId: ID!): [ChatMessage!]
  }

  type Mutation {
    createMessage(conversationId: ID!, senderId: ID!, content: String!): ChatMessage!
    startConversation(userIds: [ID!]!): Conversation!
  }
`;

module.exports = typeDefs;
