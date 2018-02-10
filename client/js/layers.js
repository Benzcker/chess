import { XOR } from "./math.js";

function createBackgroundLayer(document, fieldSize, tileSize) {

    const background = document.createElement('canvas');
    background.width = fieldSize * tileSize;
    background.height = fieldSize * tileSize;
    const ctx = background.getContext('2d');

    function redraw() {
        for (let x = 0; x < fieldSize; x++) {
            for (let y = 0; y < fieldSize; y++) {
                ctx.fillStyle = XOR(x % 2 === 0, y % 2 === 0) ? 'black' : 'white';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }

    return function drawBackground(context) {
        redraw();
        context.drawImage(background, 0, 0);
    };

}


export function createFieldLayer(document, fieldSize, tileSize, figuresImg) {
    
        const drawBackground = createBackgroundLayer(document, fieldSize, tileSize);
                
        return function drawField(context, field) {
            context.font = tileSize + 'px Arial';
            context.fillStyle = 'gray';

            drawBackground(context);
            
            for (let x = 0; x < fieldSize; x++) {
                for (let y = 0; y < fieldSize; y++ ){
                    context.fillText( field[x][y], x*tileSize, (y+1)*tileSize );
                }
            }
        };

}