const log = require('./server/logger').log

exports.create = function() {
    
    const express = require('express')
    const app = express();
    const server = require('http').Server(app);
    const port = 3000;
    
    app.get('/', (request, response) => {
        // log(request.url);
        response.sendFile(__dirname + '/client/index.html');
    });
    
    app.use('/client', express.static(__dirname + '/client'));
    
    server.listen(port, (err) => {
        if (err) {
            log(err);
        }
        log('Server started.')
    });

    return server;
}