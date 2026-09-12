const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Change playback volume (0-100)')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume percentage (0 to 100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)
        ),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) {
            return interaction.reply({ content: '❌ No active music queue in this server!', ephemeral: true });
        }

        const newVolume = interaction.options.getInteger('level');
        queue.setVolume(newVolume);

        return interaction.reply({ content: `🔊 Playback volume changed to **${newVolume}%**!` });
    }
};
