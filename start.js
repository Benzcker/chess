const log = require('./server/logger').log;

const server = require('./createServer').create();
const setupSocket = require('./server/socketmanage').setupSocket;

const SOCKET_LIST = {};
const io = require('socket.io')(server, {});

io.sockets.on('connection', (socket) => {

    log('+ socket connection');
    setupSocket(socket, SOCKET_LIST);

});

