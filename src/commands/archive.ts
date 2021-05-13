import { Client, Collection, Guild, Message, MessageAttachment, TextChannel } from "discord.js";
import { access, writeFile, mkdir } from "fs/promises";
import { constants } from "fs";

import * as ResponseBuilder from "../api/ResponseBuilder";

export const run = async (client: Client, msg: Message, args: string[]) => {
	const guild: Guild = client.guilds.cache.get(process.env.CHECK_GUILD!)!;
	let channel: TextChannel;

	if (args.length > 0) channel = guild.channels.cache.get(args[0]) as TextChannel;
	else channel = msg.channel as TextChannel;

	if (!channel || !guild) {
		ResponseBuilder.sendWarn(msg.channel as TextChannel, "Could not fetch Channel.");
		return;
	}

	if (!guild.me?.hasPermission("MANAGE_CHANNELS")) {
		ResponseBuilder.sendWarn(msg.channel as TextChannel, "Bot does not have Permission to manage Channels!");
		return;
	}

	if (!msg.member?.hasPermission("MANAGE_CHANNELS")) {
		ResponseBuilder.sendWarn(msg.channel as TextChannel, "You don't have the required Permissions to run this command!");
		return;
	}

	const allMessages: Message[] = [];
	let fetched = new Collection<string, Message>();

	let lastId = channel.id;

	while (fetched.size < 100) {
		fetched = await channel.messages.fetch({ after: lastId, limit: 100 });
		const sorted = [...fetched.sort((a, b) => a.createdTimestamp - b.createdTimestamp).values()];
		lastId = sorted[sorted.length - 1].id;

		allMessages.push(...sorted);
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

	if (!await checkFolder("./data")) {
		await mkdir("./data");
	}

	if (!await checkFolder("./data/channel_logs")) {
		await mkdir("./data/channel_logs");
	}

	await writeFile(`./data/channel_logs/${channel.id}.txt`, content.join("\n \n"));

	ResponseBuilder.archiveNotice(msg, channel);
};

async function checkFolder(relPath: string): Promise<boolean> {
	try {
		await access(relPath, constants.F_OK);
		return true;
	} catch {
		return false;
	}
}
