import { Collection, Client, Events, GatewayIntentBits } from 'discord.js'
import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';
import * as test from './commands/utility/test.js'

config()

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.commands = new Collection()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const foldersPath = path.join(__dirname, 'commands')
const commandFolder = fs.readdirSync(foldersPath)

for(const folder of commandFolder) {
	const commandsPath = path.join(foldersPath, folder)
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = await import(filePath)
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// A function executed when the Discord client receives an interaction
async function handleInteraction(interaction) {
	// Ensure interaction is a command before proceeding
	if (!interaction.isCommand()) return;
  
	// Command execution mapping
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Event listener for when a slash command is executed
client.on(Events.InteractionCreate, handleInteraction);

// Log in to Discord with your client's token
client.login(process.env.TOKEN);