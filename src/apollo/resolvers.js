const { db } = require('../database'); // Assuming db.js is your database initialization file
const { sendEmail } = require('../utils');

const resolvers = {
  Query: {
    conversations: (_, { }, context) => {
      if (!context.getIsAdmin()) return [];
      const convCollection = db.getCollection('conversations');
      return convCollection.data.map(({ $loki }) => ({ chatId: $loki }));
    },
    requestChat: (_, { name }, context) => {
      // get chatId, if user is guest getChatId will create a conversation
      const chatId = context.getChatId();
      const user = context.getUser();
      sendEmail({
        subject: 'Chat Request',
        text: `Chat Request from ${user ? `User: ${user.name}` : name}`,
      });
      const messagesCollection = db.getCollection('chatMessages');
      const chat = messagesCollection.findObjects({ chatId });
      return chat ? chat : [];
    },
    chatMessages: (_, { chatId }, context) => {
      if (!context.getIsAdmin()) return []; // Non admin user should get messages from requestChat (for now...)
      const messagesCollection = db.getCollection('chatMessages');
      const chat = messagesCollection.findObjects({ chatId });
      return chat ? chat : [];
    },
    sessions: (_, { daysAgo = 7, includeEvents = true }) => {
      const sessionsTable = db.getCollection('sessions');
      const dateDaysAgo = new Date();
      dateDaysAgo.setDate(dateDaysAgo.getDate() - daysAgo);

      const sessions = sessionsTable.find({ timestamp: { '$gte': dateDaysAgo } });

      if (includeEvents) {
        const eventsTable = db.getCollection('events');
        const sessionIds = sessions.map(session => session.$loki);
        const events = eventsTable.find({ sessionId: { '$in': sessionIds } });
        const eventsBySessionId = [];

        events.forEach(event => {
          const sessionIdIndex = event.sessionId;
          if (!eventsBySessionId[sessionIdIndex]) {
            eventsBySessionId[sessionIdIndex] = [];
          }
          eventsBySessionId[sessionIdIndex].push(event);
        });

        return sessions.map(session => ({
          id: session.$loki,
          geo: session.geo,
          timestamp: session.timestamp,
          events: eventsBySessionId[session.$loki] || [],
        }));
      } else {
        return sessions.map(session => ({
          id: session.$loki,
          geo: session.geo,
          timestamp: session.timestamp,
          events: [],
        }));
      }
    },
  },
  Mutation: {
    setChatId: (_, { chatId }, context) => {
      if (!context.getIsAdmin()) return;
      context.setChatId(chatId);
      return true;
    },
    deleteSession: (_, { sessionId }, context) => {
      if (!context.getIsAdmin()) return;
      else if (parseInt(sessionId, 10) <= -1) {
        throw new Error('Invalid ID');
      }

      const eventsTable = db.getCollection('events');
      eventsTable.findAndRemove({ sessionId: parseInt(sessionId, 10) });

      const sessionsTable = db.getCollection('sessions');
      const session = sessionsTable.findOne({ '$loki': parseInt(sessionId, 10) });
      if (session) {
        sessionsTable.remove(session);
        return true;
      }
      return false;
    },
  },
  User: {
    // Additional resolver logic for user if necessary
  },
  Conversation: {
    // Additional resolver logic for conversation if necessary
  },
  ChatMessage: {
    // Additional resolver logic for message if necessary
  },
};

module.exports = resolvers;
