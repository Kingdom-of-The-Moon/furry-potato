const Block = require('prismarine-block')('1.17.1');
const Vec3 = require('vec3');

module.exports = class WorldManager {
    constructor(client, world, inv) {
        client.on('block_place', data => {
            if (!client.editing) return;
            let pos = data.location;
            if (data.direction == 0) pos.y-=1;
            if (data.direction == 1) pos.y+=1;
            if (data.direction == 2) pos.z-=1;
            if (data.direction == 3) pos.z+=1;
            if (data.direction == 4) pos.x-=1;
            if (data.direction == 5) pos.x+=1;
            world.setBlock(new Vec3(pos), new Block(inv.selectedItem, 0, 0));
        });
        client.on('block_dig', data => {
            if (!client.editing) return;
            let pos = data.location;
            world.setBlock(new Vec3(pos), new Block(0, 0, 0));
        });
    }
}