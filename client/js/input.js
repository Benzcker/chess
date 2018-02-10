export function addMouseListener(screen, socket, tileSize){
    screen.addEventListener('mouseup', event => {

        function mouseToScreen(evt, screen) {
            const rect = screen.getBoundingClientRect(), // abs. size of element
                scaleX = screen.width / rect.width,    // relationship bitmap vs. element for X
                scaleY = screen.height / rect.height;  // relationship bitmap vs. element for Y

            return {
                x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
                y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
            }
        }

        if (event.button === 0) {
            // console.log(event);
            const mouse = mouseToScreen(event, screen);

            socket.emit('clicked', {
                pos: mouse,
                tileSize: tileSize
            });
        }
    });
}