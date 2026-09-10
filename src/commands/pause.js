const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current playing song'),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const player = interaction.client.lavalink.getPlayer(interaction.guildId);
        if (!player || !player.connected) {
            return interaction.reply({ content: '❌ No active player in this server!', ephemeral: true });
        }

        if (player.paused) {
            return interaction.reply({ content: '⏸️ Playback is already paused!', ephemeral: true });
        }

        if (!player.queue.current) {
            return interaction.reply({ content: '❌ No track is currently playing!', ephemeral: true });
        }

        await player.pause();
        return interaction.reply({ content: '⏸️ Paused the current song!' });
    }
};
