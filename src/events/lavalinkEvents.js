const { buildNowPlayingEmbed, buildNowPlayingButtons } = require('../utils/embeds');

/**
 * Setup Lavalink Manager Event Listeners
 * @param {import('discord.js').Client} client 
 */
function setupLavalinkEvents(client) {
    const lavalink = client.lavalink;
    if (!lavalink) return;

    // Node Connection Events
    lavalink.nodeManager.on('connect', (node) => {
        console.log(`[LAVALINK] Connected to Lavalink Node: ${node.id} (${node.options.host}:${node.options.port})`);
    });

    lavalink.nodeManager.on('disconnect', (node, reason) => {
        console.warn(`[LAVALINK WARNING] Disconnected from Lavalink Node: ${node.id}. Reason:`, reason);
    });

    lavalink.nodeManager.on('error', (node, error) => {
        console.error(`[LAVALINK ERROR] Error on Node ${node.id}:`, error?.message || error);
    });

    lavalink.nodeManager.on('reconnecting', (node) => {
        console.log(`[LAVALINK] Reconnecting to Lavalink Node: ${node.id}...`);
    });

    // Player Events
    lavalink.on('playerCreate', (player) => {
        console.log(`[MUSIC] Player created for Guild: ${player.guildId}`);
    });

    lavalink.on('playerDestroy', (player, reason) => {
        console.log(`[MUSIC] Player destroyed for Guild: ${player.guildId}. Reason: ${reason}`);
    });

    // Track Events
    lavalink.on('trackStart', async (player, track) => {
        console.log(`[MUSIC] Track started in Guild ${player.guildId}: ${track.info.title}`);

        if (!player.textChannelId) return;
        const channel = client.channels.cache.get(player.textChannelId);
        if (!channel) return;

        try {
            const embed = buildNowPlayingEmbed(track, player);
            const buttons = buildNowPlayingButtons(player);
            const msg = await channel.send({ embeds: [embed], components: [buttons] });
            
            // Optionally store last now-playing message ID on player for updates
            player.set('lastNowPlayingMsgId', msg.id);
        } catch (err) {
            console.error(`[MUSIC ERROR] Failed to send now playing message in channel ${player.textChannelId}:`, err);
        }
    });

    lavalink.on('trackEnd', (player, track, reason) => {
        console.log(`[MUSIC] Track ended in Guild ${player.guildId}: ${track?.info?.title || 'Unknown'} (${reason})`);
    });

    lavalink.on('trackError', async (player, track, payload) => {
        console.error(`[MUSIC ERROR] Track error in Guild ${player.guildId}: ${track?.info?.title || 'Unknown'}:`, payload.exception || payload);
        
        // Auto-recovery: If YouTube stream fails to extract audio, fallback to SoundCloud stream
        if (track?.info?.sourceName === 'youtube' && !track.userData?.isFallback) {
            try {
                console.log(`[MUSIC RECOVERY] Attempting SoundCloud fallback stream for: "${track.info.title}"`);
                const fallbackRes = await player.search({ query: `scsearch:${track.info.title}` }, track.userData?.requester);
                if (fallbackRes?.tracks?.length > 0) {
                    const fallbackTrack = fallbackRes.tracks[0];
                    fallbackTrack.userData = { ...fallbackTrack.userData, isFallback: true };
                    // Play immediately as replacement
                    await player.queue.add(fallbackTrack, 0);
                    await player.skip();
                    if (player.textChannelId) {
                        const channel = client.channels.cache.get(player.textChannelId);
                        if (channel) {
                            channel.send(`🔄 YouTube stream restricted; switching to audio stream: **${fallbackTrack.info.title}**`).catch(() => {});
                        }
                    }
                    return;
                }
            } catch (recoveryErr) {
                console.error('[MUSIC RECOVERY ERROR]', recoveryErr);
            }
        }

        if (player.textChannelId) {
            const channel = client.channels.cache.get(player.textChannelId);
            if (channel) {
                channel.send(`⚠️ Error playing **${track?.info?.title || 'Track'}**: ${payload.exception?.message || 'Playback error occurred'}`).catch(() => {});
            }
        }
    });

    lavalink.on('trackStuck', (player, track, payload) => {
        console.warn(`[MUSIC WARNING] Track stuck in Guild ${player.guildId}: ${track?.info?.title || 'Unknown'}`);
    });

    lavalink.on('queueEnd', (player) => {
        console.log(`[MUSIC] Queue ended for Guild ${player.guildId}`);
        if (player.textChannelId) {
            const channel = client.channels.cache.get(player.textChannelId);
            if (channel) {
                channel.send('🎵 The queue has finished! The bot will disconnect automatically if no new tracks are added.').catch(() => {});
            }
        }
    });
}

module.exports = { setupLavalinkEvents };
