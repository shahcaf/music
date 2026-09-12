const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a track from the queue by position')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('Position number of track in queue (1, 2, 3...)')
                .setRequired(true)
                .setMinValue(1)
        ),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue || !queue.songs || queue.songs.length <= 1) {
            return interaction.reply({ content: '❌ No upcoming tracks in queue to remove!', ephemeral: true });
        }

        const position = interaction.options.getInteger('position');
        if (position >= queue.songs.length) {
            return interaction.reply({ content: `❌ Invalid queue position! Max position is ${queue.songs.length - 1}.`, ephemeral: true });
        }

        const removedTrack = queue.songs.splice(position, 1)[0];
        return interaction.reply({ content: `🗑️ Removed track **${removedTrack.name}** from the queue!` });
    }
};
