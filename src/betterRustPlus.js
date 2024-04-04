import { Collection, Client, Events, GatewayIntentBits, Partials } from 'discord.js'
import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';
import BM from "@leventhan/battlemetrics"
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'

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
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Log in to Discord with your client's token
client.login(process.env.TOKEN);

// init battlemetrics API related stuff

// const BMOptions = {
// 	token: process.env.BATTLEMETRICS_TOKEN,
// 	game: 'rust',
// 	// serverID: '',
// }

// const battlemetrics = new BM(BMOptions)

// battlemetrics.getServerInfoByNameAndGame("[EU] HollowServers - 2x").then(res => {
// 	console.log(res.map(server => {
// 		return {
// 			// id: server.id,
// 			name: server.name,
// 			ip: server.ip,
// 			players: server.players,
// 		}
// 	}))
// 	// console.log(res[0])
// }).catch(err => {
// 	console.error(err)
// })

//express => get steamID / rust auth token

const PORT = 8080
const app = express()

const allowedOrigins = [
	'https://companion-rust.facepunch.com',
	'http://localhost:3000' //tmp
]
const corsOptions = {
	origin: function (origin, callback) {
	  	if (allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true)
	  	} else {
			callback(new Error('Not allowed by CORS'))
	  	}
	},
	allowedHeaders: ["Content-Type"]
}
app.use(cors(corsOptions))
app.use(express.json())

async function getExpoPushToken(fcmToken) {
	const response = await axios.post('https://exp.host/--/api/v2/push/getExpoPushToken', {
		  deviceId: uuidv4(),
		  experienceId: '@facepunch/RustCompanion',
		  appId: 'com.facepunch.rust.companion',
		  deviceToken: fcmToken,
		  type: 'fcm',
		  development: false
	  });
	  return response.data.data.expoPushToken;
  }
  
async function registerWithRustPlus(rustPlusToken, expoPushToken) {
	return axios.post('https://companion-rust.facepunch.com:443/api/push/register', {
		AuthToken: rustPlusToken,
		DeviceId: 'rustplus.js',
		PushKind: 0,
		PushToken: expoPushToken,
	})
}

app.post('/register', (req, res) => {
	// res.send('Welcome')
	let steamID = req.body.steamID
	let rustToken = req.body.rustToken
	let fcmToken = req.body.fcmToken
	getExpoPushToken(fcmToken)
		.then((expoToken) => {
			return registerWithRustPlus(rustToken, expoToken)
		}).then((rustAPIres) => {
			res.status(rustAPIres.status).send(rustAPIres.statusText)
		})
	res.sendStatus(200)
})

app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`)
})