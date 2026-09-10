const { SlashCommandBuilder } = require('discord.js');
const { buildNowPlayingEmbed, buildNowPlayingButtons } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show details about the currently playing track'),
    async execute(interaction) {
        const player = interaction.client.lavalink.getPlayer(interaction.guildId);
        if (!player || !player.connected || !player.queue.current) {
            return interaction.reply({ content: '❌ Nothing is currently playing in this server!', ephemeral: true });
        }

        const currentTrack = player.queue.current;
        const embed = buildNowPlayingEmbed(currentTrack, player);
        const buttons = buildNowPlayingButtons(player);

        return interaction.reply({ embeds: [embed], components: [buttons] });
    }
};
