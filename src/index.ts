// import env
import "dotenv/config";

// bootstrap some tokens from env
import {Client, Events, GatewayIntentBits, REST, Routes} from "discord.js";
import commandLoader from "./commandLoader";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
export const HF_TOKEN = process.env.HF_TOKEN;
export const SUMMANATION_MODEL = "https://api-inference.huggingface.co/models/kabita-choudhary/finetuned-bart-for-conversation-summary";

if (!HF_TOKEN || !DISCORD_TOKEN) {
    console.error("Missing env variables. Please check your env.");
    process.exit(1);
}

// bootstrap discord client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
});
export default client;

client.once(Events.ClientReady, client => {
    console.log(`Using user ${client.user.tag}`);
    console.log("Use this link to add the bot: https://discord.com/api/oauth2/authorize?client_id=1110664205905961040&permissions=67584&scope=bot%20applications.commands")
});

// load slash commands
const commands = commandLoader();

// intercept cli argument --register
// also login code falls in here
const rest = new REST().setToken(DISCORD_TOKEN);
if (process.argv[2] === "--register") {
    console.log("--register found, registering commands...");

    const commandsArr = commands.map(command => command.data.toJSON());

    (async () => {
        try {
            await rest.put(
                Routes.applicationCommands("1110664205905961040"),
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
} else if (process.argv[2] === "--remove") {
    (async () => {
        try {
            await rest.put(
                Routes.applicationCommands("1110664205905961040"),
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
} else if (process.argv[2]) {
    console.error("Unknown option " + process.argv[2]);
    console.log();
    console.log("Usage:");
    console.log("index.js [--register]");
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
        return;
    }
    
    try {
        console.log(`[Info, ${new Date().toISOString()}] Executing '/${command.data.name}'`);
        await command.handle(interaction);
    } catch (e: any) {
        console.error(e);
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "There was an error while executing this command.",
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: "There was an error while executing this command.",
                ephemeral: true
            })
        }
    }
})

// start that bad boy
client.login(DISCORD_TOKEN);