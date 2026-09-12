const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Display the current music queue'),
    async execute(interaction) {
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue || !queue.songs || queue.songs.length === 0) {
            return interaction.reply({ content: '📜 The music queue is completely empty!', ephemeral: true });
        }

        const currentTrack = queue.songs[0];
        const upcomingTracks = queue.songs.slice(1);

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`📜 Music Queue for ${interaction.guild.name}`)
            .setFooter({ text: `Total Queued Songs: ${queue.songs.length}` });

        if (currentTrack) {
            const req = currentTrack.user ? `<@${currentTrack.user.id}>` : 'Unknown';
            embed.addFields({
                name: '▶️ Currently Playing',
                value: `[**${currentTrack.name}**](${currentTrack.url}) | \`${currentTrack.formattedDuration}\` | Requested by ${req}`
            });
        }

        if (upcomingTracks.length > 0) {
            const queueList = upcomingTracks.slice(0, 10).map((t, index) => {
                const req = t.user ? `<@${t.user.id}>` : 'Unknown';
                return `**${index + 1}.** [${t.name}](${t.url}) | \`${t.formattedDuration}\` | Requested by ${req}`;
            }).join('\n');

            let queueDescription = queueList;
            if (upcomingTracks.length > 10) {
                queueDescription += `\n\n*...and ${upcomingTracks.length - 10} more track(s)*`;
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
