import * as path from "path";
import * as fs from "fs";
import {
  ChatInputCommandInteraction,
  Collection,
  SlashCommandBuilder,
} from "discord.js";

const cmdPath = path.join(__dirname, "commands");
const cmdFiles = fs.readdirSync(cmdPath).filter((file) => file.endsWith(".js"));

const commands = new Collection<string, CommandLike>();

for (const file of cmdFiles) {
  const filePath = path.join(cmdPath, file);
  const command: CommandLike = require(filePath).default;

  if ("data" in command && "handle" in command && "enabled" in command) {
    commands.set(command.data.name, command);
  } else {
    console.warn(
      `[Warn] Command at ${filePath} missing required properties. Skipping.`
    );
  }
}

export default function commandLoader() {
  return commands;
}

export interface CommandLike {
  data: SlashCommandBuilder;
  handle: (interaction: ChatInputCommandInteraction) => void | Promise<void>;
  enabled: boolean;
}
