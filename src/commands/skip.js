const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the currently playing song'),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const player = interaction.client.lavalink.getPlayer(interaction.guildId);
        if (!player || !player.connected) {
            return interaction.reply({ content: '❌ No active player in this server!', ephemeral: true });
        }

        if (!player.queue.current) {
            return interaction.reply({ content: '❌ Nothing is currently playing to skip!', ephemeral: true });
        }

        const currentTrackTitle = player.queue.current.info.title;
        await player.skip();
        return interaction.reply({ content: `⏭️ Skipped **${currentTrackTitle}**!` });
    }
};
