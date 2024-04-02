import { Events } from "discord.js";

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.

export const name = Events.ClientReady

export const once = true

export function execute(readyClient) {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`)
}