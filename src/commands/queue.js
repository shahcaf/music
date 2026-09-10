const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { formatDuration } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Display the current music queue'),
    async execute(interaction) {
        const player = interaction.client.lavalink.getPlayer(interaction.guildId);
        if (!player || !player.connected) {
            return interaction.reply({ content: '❌ No active player in this server!', ephemeral: true });
        }

        const currentTrack = player.queue.current;
        const tracks = player.queue.tracks;

        if (!currentTrack && tracks.length === 0) {
            return interaction.reply({ content: '📜 The music queue is completely empty!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`📜 Music Queue for ${interaction.guild.name}`)
            .setFooter({ text: `Total Queued Tracks: ${tracks.length}` });

        if (currentTrack) {
            const requester = currentTrack.userData?.requester ? `<@${currentTrack.userData.requester.id}>` : 'Unknown';
            embed.addFields({
                name: '▶️ Currently Playing',
                value: `[**${currentTrack.info.title}**](${currentTrack.info.uri}) | \`${formatDuration(currentTrack.info.duration)}\` | Requested by ${requester}`
            });
        }

        if (tracks.length > 0) {
            // Display first 10 tracks
            const queueList = tracks.slice(0, 10).map((t, index) => {
                const req = t.userData?.requester ? `<@${t.userData.requester.id}>` : 'Unknown';
                return `**${index + 1}.** [${t.info.title}](${t.info.uri}) | \`${formatDuration(t.info.duration)}\` | Requested by ${req}`;
            }).join('\n');

            let queueDescription = queueList;
            if (tracks.length > 10) {
                queueDescription += `\n\n*...and ${tracks.length - 10} more track(s)*`;
            }

            embed.addFields({
                name: '📋 Upcoming Queue',
                value: queueDescription
            });
        } else {
            embed.addFields({
                name: '📋 Upcoming Queue',
                value: '*No upcoming tracks in the queue*'
            });
        }

        return interaction.reply({ embeds: [embed] });
    }
};
