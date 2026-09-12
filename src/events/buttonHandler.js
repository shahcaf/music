const { checkVoiceChannel } = require('../utils/embeds');

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

    const queue = interaction.client.distube.getQueue(interaction.guildId);
    if (!queue) {
        return interaction.reply({
            content: '❌ No active music queue in this server!',
            ephemeral: true
        });
    }

    try {
        switch (customId) {
            case 'btn_pause_resume': {
                if (queue.paused) {
                    queue.resume();
                    await interaction.reply({ content: '▶️ Playback resumed!', ephemeral: true });
                } else {
                    queue.pause();
                    await interaction.reply({ content: '⏸️ Playback paused!', ephemeral: true });
                }
                break;
            }

            case 'btn_skip': {
                if (!queue.songs || queue.songs.length === 0) {
                    return interaction.reply({ content: '❌ Nothing is currently playing to skip!', ephemeral: true });
                }
                const currentTitle = queue.songs[0].name;
                if (queue.songs.length === 1 && queue.repeatMode === 0) {
                    queue.stop();
                    await interaction.reply({ content: `⏭️ Skipped **${currentTitle}**! Stopped queue.`, ephemeral: true });
                } else {
                    await queue.skip();
                    await interaction.reply({ content: `⏭️ Skipped **${currentTitle}**!`, ephemeral: true });
                }
                break;
            }

            case 'btn_stop': {
                await queue.stop();
                await interaction.reply({ content: '⏹️ Playback stopped, queue cleared, and disconnected!', ephemeral: true });
                break;
            }

            case 'btn_shuffle': {
                if (!queue.songs || queue.songs.length <= 1) {
                    return interaction.reply({ content: '❌ Not enough tracks in queue to shuffle!', ephemeral: true });
                }
                await queue.shuffle();
                await interaction.reply({ content: '🔀 Queue shuffled successfully!', ephemeral: true });
                break;
            }

            case 'btn_loop': {
                const currentMode = queue.repeatMode; // 0: off, 1: song, 2: queue
                let newMode = 1;
                let modeText = '🔂 Song';

                if (currentMode === 1) {
                    newMode = 2;
                    modeText = '🔁 Queue';
                } else if (currentMode === 2) {
                    newMode = 0;
                    modeText = 'Off';
                }

                queue.setRepeatMode(newMode);
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
