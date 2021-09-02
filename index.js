const mc = require('minecraft-protocol');
const mcData = require('minecraft-data')('1.17.1');
const Chunk = require('prismarine-chunk')('1.17.1');
const World = require('prismarine-world')('1.17.1');
const Anvil = require('./prismarine-provider-anvil/index.js').Anvil('1.17.1');
const Vec3 = require('vec3');

function chunkGen(chunkX, chunkY) {
	const chunk = new Chunk();

	for (let x = 0; x < 16; x++) {
		for (let z = 0; z < 16; z++) {
			chunk.setBlockType(new Vec3(x, 99, z), mcData.blocksByName.grass_block.id);
			chunk.setBlockData(new Vec3(x, 99, z), 1);
			for (let y = 0; y < 256; y++) {
				chunk.setSkyLight(new Vec3(x, y, z), 15);
			}
		}
	}

	return chunk;
}

let world = new World(chunkGen, new Anvil("./chunks/"), 5000);

var server = mc.createServer({
	'online-mode': true,
	encryption: false,
	host: '0.0.0.0',
	port: 23343,
	version: '1.17.1'
});

let chunks = 2;

server.on('login', client => {
	let loginPacket = mcData.loginPacket;
	loginPacket.dimension.value.effects.value = "minecraft:the_end";

	client.on("packet", (data, meta) => {
		//console.log(meta.name, data);
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

	for (let x = -chunks; x <= chunks - 1; x++) {
		for (let z = -chunks; z <= chunks - 1; z++) {
			world.getColumn(x, z).then((chunk) => {
				console.log(`Chunk ${x} ${z}`);
				client.write('map_chunk', {
					x: x,
					z: z,
					groundUp: true,
					biomes: chunk.dumpBiomes !== undefined ? chunk.dumpBiomes() : undefined,
					heightmaps: { type: 'compound', name: '', value: {} },
					bitMap: chunk.getMask(),
					chunkData: chunk.dump(),
					blockEntities: []
				});
				client.write('position', {
					x: 0,
					y: 100,
					z: 0,
					yaw: 0,
					pitch: 0,
					flags: 0x00
				});
			});
		}
	}

	client.on('chat', data => {
		console.log(client.uuid)
		for (const [key, value] of Object.entries(server.clients)) {
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