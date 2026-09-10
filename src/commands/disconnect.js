const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnect the bot from the voice channel and clear queue'),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const player = interaction.client.lavalink.getPlayer(interaction.guildId);
        if (!player) {
            return interaction.reply({ content: '❌ The bot is not currently in a voice channel!', ephemeral: true });
        }

        await player.destroy();
        return interaction.reply({ content: '👋 Disconnected from the voice channel!' });
    }
};
