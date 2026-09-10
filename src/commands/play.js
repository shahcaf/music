const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { formatDuration, checkVoiceChannel } = require('../utils/embeds');

/**
 * Use the YouTube Data API v3 to search and return the first video URL.
 * @param {string} query
 * @param {string} apiKey
 * @returns {Promise<string|null>} YouTube watch URL, or null
 */
async function searchYouTubeDataAPI(query, apiKey) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`YouTube Data API HTTP ${response.status}: ${text.slice(0, 200)}`);
    }
    const data = await response.json();

    if (data.error) {
        throw new Error(`YouTube Data API error: ${data.error.message}`);
    }

    const videoId = data?.items?.[0]?.id?.videoId;
    if (!videoId) return null;
    return `https://www.youtube.com/watch?v=${videoId}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song or playlist in your voice channel')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name or URL (YouTube, Spotify, SoundCloud, etc.)')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;
        const textChannelId = interaction.channelId;

        // Permission check
        const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return interaction.reply({
                content: '❌ I do not have permission to join and speak in your voice channel!',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            // Guard: ensure at least one Lavalink node is connected
            const connectedNodes = interaction.client.lavalink.nodeManager.nodes.filter(n => n.connected);
            if (connectedNodes.size === 0) {
                return interaction.editReply({
                    content: '❌ The music server is not connected yet. Please wait a few seconds and try again.'
                });
            }

            // Get or create player
            let player = interaction.client.lavalink.getPlayer(interaction.guildId);
            if (!player) {
                player = await interaction.client.lavalink.createPlayer({
                    guildId: interaction.guildId,
                    voiceChannelId: voiceChannel.id,
                    textChannelId,
                    selfDeaf: true,
                    volume: 100,
                    node: 'main-node'  // explicit node ID — bypasses leastUsedNodes() filter
                });
            }

            if (!player.connected) {
                await player.connect();
            }

            // ── Resolve the query into a URL ────────────────────────────────
            const isUrl = query.startsWith('http://') || query.startsWith('https://');
            let resolvedUrl = isUrl ? query : null;

            if (!isUrl) {
                const apiKey = process.env.YOUTUBE_API_KEY;
                if (apiKey) {
                    try {
                        resolvedUrl = await searchYouTubeDataAPI(query, apiKey);
                        if (resolvedUrl) {
                            console.log(`[YT DATA API] "${query}" → ${resolvedUrl}`);
                        } else {
                            console.warn(`[YT DATA API] No results for: "${query}"`);
                        }
                    } catch (apiErr) {
                        console.warn(`[YT DATA API ERROR] ${apiErr.message}`);
                    }
                }
            }

            // ── Search via Lavalink ─────────────────────────────────────────
            // Prefer a direct URL so the resolver does not select an incompatible
            // media source when the YouTube Data API found an exact result.
            let res = null;
            if (isUrl || resolvedUrl) {
                res = await player.search({ query: resolvedUrl }, interaction.user);
                console.log(`[LAVALINK SEARCH] Direct URL LoadType=${res?.loadType}, Tracks=${res?.tracks?.length ?? 0}`);
            }

            // Search Strategy 1: SoundCloud search (Fastest & 100% reliable audio streaming without YouTube cipher/login blocks)
            if (!res || !res.tracks || res.tracks.length === 0) {
                const searchQuery = `scsearch:${query}`;
                console.log(`[LAVALINK SEARCH] Searching SoundCloud: ${searchQuery}`);
                res = await player.search({ query: searchQuery }, interaction.user);
            }

            // Search Strategy 2: YouTube search
            if (!res || !res.tracks || res.tracks.length === 0) {
                const searchQuery = `ytsearch:${query}`;
                console.log(`[LAVALINK SEARCH] Searching YouTube: ${searchQuery}`);
                res = await player.search({ query: searchQuery }, interaction.user);
            }

            // Search Strategy 3: YouTube Music search
            if (!res || !res.tracks || res.tracks.length === 0) {
                const searchQuery = `ytmsearch:${query}`;
                console.log(`[LAVALINK SEARCH] Searching YouTube Music: ${searchQuery}`);
                res = await player.search({ query: searchQuery }, interaction.user);
            }

            // Still nothing?
            if (!res || !res.tracks || res.tracks.length === 0) {
                return interaction.editReply({
                    content: `❌ No results found for: \`${query}\``
                });
            }

            // ── Add track(s) to queue ────────────────────────────────────────
            if (res.loadType === 'playlist') {
                await player.queue.add(res.tracks);
                const playlistName = res.playlist?.name || 'Playlist';

                const embed = new EmbedBuilder()
                    .setColor('#00FF7F')
                    .setTitle('📚 Playlist Added to Queue')
                    .setDescription(`Added **${res.tracks.length} tracks** from **[${playlistName}](${query})**`)
                    .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

                await interaction.editReply({ embeds: [embed] });
            } else {
                const track = res.tracks[0];
                await player.queue.add(track);

                if (player.playing || player.paused) {
                    const embed = new EmbedBuilder()
                        .setColor('#0099FF')
                        .setTitle('🎵 Track Added to Queue')
                        .setDescription(`[**${track.info.title}**](${track.info.uri})`)
                        .addFields(
                            { name: '👤 Artist', value: track.info.author || 'Unknown', inline: true },
                            { name: '⏱️ Duration', value: formatDuration(track.info.duration), inline: true },
                            { name: '📍 Queue Position', value: `#${player.queue.tracks.length}`, inline: true }
                        )
                        .setThumbnail(track.info.artworkUrl || track.info.pluginInfo?.artworkUrl || null)
                        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

                    await interaction.editReply({ embeds: [embed] });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor('#00FF7F')
                        .setTitle('🎶 Now Loading...')
                        .setDescription(`[**${track.info.title}**](${track.info.uri})`)
                        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

                    await interaction.editReply({ embeds: [embed] });
                }
            }

            // Start playing if idle
            if (!player.playing && !player.paused) {
                await player.play();
            }

        } catch (err) {
            console.error('[PLAY ERROR]', err);
            await interaction.editReply({
                content: `❌ Could not play track: ${err?.message || 'Unknown error'}`
            }).catch(() => {});
        }
    }
};
