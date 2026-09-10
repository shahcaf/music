const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Configure queue or song looping mode')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Loop mode to set')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'off' },
                    { name: 'Song (Track)', value: 'song' },
                    { name: 'Queue', value: 'queue' }
                )
        ),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const player = interaction.client.lavalink.getPlayer(interaction.guildId);
        if (!player || !player.connected) {
            return interaction.reply({ content: '❌ No active player in this server!', ephemeral: true });
        }

        const modeOption = interaction.options.getString('mode');
        let lavalinkMode = 'off';
        let modeLabel = 'Off';

        if (modeOption === 'song') {
            lavalinkMode = 'track';
            modeLabel = '🔂 Song (Single Track)';
        } else if (modeOption === 'queue') {
            lavalinkMode = 'queue';
            modeLabel = '🔁 Whole Queue';
        }

        await player.setRepeatMode(lavalinkMode);

        return interaction.reply({ content: `🔁 Loop mode configured to: **${modeLabel}**!` });
    }
};
