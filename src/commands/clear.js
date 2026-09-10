const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear all queued tracks without stopping the currently playing song'),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const player = interaction.client.lavalink.getPlayer(interaction.guildId);
        if (!player || !player.connected) {
            return interaction.reply({ content: '❌ No active player in this server!', ephemeral: true });
        }

        const count = player.queue.tracks.length;
        if (count === 0) {
            return interaction.reply({ content: '❌ The queue is already empty!', ephemeral: true });
        }

        // Clear upcoming tracks array
        player.queue.tracks.splice(0, player.queue.tracks.length);

        return interaction.reply({
            content: `🧹 Cleared **${count} queued track(s)**! Currently playing song will keep playing.`
        });
    }
};
