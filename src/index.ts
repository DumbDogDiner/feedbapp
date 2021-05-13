import Discord, { Client, DMChannel, Message, TextChannel } from "discord.js";
import { MessageType } from "./types";
import dotenv from "dotenv";

import * as ResponseBuilder from "./api/ResponseBuilder";

dotenv.config();

// Login to Discord
const client: Client = new Discord.Client();

client.login(process.env.TOKEN);

client.on("ready", () => {
	console.log("Watching for messages...");
});

// Await messages
client.on("message", async (message: Message) => {
	if(message.author.bot) return;

	if(!checkMessage(message, process.env.CHECK_GUILD!)) {
		console.log(`Received message from non-guild member ${message.author.id} - Skipping...`);

		if(message.channel.type == MessageType.PRIVATE) {
			ResponseBuilder.sendWarn('You may not interact with this bot!', message);
		}

		return;
	}

	if(message.channel.type == MessageType.PRIVATE)
		ResponseBuilder.logFeedback(client, message);
	else processCommand(message);

});

/// END DISCORD SETUP ///

/**
 * Check if a message is from a user that is in a certain guild
 * @param {*} message to log
 */
const checkMessage = async (message: Message, guildId: string) => {
	const guild = client.guilds.cache.get(guildId);
	// check if guild is undefined
	if (!guild) {
		throw new Error("Failed to access check guild");
	}
	let status: boolean;
	try {
		// what is this doing
		// const member = await guild.members.fetch(message.author.id);
		status = message.author.id != client.user!.id && true;
	} catch (err) {
		status = false;
	}

	return status;
};

function processCommand(msg: Discord.Message) {
	if(msg.content.startsWith(process.env.CMD_PREFIX!)) {
		const args: String[] = msg.content.slice(process.env.CMD_PREFIX!.length, msg.content.length).trim().split(/ +/g);
		const command = args.shift()!.toLowerCase();
	  
		try {
			delete require.cache[require.resolve(`./commands/${command}.ts`)];
			let commandFile = require(`./commands/${command}.ts`);
			commandFile.run(client, msg, args);
		
		} catch (e) {
			console.error(`\x1b[31mOh no! Something went wrong! ${e.stack}\x1b[0m`);
		}
	}
}

