const { buildNowPlayingEmbed, buildNowPlayingButtons } = require('../utils/embeds');

/**
 * Setup DisTube Event Listeners
 * @param {import('discord.js').Client} client 
 */
function setupDisTubeEvents(client) {
    const distube = client.distube;
    if (!distube) return;

    distube.on('playSong', async (queue, song) => {
        console.log(`[MUSIC] Playing: ${song.name} in guild ${queue.textChannel?.guild?.id}`);
        if (!queue.textChannel) return;

        try {
            const embed = buildNowPlayingEmbed(song, queue);
            const buttons = buildNowPlayingButtons(queue);
            const msg = await queue.textChannel.send({ embeds: [embed], components: [buttons] });
            queue.lastNowPlayingMsgId = msg.id;
        } catch (err) {
            console.error('[MUSIC ERROR] Error sending now playing message:', err);
        }
    });

    distube.on('addSong', (queue, song) => {
        console.log(`[MUSIC] Added song: ${song.name}`);
        if (!queue.textChannel) return;
        queue.textChannel.send(`🎵 Added **[${song.name}](${song.url})** - \`${song.formattedDuration}\` to the queue!`).catch(() => {});
    });

    distube.on('addList', (queue, playlist) => {
        console.log(`[MUSIC] Added playlist: ${playlist.name}`);
        if (!queue.textChannel) return;
        queue.textChannel.send(`📚 Added playlist **[${playlist.name}](${playlist.url})** (${playlist.songs.length} songs) to the queue!`).catch(() => {});
    });

    distube.on('error', (channel, error) => {
        console.error('[DISTUBE ERROR]', error);
        if (channel && typeof channel.send === 'function') {
            channel.send(`❌ An error occurred during playback: ${error?.message || 'Playback error'}`).catch(() => {});
        }
    });

    distube.on('finish', (queue) => {
        console.log(`[MUSIC] Queue finished in guild ${queue.textChannel?.guild?.id}`);
        if (queue.textChannel) {
            queue.textChannel.send('🎵 The queue has finished! The bot will disconnect if no new tracks are added.').catch(() => {});
        }
    });

    distube.on('empty', (queue) => {
        console.log(`[MUSIC] Voice channel empty in guild ${queue.textChannel?.guild?.id}`);
        if (queue.textChannel) {
            queue.textChannel.send('👋 Voice channel is empty. Leaving channel...').catch(() => {});
        }
    });
}

module.exports = { setupDisTubeEvents };
