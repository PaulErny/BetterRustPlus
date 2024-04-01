import { Client, Events, GatewayIntentBits } from 'discord.js'
import { config } from 'dotenv'
import * as test from './commands/test.js'

config()

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

// A function executed when the Discord client receives an interaction
async function handleInteraction(interaction) {
	// Ensure interaction is a command before proceeding
	if (!interaction.isCommand()) return;
  
	// Command execution mapping
	if (interaction.commandName === 'ping') {
	  await test.execute(interaction);
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