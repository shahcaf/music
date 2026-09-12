const { LavalinkManager } = require('lavalink-client');
const config = require('../config');

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
                retryAmount: 50,
                retryDelay: 3000,
                requestSignalTimeoutMS: 30000,
                closeOnError: false,
                heartBeatInterval: 60000,
                enablePingOnStatsCheck: false
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
