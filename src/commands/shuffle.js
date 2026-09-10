const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the current music queue'),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const player = interaction.client.lavalink.getPlayer(interaction.guildId);
        if (!player || !player.connected) {
            return interaction.reply({ content: '❌ No active player in this server!', ephemeral: true });
        }

        if (player.queue.tracks.length === 0) {
            return interaction.reply({ content: '❌ The queue is empty, nothing to shuffle!', ephemeral: true });
        }

        await player.queue.shuffle();

        return interaction.reply({ content: `🔀 Successfully shuffled **${player.queue.tracks.length} track(s)** in the queue!` });
    }
};
