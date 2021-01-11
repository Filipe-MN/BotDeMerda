import CommandHandler from "./command-handler.js"
import Discord from "discord.js";
import config from "./config.js";

const client = new Discord.Client();
client.login(config.BOT_TOKEN);

var commandHandler = new CommandHandler(client);
