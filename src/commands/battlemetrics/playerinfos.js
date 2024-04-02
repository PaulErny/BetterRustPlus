import { SlashCommandBuilder } from "discord.js";
// import BM from "@leventhan/battlemetrics"

export const data = new SlashCommandBuilder()
    .setName("track")
    .setDMPermission(true)
    .setDescription("Replies with pong")
    .addStringOption(option => 
        option.setName('player')
              .setDescription("The name, or a part of the name of the player you want to track")
              .setRequired(true)
    )

export async function execute(interaction) {
    await interaction.reply("pong")
}