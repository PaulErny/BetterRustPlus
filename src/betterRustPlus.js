import { Collection, Client, Events, GatewayIntentBits, Partials } from 'discord.js'
import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';
import BM from "@leventhan/battlemetrics"

config()

// Create a new client instance
const client = new Client({ intents: 
	[
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
	], partials:
	[
		Partials.Channel, // Required for direct messages
		Partials.Message,
		Partials.Reaction,
	]
})

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

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = await import(filePath);
	console.log(filePath)
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


// init battlemetrics API related stuff

const BMOptions = {
	token: process.env.BATTLEMETRICS_TOKEN,
	game: 'rust',
	// serverID: '',
}

const battlemetrics = new BM(BMOptions)

battlemetrics.getServerInfoByNameAndGame("[EU] HollowServers - 2x").then(res => {
	console.log(res.map(server => {
		return {
			// id: server.id,
			name: server.name,
			ip: server.ip,
			players: server.players,
		}
	}))
	// console.log(res[0])
}).catch(err => {
	console.error(err)
})

// Log in to Discord with your client's token
client.login(process.env.TOKEN);