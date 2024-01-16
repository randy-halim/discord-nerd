import { CommandLike } from "../commandLoader";
import { ChannelType, SlashCommandBuilder } from "discord.js";
import { createErrorEmbed, createInfoEmbed } from "../lib/embedGenerator";
import { getMessages, textifyMessageForTaskModels } from "../lib/messages";
import { summarize } from "../lib/hugging-face";

let now = 0;

export default {
  data: new SlashCommandBuilder()
    .setName("summarize")
    .setDescription("Summarize a Discord conversation"),
  handle: async (interaction) => {
    if (
      !interaction.channel ||
      interaction.channel.type !== ChannelType.GuildText
    ) {
      await interaction.reply({
        embeds: [createErrorEmbed("This command must be run in a server.")],
      });
      return;
    } else if (!interaction.guild) {
      await interaction.reply({
        embeds: [
          createErrorEmbed(
            "This command must be run in a server, or this bot has no permission to view members."
          ),
        ],
      });
      return;
    }

    if (now + 30000 > Date.now()) {
      await interaction.reply({
        embeds: [
          createErrorEmbed(
            "Due to API rate limitations, this command can only be run once every 30 seconds. Please try again in a little bit!"
          ),
        ],
      });
      return;
    }

    await interaction.reply({
      embeds: [createInfoEmbed("Collecting messages...")],
    });

    const messages = await getMessages(interaction.channel, 25);
    const input = messages.map(textifyMessageForTaskModels).join("\n");

    await interaction.editReply({
      embeds: [createInfoEmbed("Summarizing...")],
    });

    now = Date.now();
    const summary = await summarize(input);

    await interaction.editReply({
      embeds: [createInfoEmbed(summary)],
    });
  },
} as CommandLike;

interface ReducedMessage {
  authorName: string;
  messageContent: string;
  timestamp: number;
}
