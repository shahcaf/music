const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnect the bot from the voice channel and clear queue'),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) {
            return interaction.reply({ content: '❌ The bot is not currently in a voice channel!', ephemeral: true });
        }

        await queue.stop();
        return interaction.reply({ content: '👋 Disconnected from the voice channel and cleared the queue!' });
    }
};
