import { createFieldLayer } from "./layers.js";
import { addMouseListener } from "./input.js";
import { getCheckedRadio } from "./DOM.js";
import { loadImage } from "./loaders.js";

window.onload = function() {
        
    const socket            = io();
    
    const screen            = document.getElementById('screen');
    const context           = screen.getContext('2d');
    
    const menu              = document.getElementById('menu');
    const game              = document.getElementById('game');

    const screenContainer   = document.getElementById('screenContainer');
    
    // ExitScreen
    const exitScreen            = document.getElementById('exitScreen');
    const exitScreenReason      = document.getElementById('exitScreenReason');

    function leaveExitScreen(event) {
        if (event) {
            event.preventDefault();
        }    
        exitScreen.hidden   = true;
        menu.hidden         = false;
    }
    
    exitScreen.addEventListener('click', event => {
        leaveExitScreen(event);
    });
    document.addEventListener('keyup', event => {
        if ( !exitScreen.hidden && event.code === 'Enter'){
            leaveExitScreen(event);
        }
    });

    // WaitingScreen
    const waitingScreen         = document.getElementById('waitingScreen');
    const wsRemaindingPlayers   = document.getElementById('waitingRemaindingPlayers');
    

    // Create Game Stuff
    const cgName            = document.getElementById('hostName');
    const cgFieldsize       = document.getElementsByName('menu-fieldsize');
    const cgPlayeramount    = document.getElementsByName('menu-playercount');
    const cgBlindfolded     = document.getElementById('blindfolded');

    window.createGame = function() {
        
        let fieldSize = getCheckedRadio(cgFieldsize);
        if (!fieldSize) { fieldSize = 8; } else { fieldSize = parseInt(fieldSize.value); }
        
        let playerAmount = getCheckedRadio(cgPlayeramount);
        if (!playerAmount) { playerAmount = 2; } else { playerAmount = parseInt(playerAmount.value); }


        socket.emit('createGame', {
            name: cgName.value,
            playerAmount: playerAmount,
            blindfolded: cgBlindfolded.checked,
            fieldSize: fieldSize
        });
        cgName.value = null;
    }

    // Join Game Stuff
    const joinContent = document.getElementById('menu-join-content');
    window.joinGame = function(id) {
        socket.emit('joinGame', {
            holderId: id
        });
    }

    
    socket.on('startGame', data => {
        waitingScreen.hidden = true;
        screenContainer.hidden = false;
    });
    socket.on('endGame', data => {
        context.clearRect(0, 0, screen.width, screen.height);

        screenContainer.hidden      = true;
        exitScreen.hidden           = false;
        exitScreenReason.innerText  = data.reason;
    });
    socket.on('updateHolders', data => {
        joinContent.innerHTML = '';
        data.forEach(game => {
            joinContent.innerHTML += createHolderLink( 
                game.holderName, game.holderId, 
                game.options);
        });
    });
    socket.on('updateHolder', data => {
        updateHolderLink( data );
    });
    socket.on('updateRemainderText', data => {
        wsRemaindingPlayers.innerText = data.remaindingPlayers;
    });
    socket.on('addHolder', data => {
        joinContent.innerHTML += createHolderLink(data.holderName, data.holderId, data.options);
    });
    socket.on('deleteHolder', data => {
        const holder = document.getElementById('holderLink' + data.holderId);
        holder.parentElement.removeChild(holder);
    });

    loadImage('client//img/figures.png')
    .then(figuresImg => {
        socket.on('joined', data => {
            menu.hidden = true;
            game.hidden = false;

            const fieldSize = data.fieldSize;
            const tileSize = screen.width / fieldSize;
            
            const drawField = createFieldLayer(document, fieldSize, tileSize, figuresImg);
                
            addMouseListener(screen, socket, tileSize);
                
            socket.on('updateField', data => {
                context.clearRect(0, 0, screen.width, screen.height);
                
                drawField(context, data);
            });
            socket.on('startGame', data => {
                context.clearRect(0, 0, screen.width, screen.height);
                
                drawField(context, data);
            });
                
        });
    });

    function createHolderLink(name, id, options) {
        return '<div id="holderLink' + id +'" class="menu-holderlink" onclick="joinGame(' + id + ')"> \
                    <p class="menu-holderlink-name" id="holderLinkCount'+ id +'">' + 
                        name + ' ' + options.joinedPlayerCount + '/' + options.neededPlayerCount + 
                    '</p>\
                    <div class="menu-holderlink-options-wrapper"> \
                        <p class="menu-holderlink-options">' + 
                            (options.blindfolded ? 'blindfolded' : '') + '<br>' + 
                            options.fieldSize + 'x' + options.fieldSize +
                        '</p> \
                    </div>\
                </div>';
    }

    function updateHolderLink(options) {
        const holderLink = document.getElementById('holderLinkCount' + options.holderId);
        if (!holderLink) {
            return;
        }
        holderLink.innerText = options.name + ' ' + options.joinedPlayerCount + '/' + options.neededPlayerCount;
    }


}

