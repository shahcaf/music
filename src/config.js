require('dotenv').config();

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
    },
    spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    },
    youtubeApiKey: process.env.YOUTUBE_API_KEY
};

function validateConfig() {
    const missing = [];
    if (!config.discord.token) missing.push('DISCORD_TOKEN');
    if (!config.discord.clientId) missing.push('CLIENT_ID');

    if (missing.length > 0) {
        console.warn(`[CONFIG WARNING] Missing environment variables: ${missing.join(', ')}.`);
        console.warn('[CONFIG WARNING] Please update your .env file before running the bot.');
    }
}

validateConfig();

module.exports = config;
