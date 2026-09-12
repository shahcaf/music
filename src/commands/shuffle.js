const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the current music queue'),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue || !queue.songs || queue.songs.length <= 1) {
            return interaction.reply({ content: '❌ Not enough tracks in queue to shuffle!', ephemeral: true });
        }

        await queue.shuffle();
        return interaction.reply({ content: '🔀 Queue shuffled successfully!' });
    }
};
