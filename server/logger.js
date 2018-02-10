
exports.log = function log(msgs) {
    if (msgs.constructor !== Array) {
        return;
    }
    msgs.forEach(arg => {

        // Was auch immer mit den Logs gemacht werden soll
        console.log('Log: ' + arg);
        
    });
}