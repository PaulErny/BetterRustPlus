import { Events } from "discord.js";

export const name = Events.MessageCreate

export const once = false

export function execute(message) {
    if (message.author.bot) return

	console.log(message.content);

	if (message.content === 'Mieux que rust+ ?') {
		message.channel.send("oui")
	}

	if (message.content === 'reply') {
		message.reply("oui")
	}

	if (message.content === '🔥') {
		message.react('🔥')
	}

	if (message.content === 'ntm') {
		message.channel.send("non toi")
	}
}