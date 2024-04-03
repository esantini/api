const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    name: String!
    email: ID!
    chatId: String!
  }

  type Conversation {
    chatId: ID!
  }

  type ChatMessage {
    chatId: ID!
    content: String!
    createdAt: String!
  }

  type Geo {
    range: String
    country: String
    region: String
    city: String
    ll: [Float]
    metro: Int
    area: Int
    eu: String
    timezone: String
  }

  type Session {
    id: Int
    sessionId: String
    geo: Geo
    timestamp: String
    events: [Event]
  }

  type EventDetails {
    page_path: String
    event_category: String
    event_label: String
    value: String
  }

  type Event {
    type: String
    details: EventDetails
    sessionId: Int
    timestamp: String
  }

  type Query {
    conversations(userId: ID!): [Conversation!]
    chatMessages(chatId: String!): [ChatMessage!]
    sessions(daysAgo: Int): [Session]
  }

  type Mutation {
    createMessage(conversationId: ID!, senderId: ID!, content: String!): ChatMessage!
    startConversation(userIds: [ID!]!): Conversation!
  }
`;

module.exports = typeDefs;
