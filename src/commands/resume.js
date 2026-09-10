const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume playback if paused'),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const player = interaction.client.lavalink.getPlayer(interaction.guildId);
        if (!player || !player.connected) {
            return interaction.reply({ content: '❌ No active player in this server!', ephemeral: true });
        }

        if (!player.paused) {
            return interaction.reply({ content: '▶️ Playback is already running!', ephemeral: true });
        }

        await player.resume();
        return interaction.reply({ content: '▶️ Resumed playback!' });
    }
};
