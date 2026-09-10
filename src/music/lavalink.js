const { LavalinkManager } = require('lavalink-client');
const config = {
    discord: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.CLIENT_ID
    },
    lavalink: {
        host: process.env.LAVALINK_HOST || 'localhost',
        port: parseInt(process.env.LAVALINK_PORT || '2333', 10),
        password: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
        secure: process.env.LAVALINK_SECURE === 'true'
    }
};

/**
 * Initialize LavalinkManager for discord.js v14
 * @param {import('discord.js').Client} client
 * @returns {LavalinkManager}
 */
function createLavalinkManager(client) {
    const lavalink = new LavalinkManager({
        nodes: [
            {
                authorization: config.lavalink.password,
                host: config.lavalink.host,
                port: config.lavalink.port,
                secure: config.lavalink.secure,
                id: 'main-node',
                nodeType: 'Lavalink',
                retryAmount: 20,
                retryDelay: 5000,
                requestSignalTimeoutMS: 30000,
                closeOnError: false,
                heartBeatInterval: 30000,
                enablePingOnStatsCheck: true
            }
        ],
        sendToShard: (guildId, payload) => {
            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
        client: {
            id: config.discord.clientId || 'unknown',
            username: 'Discord Music Bot'
        },
        // Required for lavalink-client v2 to correctly resolve node availability
        playerOptions: {
            defaultSearchPlatform: 'ytsearch',
            onEmptyQueue: {
                destroyAfterMs: 30000
            },
            onDisconnect: {
                destroy: true
            },
            volumeDecrementer: 1
        },
        // Prevents 'No available Node' when node is still warming up
        autoSkipOnResolveError: true,
        emitNewSongsOnly: false,
        linksBlacklist: [],
        linksAllowList: []
    });

    return lavalink;
}

module.exports = { createLavalinkManager };
