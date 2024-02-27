import "dotenv/config";

// required Discord bot config
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || "";
export const DISCORD_CLIENTID = process.env.DISCORD_CLIENTID || "";
if (!process.env.DISCORD_TOKEN) {
  console.error(
    "[Error] Missing DISCORD_TOKEN env variable. Create a Discord bot at https://discord.com/developers/applications and copy the bot token."
  );
  process.exit(1);
}
if (!process.env.DISCORD_CLIENTID) {
  console.error(
    "[Error] Missing DISCORD_CLIENTID env variable. Create a Discord bot at https://discord.com/developers/applications and copy the application id."
  );
  process.exit(1);
}

// keyword list
export const KEYWORDS = process.env.NERD_KEYWORDS?.split(",") || ["cs", "program", "homework"];
export const GIFS = process.env.NERD_GIFS?.split(",") || ["https://tenor.com/view/nerd-nerd-glasses-uhm-aktually-glasses-gif-4161113894351475297", "https://tenor.com/view/nerd-nerdy-nerds-nerd-emoji-gif-25380417"]