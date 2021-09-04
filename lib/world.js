const fs = require('fs');
const nbt = require('prismarine-nbt');
const zlib = require('zlib');

module.exports = class World {
    constructor(path, startX, startY) {
        zlib.unzip(fs.readFileSync(path), (err, buf) => {
            nbt.parse(buf).then((data) => console.log(JSON.stringify(data, null, "\t")));
        });
    }
}