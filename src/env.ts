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

// expose config from env
export const ENV_CONFIG = {
  enable: {
    hfEndpoints: process.env.ENABLE_HF_ENDPOINTS === "true",
    openai: process.env.ENABLE_OPENAI === "true",
    awsBedrock: process.env.ENABLE_AWS_BEDROCK === "true",
  },
  hfEndpoints: {
    token: process.env.HF_TOKEN || "",
    endpoint: process.env.HF_ENDPOINT || "",
  },
  openai: {
    token: process.env.OPENAI_TOKEN || "",
  },
};

// sanity check
if (Object.values(ENV_CONFIG.enable).every((v) => v === false)) {
  console.error(
    "[Error] No endpoints are enabled. Please enable at least one endpoint."
  );
  process.exit(1);
}

// config check for hf endpoints
if (
  ENV_CONFIG.enable.hfEndpoints &&
  (!ENV_CONFIG.hfEndpoints.token || !ENV_CONFIG.hfEndpoints.endpoint)
) {
  console.error(
    "[Error] Missing HF_TOKEN or HF_ENDPOINT env variable. Create a access token at https://huggingface.co/settings/tokens and/or copy the endpoint your interface of choice."
  );
  process.exit(1);
}

// config check for openai
if (ENV_CONFIG.enable.openai && !ENV_CONFIG.openai.token) {
  console.error(
    "[Error] Missing OPENAI_TOKEN env variable. Create a access token at https://beta.openai.com/account/api-keys"
  );
  process.exit(1);
}
