const log = require('./logger').log;
const Fields = require('./field.js');


exports.createGames = function() {

    const Games = {};
    Games.create = function(options) {
        const game = {
            name: options.name,
            players: options.players,
            blindfolded: options.blindfolded,
            fieldSize: options.fieldSize,
            field: Fields.createField(options.fieldSize)
        }
        log('+ Created game ' + game.name +
            ' (size:' + game.fieldSize + ' playerCount:' + game.players.length + 
            ' blindfolded:'+game.blindfolded+')');
        game.field.createGrid();
        
        game.players.forEach(socket => {
            socket.emit('startGame', game.field.grid);
        });
        
        return game;
    }
    Games.addNewGame = function(options) {
        const game = Games.create(options);
        
        Games.list[options.id] = game;
    }
    Games.list = {};
    



    Games.createHolder = function(options) {
    
        const Holder = {
            id: Math.random(),
            name: options.name,
            neededPlayers: options.neededPlayers,
            players: [],
            blindfolded: options.blindfolded,
            fieldSize: options.fieldSize
        };
        log('+ Created Holder ' + Holder.name +
            ' (size:' + Holder.fieldSize + ' neededPlayers:' + Holder.neededPlayers + 
            ' blindfolded:'+Holder.blindfolded+')');
        Holder.addPlayer = function(socket) {
            Holder.players.push(socket);
        socket.gameId = Holder.id;
            socket.emit('joined', { fieldSize: Holder.fieldSize });
            if (Holder.players.length === Holder.neededPlayers) {
                // Alle Spieler sind da, Spiel kann starten!
                Games.addNewGame({
                    id: Holder.id,
                    name: Holder.name,
                    players: Holder.players.slice(),
                    blindfolded: Holder.blindfolded,
                    fieldSize: Holder.fieldSize
                });
                Holder.players.length = 0;
                do {
                    Holder.id = Math.random();
                } while (Games.list.hasOwnProperty(Holder.id))
                return true;
            }
            return false;
        }
    
        return Holder;
    
    }
    Games.holderList = {};


    return Games;
}

