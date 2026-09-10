const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a track from the queue by position')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('The 1-based position in the queue to remove')
                .setRequired(true)
                .setMinValue(1)
        ),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const player = interaction.client.lavalink.getPlayer(interaction.guildId);
        if (!player || !player.connected) {
            return interaction.reply({ content: '❌ No active player in this server!', ephemeral: true });
        }

        const position = interaction.options.getInteger('position');
        const queueLength = player.queue.tracks.length;

        if (queueLength === 0) {
            return interaction.reply({ content: '❌ The queue is empty!', ephemeral: true });
        }

        if (position > queueLength) {
            return interaction.reply({
                content: `❌ Invalid position! Current queue length is **${queueLength}**.`,
                ephemeral: true
            });
        }

        // 1-based index converted to 0-based array index
        const arrayIndex = position - 1;
        const removedTrack = player.queue.tracks[arrayIndex];

        // Remove track from queue array
        player.queue.tracks.splice(arrayIndex, 1);

        return interaction.reply({
            content: `🗑️ Removed track **${position}**: **${removedTrack.info.title}** from the queue.`
        });
    }
};
