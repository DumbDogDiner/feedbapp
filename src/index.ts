import Discord, { Client, DMChannel, Message, TextChannel } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

// Login to Discord
const client: Client = new Discord.Client();

client.login(process.env.TOKEN);

client.on("ready", () => {
	console.log("Watching for messages...");
});

// Await messages
client.on("message", async (message: Message) => {
	let isMember: boolean;
	try {
		isMember = await checkMessage(message, process.env.CHECK_GUILD!);
	} catch (_) {
		return;
	}

	if (message.channel.type != "dm") return; // DMs only please!

	// who are u
	if (!isMember) {
		console.log("Feedback received - User may not send feedback!");
		message.author
			.createDM()
			.then((dmChannel: DMChannel) => {
				// ignore
				dmChannel.send("You may not send feedback!").catch(console.error);
			})
			// ignore
			.catch(console.error);
		return;
	}
	// fetch the feedback guild from cache
	const feedbackGuild = client.guilds.cache.get(process.env.CHECK_GUILD!);
	if (!feedbackGuild) {
		throw new Error("Failed to access feedback guild");
	}
	// fetch feedback channel from cache
	const feedbackChannel = feedbackGuild.channels.cache.get(process.env.FEEDBACK_CHANNEL!);
	// check if feedback channel exists
	if (!feedbackChannel) {
		throw new Error("Failed to access feedback channel");
	}
	// check if is text channel
	if (!feedbackChannel.isText()) {
		return console.log(`Channel ${feedbackChannel.id} is not a text channel!`);
	}

	console.log(
		`Feedback received - Sending message to channel #${(feedbackChannel as TextChannel).name} (${
			feedbackChannel.id
		})`
	);
	(feedbackChannel as TextChannel).send(message.content);
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
