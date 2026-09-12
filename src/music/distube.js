const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');

/**
 * Initialize DisTube Client Instance for standalone audio playback
 * @param {import('discord.js').Client} client
 * @returns {DisTube}
 */
function createDisTube(client) {
    const distube = new DisTube(client, {
        emitNewSongOnly: true,
        emitAddSongWhenCreatingQueue: false,
        emitAddListWhenCreatingQueue: false,
        plugins: [
            new SpotifyPlugin(),
            new SoundCloudPlugin(),
            new YtDlpPlugin()
        ]
    });

    return distube;
}

module.exports = { createDisTube };
