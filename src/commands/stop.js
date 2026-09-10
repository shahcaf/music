const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop playback, clear the queue, and disconnect'),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const player = interaction.client.lavalink.getPlayer(interaction.guildId);
        if (!player || !player.connected) {
            return interaction.reply({ content: '❌ No active player in this server!', ephemeral: true });
        }

        await player.destroy();
        return interaction.reply({ content: '⏹️ Stopped playback, cleared queue, and disconnected!' });
    }
};
