const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./src/config');

if (!config.discord.token || !config.discord.clientId) {
    console.error('[DEPLOY ERROR] Please configure DISCORD_TOKEN and CLIENT_ID in your .env file before deploying commands!');
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`[DEPLOY] Registered command definition: /${command.data.name}`);
    } else {
        console.warn(`[DEPLOY WARNING] Command at ${filePath} is missing required "data" or "execute" property.`);
    }
}

const rest = new REST({ version: '10' }).setToken(config.discord.token);

(async () => {
    try {
        const guildId = process.env.GUILD_ID;
        if (guildId) {
            console.log(`[DEPLOY] Registering ${commands.length} commands instantly for Guild ID: ${guildId}...`);
            const data = await rest.put(
                Routes.applicationGuildCommands(config.discord.clientId, guildId),
                { body: commands }
            );
            console.log(`[DEPLOY SUCCESS] Successfully registered ${data.length} guild commands!`);
        } else {
            console.log(`[DEPLOY] Refreshing ${commands.length} application (/) commands globally...`);
            const data = await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: commands }
            );
            console.log(`[DEPLOY SUCCESS] Successfully reloaded ${data.length} global application (/) commands!`);
            console.log('[DEPLOY NOTE] Global commands can take up to 1 hour to propagate across Discord servers. To register instantly for a specific server, add GUILD_ID=your_server_id to .env');
        }
    } catch (error) {
        console.error('[DEPLOY ERROR] Failed to deploy application commands:', error);
    }
})();
