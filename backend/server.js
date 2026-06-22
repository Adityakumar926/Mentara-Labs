const { EventEmitter } = require('events');
// raise default limit to 20 for all new EventEmitter instances
EventEmitter.defaultMaxListeners = 20;
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/sockets');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});