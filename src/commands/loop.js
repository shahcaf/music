const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set repeat mode: off, song, or queue')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Repeat mode selection')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'off' },
                    { name: 'Song', value: 'song' },
                    { name: 'Queue', value: 'queue' }
                )
        ),
    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) {
            return interaction.reply({ content: '❌ No active music queue in this server!', ephemeral: true });
        }

        const modeStr = interaction.options.getString('mode');
        let modeNum = 0;
        let modeDisplay = 'Off';

        if (modeStr === 'song') {
            modeNum = 1;
            modeDisplay = '🔂 Song';
        } else if (modeStr === 'queue') {
            modeNum = 2;
            modeDisplay = '🔁 Queue';
        }

        queue.setRepeatMode(modeNum);
        return interaction.reply({ content: `🔁 Loop mode updated to: **${modeDisplay}**!` });
    }
};
