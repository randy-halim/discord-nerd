import { CommandLike } from "../commandLoader";
import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with 'pong'"),
  handle: async (interaction) => {
    await interaction.reply("Pong!");
  },
  enabled: true,
} as CommandLike;
