import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import commandLoader from "./commandLoader";
import { createErrorEmbed } from "./lib/embedGenerator";
import { PrismaClient, User } from "@prisma/client";

// import env
import "./env";
import { DISCORD_CLIENTID, DISCORD_TOKEN } from "./env";

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

// load Prisma
export const PRISMA = new PrismaClient();

// load slash commands
const commands = commandLoader();

// intercept cli arguments and take action
const rest = new REST().setToken(DISCORD_TOKEN);
if (process.argv[2] === "--register") {
  // --register option
  console.log("[Info] --register found, registering commands...");

  const commandsArr = commands.map((command) => command.data.toJSON());

  (async () => {
    try {
      await rest.put(Routes.applicationCommands(DISCORD_CLIENTID), {
        body: commandsArr,
      });
      console.log(`[Info] Registered ${commands.size} commands`);
    } catch (e: any) {
      console.error(e);
      console.warn(
        "[Warn] Command registration did not complete successfully."
      );
    }
  })();
} else if (process.argv[2] === "--remove") {
  // --remove option
  console.log("[Info] --remove found, deregistering commands...");

  (async () => {
    try {
      await rest.put(Routes.applicationCommands(DISCORD_CLIENTID), {
        body: [],
      });
      console.log("[Info] Deleted existing commands");
    } catch (e: any) {
      console.error(e);
      console.warn("[Warn] Command deletion did not complete successfully.");
    }

    process.exit(0);
  })();
} else if (process.argv[2] === "--help") {
  // --help option
  console.log("Usage:");
  console.log("index.js [--register | --remove | --help]");
  console.log(`
Options:
  --help      Print help information
  --register  Starts bot with registering commands to the application (reccomended for new bots)
  --remove    Deregisters commands to the application (reccomended for updating bot)
    `);
  process.exit(0);
} else if (process.argv[2]) {
  // there was a arg passed, but not valid
  console.error("Unknown option " + process.argv[2]);
  console.log();
  console.log("Usage:");
  console.log("index.js [--register | --remove | --help]");
  process.exit(1);
}

// listen for slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  // ignore non-slash interactions
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commands.get(interaction.commandName);

  // error on non-existant commands
  if (!command) {
    console.warn(
      `Command ${interaction.commandName} was invoked, but there is no handler found.`
    );
    await interaction.reply({
      embeds: [
        createErrorEmbed(`
                This command was removed. If you were not expecting this, please [message the bot author](https://github.com/randy-halim)
            `),
      ],
    });
    return;
  }

  // error on disabled commands
  if (!command.enabled) {
    console.warn(
      `Command ${interaction.commandName} was invoked, but it is disabled.`
    );
    await interaction.reply({
      embeds: [createErrorEmbed(`This command is disabled.`)],
    });
  }

  // record the user to Prisma if they are not already in
  let user: User;
  const foundUser = await PRISMA.user.findUnique({
    where: { id: interaction.user.id },
  });
  if (foundUser === null) {
    console.info(
      "[Info] User doesn't exist in database. Recording via Prisma..."
    );
    user = await PRISMA.user.create({
      data: {
        id: interaction.user.id,
        lastInteraction: new Date(0),
      },
    });
  } else {
    user = foundUser;
  }

  // execute command
  try {
    console.log(
      `[Info, ${new Date().toISOString()}] Executing '/${command.data.name}'`
    );
    await command.handle(interaction);
  } catch (e: any) {
    console.error("[Error] ", e);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        embeds: [createErrorEmbed()],
      });
    } else {
      await interaction.reply({
        embeds: [createErrorEmbed()],
      });
    }
  }
});

// start that bad boy
client.login(DISCORD_TOKEN);
