import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";

// import env
import "./env";
import { DISCORD_CLIENTID, DISCORD_TOKEN, KEYWORDS, GIFS } from "./env";

// bootstrap discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});
export default client; // for code to use later

// on ready callback
client.once(Events.ClientReady, (client) => {
  console.log(`[Info] Using user ${client.user.tag}`);
  console.log(
    `[Info] Use this link to add the bot: https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENTID}&permissions=67584&scope=bot%20applications.commands`
  );
});

// the real stuff: listen for messages
client.on(Events.MessageCreate, (message) => {
  // ignore bot messages
  if (message.author.bot) return;

  // check for keywords
  if (KEYWORDS.some((keyword) => message.content.toLowerCase().includes(keyword))) {
    // random gif
    const gif = GIFS[Math.floor(Math.random() * GIFS.length)];
    message.reply(gif);
  }
})

// start that bad boy
client.login(DISCORD_TOKEN);
