import Discord, { Channel, Client, Message, TextChannel } from "discord.js";

const warnColor = '#e3bb39';
const feedbapColor = '#4b94e3';
const successColor = '#33bd51';

export const sendWarn = (response: String, message: Message) => {
    const embed = new Discord.MessageEmbed()
        .setColor(warnColor)
        .setDescription(`⚠ ${response}`);

    message.channel.send(embed);
} 


export const sendSuccess = (response: String, message: Message) => {
    const embed = new Discord.MessageEmbed()
        .setColor(successColor)
        .setDescription(`✅ ${response}`);

    message.channel.send(embed);
} 

export const logFeedback = (client: Client, message: Message) => {
    if(message.content.length < 16) {
        sendWarn('Please be a little more descriptive!', message);
        return;
    }

    const embed = new Discord.MessageEmbed()
        .setColor(feedbapColor)
        .addField("New Feedback arrived!", message.content, false);

    const feedbackGuild = client.guilds.cache.get(process.env.CHECK_GUILD!);

    if (!feedbackGuild) {
		throw new Error("Failed to access feedback guild");
	}

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

    sendSuccess('Thank you, your feedback has been recorded', message);
    feedbackChannel.send(embed);
}

export const archiveNotice = (message: Message, archived: Discord.TextChannel, filePath: string) => {
    const uploadChannel: TextChannel = archived.guild.channels.cache.get(process.env.ARCHIVE_CHANNEL!) as TextChannel;
    const embed = new Discord.MessageEmbed()
        .setColor(feedbapColor)
        .setDescription(`⛓ Backup of Channel **${archived.name} (${archived.id})**`)
        .setAuthor(`${message.author.tag} archived a Channel!`, message.author.avatarURL()!)
        .addField('Issued By', `${message.author.tag}`, true)
        .addField('Issued At', `${new Date(message.createdTimestamp).toUTCString()}`, true);

    uploadChannel.send(embed);
    uploadChannel.send({ files: [{
        attachment: `./data/channel_logs/${archived.id}.txt`,
        name: `${archived.name}_${archived.id}.txt`
    }]}).then((_) => {
        console.log(`Archived Channel ${archived.id}`);
        archived.delete();
    });

}
