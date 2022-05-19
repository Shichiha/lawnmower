import { Message } from "discord.js";
import Logger from "../util/Logger";
import sendToLog from "../util/sendToLog";
const c = new Logger("messageDelete", "red");

export default async function run(message: Message) {
    c.log(`Message by ${message.author?.tag || "unknown"} in ${message.channel.toString()} was deleted.`);
    c.trail(message.cleanContent);

    sendToLog(`Message deleted in ${message.channel.toString()}`, message.cleanContent, 'RED', message.author, message.client); // TODO: Add attachments
}