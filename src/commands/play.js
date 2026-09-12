const { SlashCommandBuilder } = require('discord.js');
const { checkVoiceChannel } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song or playlist in your voice channel')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name or URL (YouTube, Spotify, SoundCloud, etc.)')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!checkVoiceChannel(interaction)) return;

        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;

        // Permission check
        const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return interaction.reply({
                content: '❌ I do not have permission to join and speak in your voice channel!',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            await interaction.client.distube.play(voiceChannel, query, {
                textChannel: interaction.channel,
                member: interaction.member,
                metadata: { interaction }
            });

            await interaction.editReply({
                content: `🔍 Searching & playing: \`${query}\``
            });
        } catch (err) {
            console.error('[PLAY ERROR]', err);
            await interaction.editReply({
                content: `❌ Could not play track: ${err?.message || 'Unknown error'}`
            }).catch(() => {});
        }
    }
};
