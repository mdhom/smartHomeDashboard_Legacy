function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function toTimeString(d) {
    const hour     = pad(d.getHours(), 2);
    const minute   = pad(d.getMinutes(), 2);
    const second   = pad(d.getSeconds(), 2);
    return `${hour}:${minute}:${second}`;
}