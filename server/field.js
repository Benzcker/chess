// -   Nichts
// B   Bauer
// T   Turm
// L   Läufer
// S   Springer
// D   Dame
// K   König


exports.createField = function(size) {

    const Field = {};

    Field.grid = [];
    Field.size = size;
    Field.createGrid = function () {
        Field.grid.length = 0;
        // Field.size = fieldSize || Field.size;

        for (var x = 0; x < Field.size; x++) {
            Field.grid[x] = [];
            for (var y = 0; y < Field.size; y++) {
                Field.grid[x][y] = '-';
            }
        }
    };
    Field.getTile = function (x, y) {
        return Field.grid[x][y];
    };
    Field.setTile = function (x, y, tile) {
        Field.grid[x][y] = tile;
    };

    return Field;
}