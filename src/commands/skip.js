const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the currently playing song'),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue || !queue.songs || queue.songs.length === 0) {
            return interaction.reply({ content: '❌ Nothing is currently playing to skip!', ephemeral: true });
        }

        const currentTrackTitle = queue.songs[0].name;

        if (queue.songs.length === 1 && queue.repeatMode === 0) {
            queue.stop();
            return interaction.reply({ content: `⏭️ Skipped **${currentTrackTitle}**! Stopped queue.` });
        }

        await queue.skip();
        return interaction.reply({ content: `⏭️ Skipped **${currentTrackTitle}**!` });
    }
};
