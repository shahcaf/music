const { SlashCommandBuilder } = require('discord.js');
const { buildNowPlayingEmbed, buildNowPlayingButtons } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show details about the currently playing track'),
    async execute(interaction) {
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue || !queue.songs || queue.songs.length === 0) {
            return interaction.reply({ content: '❌ Nothing is currently playing in this server!', ephemeral: true });
        }

        const currentTrack = queue.songs[0];
        const embed = buildNowPlayingEmbed(currentTrack, queue);
        const buttons = buildNowPlayingButtons(queue);

        return interaction.reply({ embeds: [embed], components: [buttons] });
    }
};
