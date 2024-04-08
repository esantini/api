const loki = require('lokijs');
const { sendEmail } = require('../utils/emailUtils');

const db = new loki(config.database, {
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true,
  autosaveInterval: 4000,
});
let messages;
let users;
let events;
let weddingMessages;
let initCallback = () => { };
let conversations;
let chatMessages;

// implement the autoloadback referenced in loki constructor
function databaseInitialize() {
  messages = db.getCollection('messages');
  if (messages === null) {
    messages = db.addCollection('messages');
  }

  // db.removeCollection('users');
  // db.removeCollection('conversations');
  // db.removeCollection('chatMessages');

  users = db.getCollection('users');
  if (users === null) {
    users = db.addCollection('users', { indices: ['userId'], unique: ['userId', 'email'] });
  }

  conversations = db.getCollection('conversations');
  if (conversations === null) {
    conversations = db.addCollection('conversations', { indices: ['chatId'] });
  }
  chatMessages = db.getCollection('chatMessages');
  if (chatMessages === null) {
    chatMessages = db.addCollection('chatMessages', { indices: ['chatId'] });
  }

  events = db.getCollection('events');
  if (events === null) {
    events = db.addCollection('events');
  }
  sessions = db.getCollection('sessions');
  if (sessions === null) {
    sessions = db.addCollection('sessions');
  }
  // events.clear();
  // sessions.clear();
  weddingMessages = db.getCollection('weddingMessages');
  if (weddingMessages === null) {
    weddingMessages = db.addCollection('weddingMessages');
  }

  // kick off any program logic or start listening to external events
  runProgramLogic();
}

// example method with any bootstrap logic to run after database initialized
function runProgramLogic() {
  console.log(`Number of messages in database : ${messages.count()}`);
  console.log(`Newest message: ${getMessage()}`);
  initCallback();
}

const addSession = ({ sessionId, geo = {} }) => {
  // Check if the session exists, if not create a new one
  let session = sessions.findOne({ sessionId });
  if (!session) {
    const timestamp = new Date();
    const localTime = timestamp.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    sendEmail({
      to: config.email.sessionSubscribers,
      subject: 'New Session',
      text: `New Session from ${geo?.city}, ${geo?.region}, ${geo?.country}<br />Date: ${localTime}`
    });
    console.log('New Session:', localTime);

    session = sessions.insert({ sessionId, geo, timestamp });
  }
  return session;
};
const deleteSession = (sessionId) => {
  // delete events and session with sessionId
  events.findAndRemove({ sessionId });
  sessions.findAndRemove({ $loki: sessionId });
};

const addEvent = (event) => {
  events.insert(event);
};
const getEvents = () => events.data;
const getWorldPoints = (daysAgo = 7) => {
  const dateDaysAgo = new Date();
  dateDaysAgo.setDate(dateDaysAgo.getDate() - daysAgo);

  const findObj = {
    timestamp: { '$gte': dateDaysAgo },
    geo: { '$ne': null },
  }

  // Find sessions where the timestamp is greater than dateDaysAgo
  return sessions.find(findObj).map(({ geo }) => geo.ll);
};
const getSessions = (daysAgo = 7) => {
  const dateDaysAgo = new Date();
  dateDaysAgo.setDate(dateDaysAgo.getDate() - daysAgo);

  // Find sessions where the timestamp is greater than dateDaysAgo
  return sessions.find({ timestamp: { '$gte': dateDaysAgo } });
};

const addMessage = (message) => messages.insert(message);
const getMessage = () => messages.where(() => true)[0]?.message;

const addUser = (user) => {
  if (getUser(user.email)) {
    return { isNew: false };
  } else {
    users.insert(user);
    return { isNew: true };
  }
};
const getUsers = () => users.data; // TODO remove
const getUser = (userId) => users.findOne({ userId });

const addConversation = () => conversations.insert({});

const addWeddingMessage = (message) => weddingMessages.insert(message);
const getWeddingMessages = () => weddingMessages.where(() => true);

module.exports = {
  db,
  init: (cb) => (initCallback = cb),
  addMessage,
  addUser,
  getUser,
  getUsers,
  addEvent,
  getEvents,
  addSession,
  getSessions,
  deleteSession,
  getMessage,
  getWorldPoints,
  addConversation,
  addWeddingMessage,
  getWeddingMessages,
};
