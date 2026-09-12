const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear all queued tracks without stopping the currently playing song'),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue || !queue.songs || queue.songs.length === 0) {
            return interaction.reply({ content: '❌ No active music queue in this server!', ephemeral: true });
        }

        const count = queue.songs.length - 1; // exclude currently playing
        if (count === 0) {
            return interaction.reply({ content: '❌ No upcoming tracks to clear! Only the current song is playing.', ephemeral: true });
        }

        // Remove all tracks except the currently playing one (index 0)
        queue.songs.splice(1, count);

        return interaction.reply({
            content: `🧹 Cleared **${count} queued track(s)**! Currently playing song will keep playing.`
        });
    }
};
