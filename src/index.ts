import {Client, Events, GatewayIntentBits, REST, Routes} from "discord.js";
import commandLoader from "./commandLoader";
import {createErrorEmbed} from "./lib/embedGenerator";

// import env
import "dotenv/config";

// bootstrap some tokens from env
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENTID = process.env.DISCORD_CLIENTID;
export const HF_TOKEN = process.env.HF_TOKEN;
export const SUMMANATION_MODEL = "https://api-inference.huggingface.co/models/kabita-choudhary/finetuned-bart-for-conversation-summary";

if (!HF_TOKEN) {
    console.error("[Error] Missing HF_TOKEN env variable. Create a access token at https://huggingface.co/settings/tokens");
    process.exit(1);
}
if (!DISCORD_TOKEN) {
    console.error("[Error] Missing DISCORD_TOKEN env variable. Create a Discord bot at https://discord.com/developers/applications and copy the bot token.");
    process.exit(1);
}
if (!DISCORD_CLIENTID) {
    console.error("[Error] Missing DISCORD_CLIENTID env variable. Create a Discord bot at https://discord.com/developers/applications and copy the application id.");
    process.exit(1);
}

// bootstrap discord client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
});
export default client; // for code to use later

client.once(Events.ClientReady, client => {
    console.log(`[Info] Using user ${client.user.tag}`);
    console.log(`[Info] Use this link to add the bot: https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENTID}&permissions=67584&scope=bot%20applications.commands`)
});

// load slash commands
const commands = commandLoader();

// intercept cli arguments and take action
const rest = new REST().setToken(DISCORD_TOKEN);
if (process.argv[2] === "--register") { // --register option
    console.log("[Info] --register found, registering commands...");

    const commandsArr = commands.map(command => command.data.toJSON());

    (async () => {
        try {
            await rest.put(
                Routes.applicationCommands(DISCORD_CLIENTID),
                {
                    body: commandsArr
                }
                );
            console.log(`[Info] Registered ${commands.size} commands`)
        } catch (e: any) {
            console.error(e);
            console.warn("[Warn] Command registration did not complete successfully.");
        }
    })()
} else if (process.argv[2] === "--remove") { // --remove option
    console.log("[Info] --remove found, deregistering commands...");

    (async () => {
        try {
            await rest.put(
                Routes.applicationCommands(DISCORD_CLIENTID),
                {
                    body: []
                }
                )
            console.log("[Info] Deleted existing commands");
        } catch (e: any) {
            console.error(e);
            console.warn("[Warn] Command deletion did not complete successfully.");
        }

        process.exit(0);
    })()
} else if (process.argv[2] === "--help") { // --help option
    console.log("Usage:");
    console.log("index.js [--register | --remove | --help]");
    console.log(`
Options:
  --help      Print help information
  --register  Starts bot with registering commands to the application (reccomended for new bots)
  --remove    Deregisters commands to the application (reccomended for updating bot)
    `);
    process.exit(0);
} else if (process.argv[2]) { // there was a arg passed, but not valid
    console.error("Unknown option " + process.argv[2]);
    console.log();
    console.log("Usage:");
    console.log("index.js [--register | --remove | --help]");
    process.exit(1);
}

// listen for slash commands
client.on(Events.InteractionCreate, async interaction => {
    // ignore non-slash interactions
    if (!interaction.isChatInputCommand()) {
        return;
    }
    
    const command = commands.get(interaction.commandName);
    
    // warn on non-existant commands
    if (!command) {
        console.warn(`Command ${interaction.commandName} was invoked, but there is no handler found.`);
        await interaction.reply({
            embeds: [createErrorEmbed(`
                This command was removed. If you were not expecting this, please [message the bot author](https://github.com/randy-halim)
            `)]
        })
        return;
    }
    
    try {
        console.log(`[Info, ${new Date().toISOString()}] Executing '/${command.data.name}'`);
        await command.handle(interaction);
    } catch (e: any) {
        console.error("[Error] ", e);
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                embeds: [createErrorEmbed()],
                ephemeral: true
            });
        } else {
            await interaction.reply({
                embeds: [createErrorEmbed()],
                ephemeral: true
            })
        }
    }
})

// start that bad boy
client.login(DISCORD_TOKEN);