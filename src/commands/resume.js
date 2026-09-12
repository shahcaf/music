const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused song'),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) {
            return interaction.reply({ content: '❌ No active music queue in this server!', ephemeral: true });
        }

        if (!queue.paused) {
            return interaction.reply({ content: '▶️ Playback is already playing!', ephemeral: true });
        }

        queue.resume();
        return interaction.reply({ content: '▶️ Resumed the current song!' });
    }
};
