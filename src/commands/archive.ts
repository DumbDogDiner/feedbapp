import { Client, Collection, Guild, Message, MessageAttachment, TextChannel } from "discord.js";
import * as fs from "fs";

import * as ResponseBuilder from "../api/ResponseBuilder";

export const run = async (client: Client, msg: Message, args: string[]) => {
	const guild: Guild = client.guilds.cache.get(process.env.CHECK_GUILD!)!;
	let channel: TextChannel;

	if (args.length > 0) channel = guild.channels.cache.get(args[0]) as TextChannel;
	else channel = msg.channel as TextChannel;

	if (!channel || !guild) {
		ResponseBuilder.sendWarn("Could not fetch Channel.", msg);
		return;
	}

	if (!guild.me?.hasPermission("MANAGE_CHANNELS")) {
		ResponseBuilder.sendWarn("Bot does not have Permission to manage Channels!", msg);
		return;
	}

	if (!msg.member?.hasPermission("MANAGE_CHANNELS")) {
		ResponseBuilder.sendWarn("You don't have the required Permissions to run this command!", msg);
		return;
	}

	const allMessages: Message[] = [];
	let lastId = channel.id;

	while (true) {
		const fetched = await channel.messages.fetch({ after: lastId, limit: 100 });
		const sorted = [...fetched.sort((a, b) => a.createdTimestamp - b.createdTimestamp).values()];
		lastId = sorted[sorted.length - 1].id;

		allMessages.push(...sorted);
		if (fetched.size !== 100) break;
	}

	const content: string[] = [];
	allMessages.forEach((value: Message) => {
		let archivedMsg = `${value.author.tag} - ${new Date(value.createdTimestamp).toUTCString()}\n${
			value.content ? value.content : "[Empty Message]"
		}`;

		if (value.attachments) {
			value.attachments.forEach((attachment: MessageAttachment) => {
				archivedMsg = `${archivedMsg}\nAttachment: ${attachment.proxyURL}`;
			});
		}

		content.push(archivedMsg);
	});

	if (!fs.existsSync("./data")) {
		fs.mkdirSync("./data");
	}

	if (!fs.existsSync("./data/channel_logs")) {
		fs.mkdirSync("./data/channel_logs");
	}

	fs.writeFileSync(`./data/channel_logs/${channel.id}.txt`, content.join("\n \n"));

	ResponseBuilder.archiveNotice(msg, channel, "./data/channel_logs/${channel.id}.txt");
};
