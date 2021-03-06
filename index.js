const fs = require('fs');
const mc = require('minecraft-protocol');
const mcData = require('minecraft-data')('1.17.1');
const Chunk = require('prismarine-chunk')('1.17.1');
const Vec3 = require('vec3');
const World = require('./lib/world.js');

const world = new World("./world.litematic");

function emptyChunkGen(chunkX, chunkY) {
	const chunk = new Chunk();

	if (chunkX == 0 && chunkY == 0) {
		chunk.setBlockType(new Vec3(0, 99, 0), 1);
	}

	for (let x = 0; x < 16; x++) {
		for (let z = 0; z < 16; z++) {
			for (let y = 0; y < 256; y++) {
				chunk.setSkyLight(new Vec3(x, y, z), 15);
			}
		}
	}

	return chunk;
}

var server = mc.createServer({
	'online-mode': true,
	encryption: false,
	host: '0.0.0.0',
	port: 23343,
	version: '1.17.1',
	motd: "A JavaScript"
});

let size = 8;
let list = [];

for (let x = -size; x <= size; x++) {
	for (let z = -size; z <= size; z++) {
		list.push([x, z]);
	}
}

server.on('login', client => {
	world.on('blockUpdate', console.log);
	let count = 0;
	let loginPacket = mcData.loginPacket;
	loginPacket.dimension.value.effects.value = "minecraft:the_end";

	client.on("packet", (data, meta) => {
		if (meta.name == "position_look" | meta.name == "position" | meta.name == "look" | meta.name == "keep_alive") return;
		console.log(meta.name, data);
	});

	client.write('login', {
		entityId: client.id,
		isHardcore: false,
		gameMode: 2,
		previousGameMode: 0,
		worldNames: loginPacket.worldNames,
		dimensionCodec: loginPacket.dimensionCodec,
		dimension: loginPacket.dimension,
		worldName: 'kingdom-of-the-moon:furry-potato',
		hashedSeed: [0, 0],
		maxPlayers: server.maxPlayers,
		viewDistance: 16,
		reducedDebugInfo: false,
		enableRespawnScreen: true,
		isDebug: false,
		isFlat: false
	});

	Chunks.forEach(coords => {
		world.getColumn(coords[0], coords[1]).then((chunk) => {
			client.write('map_chunk', {
				x: coords[0],
				z: coords[1],
				groundUp: true,
				biomes: chunk.dumpBiomes !== undefined ? chunk.dumpBiomes() : undefined,
				heightmaps: { type: 'compound', name: '', value: {} },
				bitMap: chunk.getMask(),
				chunkData: chunk.dump(),
				blockEntities: []
			});
			if (count++ == coords.length) {
				setTimeout(() => {
					client.write('position', {
						x: 0,
						y: 100,
						z: 0,
						yaw: 0,
						pitch: 0,
						flags: 0x00
					});
				}, 100);
			}
		});
	});

	client.on('position', data => {
		if (data.y < 0) client.write('position', { x: 0, y: 100, z: 0, yaw: 0, pitch: 0, flags: 0x00 });
	});

	client.on('chat', data => {
		if (data.message == "/edit") {
			client.write("game_state_change", {
				reason: 3,
				gameMode: 1
			});
			client.editing = true;
		}
		else for (const [key, value] of Object.entries(server.clients)) {
			value.write('chat', {
				message: JSON.stringify([
					{ text: client.username, color: "#99bbee" },
					{ text: ": ", color: "#6688aa" },
					{ text: data.message, color: "#ffffff" }
				]), position: 0, sender: client.uuid
			});
		}
	});
});