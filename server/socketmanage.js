const log = require('./logger').log;
const Games = require('./game').createGames();


function addClientHolder(holderId, SOCKET_LIST) {
    const tempHolder = Games.holderList[holderId];
    sendAllInObj(SOCKET_LIST, 'addHolder', {
        holderName: tempHolder.name,
        holderId: tempHolder.id,
        options: {
            joinedPlayerCount: tempHolder.players.length,
            neededPlayerCount: tempHolder.neededPlayers,
            blindfolded: tempHolder.blindfolded,
            fieldSize: tempHolder.fieldSize
        }
    });
}

function updateClientHolders(socket) {
    const pack = [];
    for (i in Games.holderList) {
        var tempHolder = Games.holderList[i];
        pack.push({
            holderName: tempHolder.name,
            holderId: tempHolder.id,
            options: {
                joinedPlayerCount: tempHolder.players.length,
                neededPlayerCount: tempHolder.neededPlayers,
                blindfolded: tempHolder.blindfolded,
                fieldSize: tempHolder.fieldSize
            }
        });
    }

    socket.emit('updateHolders', pack);
}

function sendAllIn(list, key, data) {
    list.forEach(socket => {
        socket.emit(key, data);
    });
}

function sendAllInObj(obj, key, data) {
    for (i in obj) {
        obj[i].emit(key, data);
    };
}

function holderChanged(holder, SOCKET_LIST, holderId) {
    // Wie viele Spieler werden noch erwartet?
    sendAllIn(holder.players, 'updateRemainderText', {
        remaindingPlayers: holder.neededPlayers - holder.players.length
    });
    // Remainding Player Text im Menu aktualisieren
    sendAllInObj(SOCKET_LIST, 'updateHolder', {
        holderId: holderId,
        name: holder.name,
        joinedPlayerCount: holder.players.length,
        neededPlayerCount: holder.neededPlayers
    });
}


exports.setupSocket = function(socket, SOCKET_LIST) {
    do {
        socket.id = Math.random();
    } while (SOCKET_LIST.hasOwnProperty(socket.id))

    SOCKET_LIST[socket.id] = socket;

    updateClientHolders(socket);


    socket.on('joinGame', data => {
        socket.gameId = data.holderId;
        const holder = Games.holderList[data.holderId];
        if (holder.addPlayer(socket)) {
            // Neues Spiel wurde gestartet
            sendAllIn(holder.players, 'startGame', {});
            sendAllInObj(SOCKET_LIST, 'deleteHolder', { holderId: data.holderId });
            delete Games.holderList[data.holderId];
            log(Object.keys(Games.list).length + ' games and ' + Object.keys(Games.holderList).length + ' holders running!');
        } else {
            holderChanged(holder, SOCKET_LIST, data.holderId);
        }


    });


    socket.on('createGame', data => {
        if (data.name.length === 0 || data.name.length > 20 || !(/\S/.test(data.name))) {
            // Name existiert nicht,   ist zu lang oder         besteht nur aus Space
            return;
        }
        var holder = Games.createHolder({
            name: data.name,
            neededPlayers: data.playerAmount,
            blindfolded: data.blindfolded,
            fieldSize: data.fieldSize
        });
        do {
            holder.id = Math.random();
        } while (Games.holderList.hasOwnProperty(holder.id))
        Games.holderList[holder.id] = holder;

        addClientHolder(holder.id, SOCKET_LIST);

    });



    socket.on('disconnect', () => {
        log('- socket disconnect');
        const game = Games.list[socket.gameId];
        if (game) {

            game.players.forEach(player => {
                player.gameId = -1;
            });

            sendAllIn(game.players, 'endGame', {
                reason: 'A Player left the game'
            });

            delete Games.list[socket.gameId];
        } else {
            const holder = Games.holderList[socket.gameId];
            if (holder) {
                // remove this socket from the holder
                holder.players.splice( holder.players.indexOf(socket), 1 );
                // Update the display of the holder
                holderChanged(holder, SOCKET_LIST, socket.gameId);
            }
        }
        delete SOCKET_LIST[socket.id];
    });

    socket.on('clicked', data => {

        const game = Games.list[socket.gameId];
        if (!game) {
            return;
        }
        const tile = game.field.getTile(
            Math.floor(data.pos.x / data.tileSize),
            Math.floor(data.pos.y / data.tileSize)
        );

        game.field.setTile(
            Math.floor(data.pos.x / data.tileSize),
            Math.floor(data.pos.y / data.tileSize),
            Math.floor(Math.random() * 101)
        );

        sendAllIn(game.players, 'updateField', game.field.grid);
    });

    
}