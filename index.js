const mc = require('minecraft-protocol');
const Chunk = require('prismarine-chunk')('1.17.1'); // temp
var World = require('prismarine-world');
const Vec3 = require('vec3');

var server = mc.createServer({
	'online-mode': true,
	encryption: false,
	host: '0.0.0.0',
	port: 23343,
	version: "1.17.1"
});

const mcData = require('minecraft-data')(server.version);

// temp test chunks
const chunk = new Chunk();

for (let x = 0; x < 16; x++) {
	for (let z = 0; z < 16; z++) {
		chunk.setBlockType(new Vec3(x, 99, z), mcData.blocksByName.grass_block.id)
		chunk.setBlockData(new Vec3(x, 99, z), 1)
		for (let y = 0; y < 256; y++) {
			chunk.setSkyLight(new Vec3(x, y, z), 15)
		}
	}
}

let chunks = 2;

server.on('login', client => {
	let loginPacket = mcData.loginPacket;
	loginPacket.dimension.value.effects.value = "minecraft:the_end";

	client.on("packet", (data, meta) => {
		console.log(meta.name, data);
	});

	client.write('login', {
		entityId: client.id,
		isHardcore: false,
		gameMode: 0,
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

	client.write('position', {
		x: 0,
		y: 100,
		z: 0,
		yaw: 0,
		pitch: 0,
		flags: 0x00
	});
	
	// temp
	for (let x = -chunks; x <= chunks-1; x++) {
		for (let z = -chunks; z <= chunks-1; z++) {
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
		}
	}
});