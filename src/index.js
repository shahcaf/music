const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { createDisTube } = require('./music/distube');
const { setupDisTubeEvents } = require('./events/distubeEvents');
const { handleButtonInteraction } = require('./events/buttonHandler');

// 1. Initialize Discord Client with Voice & Guild intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// 2. Attach slash command collection
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`[WARNING] Command at ${filePath} is missing required "data" or "execute" property.`);
    }
}

// 3. Initialize DisTube for standalone audio streaming (0 external servers required)
client.distube = createDisTube(client);
setupDisTubeEvents(client);

// 4. Discord Ready Event
client.once('clientReady', async () => {
    console.log(`[DISCORD] Logged in as ${client.user.tag} (ID: ${client.user.id})`);
    console.log('[DISTUBE] Standalone DisTube Audio Engine initialized successfully.');
});

// 5. Interaction Create Event (Slash Commands & Button Controls)
client.on('interactionCreate', async (interaction) => {
    // Handle Button Interactions
    if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
        return;
    }

    // Drop stale interactions (Discord delivers old interactions on reconnect; their tokens are expired)
    const interactionAgeMs = Date.now() - interaction.createdTimestamp;
    if (interactionAgeMs > 10000) {
        console.warn(`[WARN] Dropping stale interaction /${interaction.commandName ?? interaction.customId} (age: ${interactionAgeMs}ms)`);
        return;
    }

    // Handle Slash Command Interactions
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`[COMMAND ERROR] No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`[COMMAND ERROR] Error executing command /${interaction.commandName}:`, error);
        const replyPayload = {
            content: '❌ There was an error executing this command!',
            flags: (1 << 6) // ephemeral via flags
        };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(replyPayload).catch(() => {});
        } else {
            await interaction.reply(replyPayload).catch(() => {});
        }
    }
});

// 6. Global Unhandled Rejection / Error Handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('[UNHANDLED REJECTION] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[UNCAUGHT EXCEPTION] Uncaught Exception:', error);
});

// 7. Log into Discord
if (!config.discord.token) {
    console.error('[CRITICAL] DISCORD_TOKEN is missing in .env! Cannot start bot.');
    process.exit(1);
}

client.login(config.discord.token);
