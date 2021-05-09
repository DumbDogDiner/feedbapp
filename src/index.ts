import {
	Channel,
	Client,
	DMChannel,
	Guild,
	GuildMember,
	Message,
	TextChannel,
} from "discord.js";

const Discord = require("discord.js");
require("dotenv").config();

// Login to Discord
const client: Client = new Discord.Client();

client.login(process.env.TOKEN);

client.on("ready", () => {
	console.log("Watching for messages...");
});

// Await messages
client.on("message", (message: Message) => {
	checkMessage(message, process.env.CHECK_GUILD)
		.then((isMember: boolean) => {
			if (message.channel.type != "dm") return; // DMs only please!

			// who are u
			if (!isMember) {
				console.log("Feedback received - User may not send feedback!");
				message.author
					.createDM()
					.then((dmChannel: DMChannel) => {
						dmChannel
							.send("You may not send feedback!")
							.catch((err) => {
								// ignore
							});
					})
					.catch((err) => {
						// ignore
					});
				return;
			}

			let feedbackChannel: Channel = client.guilds.cache
				.get(process.env.CHECK_GUILD)
				.channels.cache.get(process.env.FEEDBACK_CHANNEL);

			if (feedbackChannel.isText) {
				console.log(
					`Feedback received - Sending message to channel #${
						(feedbackChannel as TextChannel).name
					} (${feedbackChannel.id})`
				);
				(feedbackChannel as TextChannel).send(message.content);
			} else {
				console.log(
					`Channel ${feedbackChannel.id} is not a text channel!`
				);
			}
		})
		.catch((error: Error) => {
			console.log("There was an error! uwu");
		});
});

/// END DISCORD SETUP ///

/**
 * Check if a message is from a user that is in a certain guild
 * @param {*} message to log
 */
async function checkMessage(
	message: Message,
	guildId: string
): Promise<boolean> {
	let guild: Guild = client.guilds.cache.get(guildId);
	let status: boolean;
	await guild.members
		.fetch(message.author.id)
		.then((member: GuildMember) => {
			status = message.author.id != client.user.id && true;
		})
		.catch((err) => {
			status = false;
		});
	return status;
}
