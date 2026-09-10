const { buildNowPlayingEmbed, buildNowPlayingButtons, checkVoiceChannel } = require('../utils/embeds');

/**
 * Handle Discord Button Interactions for playback control
 * @param {import('discord.js').ButtonInteraction} interaction 
 */
async function handleButtonInteraction(interaction) {
    if (!interaction.isButton()) return;
    const customId = interaction.customId;

    if (!['btn_pause_resume', 'btn_skip', 'btn_stop', 'btn_shuffle', 'btn_loop'].includes(customId)) {
        return;
    }

    // Verify voice channel
    if (!checkVoiceChannel(interaction)) return;

    const player = interaction.client.lavalink.getPlayer(interaction.guildId);
    if (!player) {
        return interaction.reply({
            content: '❌ No active player in this server!',
            ephemeral: true
        });
    }

    try {
        switch (customId) {
            case 'btn_pause_resume': {
                if (player.paused) {
                    await player.resume();
                    await interaction.reply({ content: '▶️ Playback resumed!', ephemeral: true });
                } else {
                    await player.pause();
                    await interaction.reply({ content: '⏸️ Playback paused!', ephemeral: true });
                }
                break;
            }

            case 'btn_skip': {
                if (!player.queue.current) {
                    return interaction.reply({ content: '❌ Nothing is currently playing to skip!', ephemeral: true });
                }
                const currentTitle = player.queue.current.info.title;
                await player.skip();
                await interaction.reply({ content: `⏭️ Skipped **${currentTitle}**!`, ephemeral: true });
                break;
            }

            case 'btn_stop': {
                await player.destroy();
                await interaction.reply({ content: '⏹️ Playback stopped, queue cleared, and disconnected!', ephemeral: true });
                break;
            }

            case 'btn_shuffle': {
                if (player.queue.tracks.length === 0) {
                    return interaction.reply({ content: '❌ The queue is empty, cannot shuffle!', ephemeral: true });
                }
                await player.queue.shuffle();
                await interaction.reply({ content: '🔀 Queue shuffled successfully!', ephemeral: true });
                break;
            }

            case 'btn_loop': {
                const currentMode = player.repeatMode; // 'off' | 'track' | 'queue'
                let newMode = 'track';
                let modeText = '🔂 Song';

                if (currentMode === 'track') {
                    newMode = 'queue';
                    modeText = '🔁 Queue';
                } else if (currentMode === 'queue') {
                    newMode = 'off';
                    modeText = 'Off';
                }

                await player.setRepeatMode(newMode);
                await interaction.reply({ content: `🔁 Loop mode updated to: **${modeText}**!`, ephemeral: true });
                break;
            }
        }
    } catch (err) {
        console.error('[BUTTON ERROR] Exception while handling button interaction:', err);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: `❌ An error occurred: ${err.message}`, ephemeral: true }).catch(() => {});
        }
    }
}

module.exports = { handleButtonInteraction };
