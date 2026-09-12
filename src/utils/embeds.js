const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

/**
 * Format milliseconds into MM:SS or HH:MM:SS format
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted duration string
 */
function formatDuration(ms) {
    if (!ms || isNaN(ms) || ms <= 0) return 'Live / Unknown';

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Build Now Playing Embed for DisTube or Lavalink song objects
 * @param {object} song - Song/Track Object
 * @param {object} queue - Queue Instance
 * @returns {EmbedBuilder}
 */
function buildNowPlayingEmbed(song, queue) {
    const title = song?.name || song?.info?.title || 'Unknown Track';
    const author = song?.uploader?.name || song?.artist || song?.info?.author || 'Unknown Artist';
    const duration = song?.formattedDuration || formatDuration(song?.duration * 1000 || song?.info?.duration);
    const uri = song?.url || song?.info?.uri || '';
    
    let requester = 'Unknown';
    if (song?.user) {
        requester = `<@${song.user.id}>`;
    } else if (song?.member) {
        requester = `<@${song.member.id}>`;
    } else if (song?.userData?.requester) {
        requester = `<@${song.userData.requester.id}>`;
    }

    const thumbnail = song?.thumbnail || song?.info?.artworkUrl || null;
    const volume = queue ? `${queue.volume}%` : '100%';
    
    const repeatMode = queue?.repeatMode ?? 0;
    const loopStatus = repeatMode === 1 ? '🔂 Song' : repeatMode === 2 ? '🔁 Queue' : 'Off';

    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🎵 Now Playing')
        .setDescription(uri ? `[**${title}**](${uri})` : `**${title}**`)
        .addFields(
            { name: '👤 Artist/Uploader', value: author, inline: true },
            { name: '⏱️ Duration', value: duration, inline: true },
            { name: '🙋 Requested By', value: requester, inline: true },
            { name: '🔊 Volume', value: volume, inline: true },
            { name: '🔁 Loop Mode', value: loopStatus, inline: true }
        )
        .setTimestamp();

    if (thumbnail) {
        embed.setThumbnail(thumbnail);
    }

    return embed;
}

/**
 * Build Now Playing Control Buttons Row
 * @param {object} queue - Queue Instance
 * @returns {ActionRowBuilder}
 */
function buildNowPlayingButtons(queue) {
    const isPaused = queue?.paused || false;

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('btn_pause_resume')
            .setEmoji(isPaused ? '▶️' : '⏸️')
            .setLabel(isPaused ? 'Resume' : 'Pause')
            .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('btn_skip')
            .setEmoji('⏭️')
            .setLabel('Skip')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('btn_stop')
            .setEmoji('⏹️')
            .setLabel('Stop')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('btn_shuffle')
            .setEmoji('🔀')
            .setLabel('Shuffle')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('btn_loop')
            .setEmoji('🔁')
            .setLabel('Loop')
            .setStyle(ButtonStyle.Secondary)
    );

    return row;
}

/**
 * Check if the user is in the same voice channel as the bot
 * @param {import('discord.js').Interaction} interaction
 * @returns {boolean}
 */
function checkVoiceChannel(interaction) {
    const memberVoiceChannel = interaction.member?.voice?.channel;
    if (!memberVoiceChannel) {
        interaction.reply({
            content: '❌ You must be in a voice channel to use music commands!',
            ephemeral: true
        }).catch(() => {});
        return false;
    }

    const botVoiceChannelId = interaction.guild.members.me?.voice?.channelId;
    if (botVoiceChannelId && memberVoiceChannel.id !== botVoiceChannelId) {
        interaction.reply({
            content: '❌ You must be in the same voice channel as the bot to use controls!',
            ephemeral: true
        }).catch(() => {});
        return false;
    }

    return true;
}

module.exports = {
    formatDuration,
    buildNowPlayingEmbed,
    buildNowPlayingButtons,
    checkVoiceChannel
};
